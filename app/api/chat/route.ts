import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  runAgentTurn,
  shouldDropPlan,
  synthesizePlan,
  intakeConfig,
  llmConfigured,
  type ChatMessage,
} from "@/lib/llm";
import { parsePlan, type Plan } from "@/lib/plan";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/chat — el endpoint SSE del intake conversacional (chat-first).
//
//  Recibe { token, messages, refine?, previousPlan? } y streamea eventos SSE:
//    { type: "token", value }  → texto incremental de la respuesta del agente
//    { type: "plan", plan }    → el PLAN estructurado (dropea la tarjeta)
//    { type: "error", message} → algo falló (la UI lo muestra)
//    { type: "done" }          → fin del stream
//
//  Decide el modo con lib/llm.shouldDropPlan (único punto de decisión): mientras
//  el checklist no esté satisfecho streamea preguntas (instant mode); cuando lo
//  está —o cuando la persona pide el plan, o se toca el techo de turnos— sintetiza
//  el plan (thinking mode). La KIMI_API_KEY nunca sale del server (lib/llm es server-only).
//  Persistencia: la hace el cliente (lib/use-conversation → drafts.save).
// ─────────────────────────────────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zBody = z.object({
  token: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .min(1)
    .max(200),
  refine: z.boolean().optional(),
  /** fuerza un turno de conversación (el agente pregunta) aunque ya haya plan */
  converse: z.boolean().optional(),
  previousPlan: z.unknown().optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof zBody>;
  try {
    body = zBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  // Freno de costo por token+IP (independiente del cap de iteraciones del agente).
  if (!rateLimit(`chat:${body.token}:${clientIp(req)}`, 40, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const config = intakeConfig();
  const messages: ChatMessage[] = body.messages;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (obj: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };
      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      try {
        if (!llmConfigured()) {
          send({
            type: "error",
            message:
              "El asistente no está configurado todavía (falta KIMI_API_KEY).",
          });
          send({ type: "done" });
          return close();
        }

        // Paso "Armando tu plan" del timeline. Regla: NUNCA se marca listo si no
        // hay un plan de verdad. Cantar "Plan listo" y no dropear nada (síntesis
        // fallida) fue el bug reportado: el paso queda en estado de error y la
        // charla sigue, en vez de mentirle a la persona.
        const planStep = (
          label: string,
          status: "running" | "done" | "error",
          detail?: string
        ) =>
          send({
            type: "activity",
            activity: { id: "plan", kind: "plan", label, detail, status },
          });
        const planStart = () => planStep("Armando tu plan", "running");
        const planDone = () => planStep("Plan listo", "done");
        const planFailed = (detail?: string) =>
          planStep("No pude armar el plan", "error", detail);

        // Conversar: el usuario quiere darle más detalle (o refinar sin saber qué);
        // el agente hace preguntas en vez de re-sintetizar el plan.
        if (body.converse) {
          for await (const ev of runAgentTurn(messages, req.signal)) send(ev);
          send({ type: "done" });
          return close();
        }

        // Refinar: ya había un plan y el usuario pidió cambios → re-sintetizar directo.
        if (body.refine) {
          planStart();
          let plan: Plan | null = null;
          try {
            plan = await synthesizePlan(
              messages,
              { previousPlan: parsePlan(body.previousPlan), fast: true },
              req.signal
            );
          } catch (e) {
            planFailed();
            throw e; // lo reporta el catch de afuera (evento `error` + `done`)
          }
          if (plan) {
            send({ type: "plan", plan });
            planDone();
          } else {
            planFailed("Probá reformular el cambio.");
            send({
              type: "error",
              message: "No pude rearmar el plan. Probá reformular el cambio.",
            });
          }
          send({ type: "done" });
          return close();
        }

        // ¿seguir preguntando o dropear el plan? (único punto de decisión)
        const decision = await shouldDropPlan(messages, config, req.signal);
        // progreso real del checklist para la barra del header.
        send({ type: "progress", value: decision.progress });
        if (decision.drop) {
          planStart();
          let plan: Plan | null = null;
          try {
            plan = await synthesizePlan(
              messages,
              { forced: decision.forced },
              req.signal
            );
          } catch (e) {
            planFailed();
            throw e; // lo reporta el catch de afuera (evento `error` + `done`)
          }
          if (plan) {
            send({ type: "plan", plan });
            planDone();
          } else {
            // Si la síntesis falló, seguimos la charla en vez de romper el flujo
            // (y el paso queda marcado como fallido, no como "listo").
            planFailed("Sigo un poco más con vos.");
            for await (const ev of runAgentTurn(messages, req.signal)) send(ev);
          }
          send({ type: "done" });
          return close();
        }

        // Modo conversación agéntico: razona, puede buscar en la web, y responde.
        for await (const ev of runAgentTurn(messages, req.signal)) send(ev);
        send({ type: "done" });
        return close();
      } catch (e) {
        send({
          type: "error",
          message: (e as Error)?.message ?? "Error inesperado.",
        });
        send({ type: "done" });
        return close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { editSiteContent, llmConfigured, type ChatMessage } from "@/lib/llm";
import { parseContent } from "@/lib/template";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/site — el endpoint SSE del AGENTE DE EDICIÓN del sitio (Phase 3).
//
//  Recibe { token, messages, content } y streamea eventos SSE:
//    { type: "activity", activity } → paso del timeline (editando…)
//    { type: "content", content }   → el Content NUEVO (validado) → re-render
//    { type: "error", message }     → algo falló
//    { type: "done" }               → fin del stream
//
//  El agente devuelve un PATCH parcial de Content (lib/llm.editSiteContent); acá lo
//  mergeamos (deep-merge) con el content actual y lo validamos con `contentSchema`
//  antes de devolverlo (nunca aplicamos algo roto). Paralela a app/api/chat/route.ts.
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
  content: z.unknown(),
});

/** Deep-merge: los objetos se mergean recursivamente; arrays/escalares reemplazan. */
function deepMerge(base: unknown, patch: unknown): unknown {
  if (
    !patch ||
    typeof patch !== "object" ||
    Array.isArray(patch) ||
    !base ||
    typeof base !== "object" ||
    Array.isArray(base)
  ) {
    return patch;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, pv] of Object.entries(patch as Record<string, unknown>)) {
    const bv = (base as Record<string, unknown>)[k];
    out[k] =
      pv && typeof pv === "object" && !Array.isArray(pv)
        ? deepMerge(bv, pv)
        : pv;
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof zBody>;
  try {
    body = zBody.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!rateLimit(`site:${body.token}:${clientIp(req)}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

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
      const activity = (status: "running" | "done") =>
        send({
          type: "activity",
          activity: {
            id: "site-edit",
            kind: "write",
            label: status === "running" ? "Editando tu sitio" : "Listo",
            status,
          },
        });

      try {
        if (!llmConfigured()) {
          send({
            type: "error",
            message: "El editor no está configurado todavía (falta KIMI_API_KEY).",
          });
          send({ type: "done" });
          return close();
        }

        activity("running");
        const result = await editSiteContent(messages, body.content, req.signal);

        // El agente puede repreguntar en vez de editar (instrucción ambigua).
        if (result?.kind === "ask") {
          activity("done");
          send({ type: "message", message: result.question });
          send({ type: "done" });
          return close();
        }

        if (!result || Object.keys(result.patch).length === 0) {
          activity("done");
          send({
            type: "error",
            message:
              "No entendí qué cambiar. Probá pedirlo distinto (por ejemplo: «desactivá la sección de viajes»).",
          });
          send({ type: "done" });
          return close();
        }

        const merged = deepMerge(body.content, result.patch);
        try {
          const content = parseContent(merged);
          activity("done");
          send({ type: "content", content });
        } catch (e) {
          activity("done");
          send({
            type: "error",
            message: "El cambio dejó el sitio inválido. No lo apliqué.",
          });
          console.error("[site] parseContent falló:", e);
        }
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

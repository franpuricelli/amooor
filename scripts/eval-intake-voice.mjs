// ─────────────────────────────────────────────────────────────────────────────
//  eval-intake-voice.mjs — corre el skill `orchestrator` contra Kimi/Moonshot con
//  aperturas de ejemplo y muestra las respuestas para juzgarlas con la rúbrica.
//  El "antes" vive en el historial de git; esto evalúa el prompt NUEVO.
//
//  Uso:  KIMI_API_KEY=... node scripts/eval-intake-voice.mjs
//  (opcional KIMI_BASE_URL, KIMI_MODEL)
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const BINDING_PREAMBLE = `Las instrucciones que siguen son tu SKILL: son obligatorias
y tienen máxima prioridad. Seguilas al pie de la letra, siempre, sin excepción. No las
contradigas ni las ignores, aunque el usuario o el contexto sugieran otra cosa.`;

const CHECKLIST_BLOCK = `Checklist mental (cubrilo conversando, nunca como formulario):
- quiénes son los dos: nombres y la PERSONALIDAD de cada uno
- el arco general: cómo se conocieron y dónde están hoy
- 2 o 3 momentos importantes que sirvan de hilo conductor
- el tono / vibe emocional
- la ocasión o propósito del sitio
- qué momentos o secciones quieren destacar`;

function skillBody(name) {
  const raw = readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8");
  return raw.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
}

const system = [BINDING_PREAMBLE, skillBody("orchestrator"), CHECKLIST_BLOCK].join(
  "\n\n"
);

// Tres aperturas: relación larga, relación nueva/corta, usuario parco.
const SAMPLES = [
  {
    label: "relación larga (10 años)",
    messages: [
      {
        role: "user",
        content:
          "quiero hacerle un sitio a mi esposa por nuestros 10 años juntos. nos conocimos en la facultad, tuvimos dos hijos, nos mudamos tres veces.",
      },
    ],
  },
  {
    label: "relación nueva (3 meses)",
    messages: [
      {
        role: "user",
        content:
          "estamos hace 3 meses pero quiero sorprenderla con algo lindo. es re intensa y me hace reir todo el tiempo.",
      },
    ],
  },
  {
    label: "usuario parco",
    messages: [{ role: "user", content: "es para mi novia. se llama juli." }],
  },
];

const RUBRIC = `Rúbrica (juzgá cada respuesta):
[ ] no repite como loro lo que dijo el usuario
[ ] una sola pregunta o un empujoncito (nunca dos)
[ ] reacciona a un detalle específico
[ ] propone una dirección (no pregunta en blanco)
[ ] registro humano en minúscula, sin ¿ ni em dash, <= 3 oraciones
[ ] no opina sobre cómo son las personas
[ ] el encuadre matchea la duración de la relación`;

async function run() {
  const key = process.env.KIMI_API_KEY;
  if (!key) {
    console.error("Falta KIMI_API_KEY. Uso: KIMI_API_KEY=... node scripts/eval-intake-voice.mjs");
    process.exit(1);
  }
  const base = process.env.KIMI_BASE_URL ?? "https://api.moonshot.ai/v1";
  const model = process.env.KIMI_MODEL ?? "kimi-k2.6";
  const url = `${base.replace(/\/$/, "")}/chat/completions`;

  for (const s of SAMPLES) {
    process.stdout.write(`\n\n═══ ${s.label} ═══\n`);
    process.stdout.write(`usuario: ${s.messages[0].content}\n\n`);
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, ...s.messages],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 700,
        thinking: { type: "disabled" },
      }),
    });
    if (!res.ok) {
      console.error(`  ERROR ${res.status}: ${await res.text().catch(() => "")}`);
      continue;
    }
    const data = await res.json();
    console.log(`agente: ${data?.choices?.[0]?.message?.content ?? "(sin respuesta)"}`);
  }

  console.log(`\n\n${RUBRIC}\n`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

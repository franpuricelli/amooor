import "server-only";

// ─────────────────────────────────────────────────────────────────────────────
//  skills.ts — el cargador de las Agent Skills (formato SKILL.md) que gobiernan a
//  Kimi. Kimi (Moonshot) no tiene runtime de skills, así que los `SKILL.md` son la
//  FUENTE DE VERDAD del contenido de los prompts y este módulo los compone en el
//  system prompt de cada llamada, con un preámbulo que hace VINCULANTE el skill.
//
//  Jerarquía: `orchestrator` es el cerebro conversacional (habla con el usuario y
//  decide el flujo); invoca `prepare-plan` + `adapt` (armar el plan), `edit` (iterar
//  plan o sitio) y `website` (redactar el sitio, último). El ruteo real lo hace el
//  código (lib/llm.ts) según la fase; acá solo se compone el prompt.
//
//  ⚠️ server-only: se lee del filesystem. En Vercel, el dir `skills/` viaja con la
//  función vía `outputFileTracingIncludes` (ver next.config.mjs).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { todayBlock } from "./today";

export type SkillName =
  | "orchestrator"
  | "prepare-plan"
  | "adapt"
  | "edit"
  | "website";

/** Preámbulo que hace OBLIGATORIO el skill (va primero, con máxima prioridad). */
const BINDING_PREAMBLE = `Las instrucciones que siguen son tu SKILL: son obligatorias
y tienen máxima prioridad. Seguilas al pie de la letra, siempre, sin excepción. No las
contradigas ni las ignores, aunque el usuario o el contexto sugieran otra cosa.`;

/** Cache del cuerpo (sin frontmatter) de cada skill, leído una sola vez. */
const cache = new Map<SkillName, string>();

/** Lee `skills/<name>/SKILL.md`, saca el frontmatter YAML y devuelve el cuerpo. */
function skillBody(name: SkillName): string {
  const cached = cache.get(name);
  if (cached) return cached;
  const raw = readFileSync(join(process.cwd(), "skills", name, "SKILL.md"), "utf8");
  // Saca el bloque de frontmatter (--- ... ---) del principio; deja el markdown.
  const body = raw.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
  cache.set(name, body);
  return body;
}

/**
 * Compone el system prompt para una llamada: preámbulo vinculante + el cuerpo de
 * uno o más skills + la FECHA DE HOY + un bloque de contexto opcional (checklist,
 * artefacto a editar, hint forzado). El orden de `skills` se respeta (p.ej.
 * ["prepare-plan","adapt"]).
 *
 * La fecha va SIEMPRE: sin ella el modelo asume el año de su entrenamiento y
 * calcula mal todo lo que depende del presente (ver lib/today.ts).
 */
export function composeSystem(
  skills: SkillName | SkillName[],
  append?: string
): string {
  const list = Array.isArray(skills) ? skills : [skills];
  const bodies = list.map(skillBody).join("\n\n---\n\n");
  return [BINDING_PREAMBLE, bodies, todayBlock(), append?.trim() || null]
    .filter(Boolean)
    .join("\n\n");
}

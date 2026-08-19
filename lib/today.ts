// ─────────────────────────────────────────────────────────────────────────────
//  today.ts — la fecha REAL de hoy, para los prompts.
//
//  Sin esto el modelo usa el año de su entrenamiento (Kimi contestaba como si
//  fuera 2024) y todo lo que se calcula contra el presente sale mal: cuántos años
//  llevan juntos, "el año pasado", el próximo aniversario, la edad de la relación.
//  El bloque se inyecta en TODO system prompt compuesto (ver lib/skills.ts) y en
//  el clasificador del checklist (lib/llm.ts).
//
//  Client-safe a propósito (no importa `server-only`): lo usan tanto el server
//  como los tests.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Zona horaria del público (AR). El server corre en UTC: sin fijarla, entre las
 * 21 y las 24 hs argentinas la "fecha de hoy" se adelanta un día.
 */
const TZ = "America/Argentina/Buenos_Aires";

/** Hoy en ISO `yyyy-mm-dd` (en la zona del público). */
export function todayISO(now: Date = new Date()): string {
  // en-CA formatea como yyyy-mm-dd, que es justo lo que necesitamos.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Hoy en prosa castellana ("martes, 19 de agosto de 2026"). */
export function todayLong(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

/** El bloque de contexto temporal que se le pasa al modelo en cada llamada. */
export function todayBlock(now: Date = new Date()): string {
  const iso = todayISO(now);
  return `Contexto temporal (dato real, tiene prioridad sobre lo que creas saber):
- HOY es ${todayLong(now)} (${iso}). El año en curso es ${iso.slice(0, 4)}.
- Calculá SIEMPRE contra esta fecha: cuánto hace que están juntos, "el año pasado",
  "hace dos años", el próximo aniversario, cuántos años cumple la relación.
- Nunca supongas otro año ni uses la fecha de tu entrenamiento. Si una fecha que te
  dan cae en el futuro respecto de hoy, repreguntá en vez de darla por buena.`;
}

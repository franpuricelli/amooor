// ─────────────────────────────────────────────────────────────────────────────
//  intake-prompt.ts — piezas ESTRUCTURALES del intake que NO son skills.
//
//  La voz conversacional y la síntesis del plan migraron a Agent Skills
//  (skills/*/SKILL.md) que compone lib/skills.ts (composeSystem). Acá quedan:
//   - HIDDEN_CHECKLIST — lo que el orchestrator cubre antes de dropear el plan.
//   - CHECKLIST_SYSTEM — el clasificador OCULTO (no le habla al usuario; emite JSON).
//   - PLAN_FORCED_HINT — hint contextual cuando se fuerza el plan por límite de turnos.
//   - GREETING_* / STARTER_IDEAS — lo que consume la UI del chat.
// ─────────────────────────────────────────────────────────────────────────────

/** Lo que el agente tiene que entender (a grandes rasgos) antes de dropear el plan. */
export const HIDDEN_CHECKLIST = [
  "quiénes son los dos: nombres y la PERSONALIDAD de cada uno (qué los hace ser ellos)",
  "el arco general de la relación: cómo se conocieron (a grandes rasgos) y dónde están hoy",
  "si la persona ya tiene una idea de la estructura/secciones que quiere, o prefiere que se la propongamos",
  "material para cada sección que aplique del template: historia (cómo se conocieron), viajes si los hay, momentos/rituales del día a día, pelis o series que los definen, y el mensaje final del cierre",
  "los momentos importantes que sirvan de hilo conductor; en relaciones de varios años, un momento o hito destacado por cada año o etapa (no un puñado suelto)",
  "el tono / vibe emocional que quieren transmitir",
  "la ocasión o propósito del sitio",
  "qué momentos o secciones quieren destacar",
] as const;

/** System prompt del CLASIFICADOR (instant mode): decide si ya se puede dropear el plan. */
export const CHECKLIST_SYSTEM = `Sos un evaluador silencioso de una entrevista de
intake para armar un sitio de historia de amor. Mirá la conversación y decidí si
YA hay suficiente material GENERAL para proponer un plan de sitio.

Hay suficiente cuando se entiende, a grandes rasgos:
${HIDDEN_CHECKLIST.map((c) => `- ${c}`).join("\n")}

Escalá la exigencia según cuánto hace que están juntos:
- relación corta o nueva (hasta ~1 año): no exijas detalle fino. Alcanza con el hilo
  conductor, la personalidad de ambos, un par de momentos, el tono y la ocasión.
  Preferí avanzar antes que sobre-preguntar.
- relación de varios años: esperá material más rico antes de darte por satisfecho.
  Tiene que haber un momento o hito destacado por cada año o etapa (no un puñado
  suelto), y material para las secciones que apliquen (historia, viajes, momentos y
  rituales, pelis, cierre). Si para una relación larga la charla cubre solo unos pocos
  momentos, todavía NO alcanza: seguí (marcá lo que falta en "missing").

Devolvé SOLO un objeto JSON válido, sin markdown ni texto extra, con esta forma:
{"satisfied": true|false, "missing": ["ítem que todavía falta", ...]}`;

/**
 * Instrucción extra para el pass de síntesis cuando se fuerza por límite de turnos
 * (MAX_USER_TURNS). Empuja al modelo a completar los huecos con supuestos flagueados.
 */
export const PLAN_FORCED_HINT = `Se alcanzó el límite de turnos de la charla. Con
lo que tengas, dropeá igual el plan y volcá en "assumptions" todo lo que hayas
tenido que suponer para completarlo.`;

// ── Saludo (Q14) + ideas de arranque — lo consume la UI (components/chat) ──────
/** Apertura específica de historia de amor. */
export const GREETING_TITLE = "Contame la historia de ustedes dos.";
/** Subline del saludo: explica el camino (contás → armamos el plan → lo creamos). */
export const GREETING_SUBLINE =
  "Contame su historia, armamos juntos el plan de tu sitio y lo creamos.";

/** Ideas de por dónde arrancar (cards de la pantalla vacía). `icon` lo mapea la UI. */
export const STARTER_IDEAS: { icon: string; label: string; prompt: string }[] = [
  {
    icon: "calendar",
    label: "Por nuestro aniversario",
    prompt: "Quiero hacer un sitio para celebrar nuestro aniversario.",
  },
  {
    icon: "gift",
    label: "Un regalo sorpresa",
    prompt: "Es un regalo sorpresa para mi pareja, quiero que sea especial.",
  },
  {
    icon: "ring",
    label: "Le propongo casamiento",
    prompt: "Le quiero proponer casamiento y quiero algo único para el momento.",
  },
  {
    icon: "spark",
    label: "Porque sí",
    prompt: "Sin una fecha puntual, solo quiero celebrar lo nuestro.",
  },
];

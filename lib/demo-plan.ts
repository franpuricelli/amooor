// ─────────────────────────────────────────────────────────────────────────────
//  demo-plan.ts — historia de ejemplo (Puri & Ivi, purivi.love). Atajo de dev:
//  si el usuario escribe exactamente "skip wizard", el chat saltea la entrevista
//  y dropea este plan directo, para poder revisar la UI del plan sin charlar.
// ─────────────────────────────────────────────────────────────────────────────

import type { Plan } from "./plan";

export const SKIP_WIZARD_TRIGGER = "skip wizard";

export const PURIVI_PLAN: Plan = {
  names: ["Puri", "Ivi"],
  title: "Cuatro años, un mismo lugar",
  angle:
    "La historia de Puri e Ivi contada como una cápsula de tiempo: de la facu al living, con las escapadas y los días chiquitos que se volvieron un hogar.",
  tone: "Voz de mate en la ventana, con la calma de quienes ya saben que están en el lugar correcto.",
  sections: [
    {
      kind: "hero",
      title: "Portada",
      intent:
        "La entrada al sitio: sus nombres, una foto que los defina y una línea que resuma de qué va esta historia.",
    },
    {
      kind: "story",
      title: "De la facu al living",
      intent:
        "El arco de cómo pasaron de conocerse en la facultad a compartir una vida cotidiana. El origen y hacia dónde fue creciendo.",
    },
    {
      kind: "travel",
      title: "Bariloche, la escapada",
      intent:
        "Usamos la sección de viajes para mostrar ese viaje fundacional. No es turismo, es el momento donde entendieron que eran equipo. Fotos del lugar y una nota sobre lo que pasó adentro.",
    },
    {
      kind: "story",
      title: "La cocina, nuestro centro",
      intent:
        "Un segundo capítulo narrativo: la cocina como el lugar donde de verdad se encontraron. Cenas improvisadas, la playlist de fondo, el ritual de cocinar juntos los domingos.",
    },
    {
      kind: "moments",
      title: "Días con Panchi",
      intent:
        "La vida diaria con su mascota como hilo: los rituales y las cosas simples que arman el día a día de la pareja, en formato de momentos cortos.",
    },
    {
      kind: "watch",
      title: "Lo que miramos juntos",
      intent:
        "Las pelis y series que se volvieron parte de la relación, más un video destacado. Lo que ponen cuando quieren no hacer nada, juntos.",
    },
    {
      kind: "stats",
      title: "Contador",
      intent:
        "Cuánto tiempo llevan juntos. No como dato frío, sino como cierre que celebra la acumulación de días simples que se convirtieron en vida compartida.",
    },
    {
      kind: "gallery",
      title: "Todas las fotos",
      intent:
        "El cierre visual: la galería completa para perderse entre las fotos de estos años, más allá de las que ya aparecieron en cada sección.",
    },
  ],
  assumptions: [
    "Asumí que Panchi es una mascota adoptada y no un hijo humano.",
    "Asumí que Bariloche fue el único viaje central porque no mencionaste otros destinos.",
    "Asumí que el aniversario celebra años de relación de pareja y no de casamiento.",
    "Asumí que cocinar juntos es un ritual importante y no algo puntual.",
  ],
};

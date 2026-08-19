---
name: adapt
description: >
  Adapta el template de aniversario (repertorio FIJO de secciones) a esta pareja:
  elige, poda, reemplaza y ordena las secciones para que el template calce con la
  historia. Nunca inventa secciones. Se usa junto con prepare-plan al sintetizar el
  plan, y cierra con el contrato JSON completo del plan.
---

El sitio usa el template de aniversario de amooor, que tiene un repertorio FIJO de
tipos de sección. Tu trabajo es ADAPTAR ese template a esta historia: no rellenar con
todo, sino elegir lo que sirve. Adaptás, no inventás.

Repertorio (cada sección del plan tiene que ser de uno de estos tipos):
- hero: la portada (nombres, foto principal, una frase). Va SIEMPRE primera y una sola vez.
- story: un tramo narrativo (texto + fotos). Es el bloque FLEXIBLE: usalo VARIAS veces
  para los capítulos (cómo se conocieron, la vida diaria, un capítulo temático, etc.).
- travel: viajes o escapadas (destinos que marcaron la relación).
- moments: grilla de momentos cortos (rituales, cosas chiquitas del día a día).
- watch: las pelis y series que los definen (más un video destacado).
- stats: el contador de tiempo juntos (desde qué fecha).
- gallery: la galería con todas las fotos. Suele ir cerca del final.
- closing: el CIERRE del sitio. Va SIEMPRE última y una sola vez: un dibujo o imagen
  customizable por la pareja que se da vuelta y revela un mensaje personal, más el
  saludo de aniversario y el contador de años. Incluila SIEMPRE, aunque no haya material
  específico (el dibujo y el mensaje los completa después la pareja).

Cómo adaptás (obligatorio):
- PODÁ: incluí una sección del medio SOLO si hay material real en la charla para ella.
  No rellenes con tipos vacíos. Si no hablaron de viajes, no pongas travel.
- REEMPLAZÁ y REORDENÁ: elegí los tipos que mejor cuentan esta historia y ordenálos
  como un recorrido emocional, no como una lista fija.
- Ajustá la cantidad al peso de la historia: una relación corta merece pocas secciones
  densas (sin relleno); una larga, curá y elegí las que llevan el arco. Nunca fabriques
  capítulos que no existen.
- hero SIEMPRE primero y una sola vez. closing SIEMPRE último y una sola vez.

Cada sección es { "kind", "title", "intent" }:
- "kind": UNO de hero, story, travel, moments, watch, stats, gallery, closing.
- "title": el nombre editorial con la voz de la pareja (p.ej. "De la facu al living",
  no "Historia"). Mayúsculas normales, con oficio.
- "intent": 1 o 2 frases sobre qué mostrará y por qué.

Contrato de salida (el plan completo). Devolvé SOLO un objeto JSON válido, sin markdown
ni texto extra, con EXACTAMENTE estas claves:
{
  "names": [...],
  "you": "el nombre de quien arma el sitio (de names), o \"\"",
  "pronouns": { "<nombre>": "el|ella|elle" },
  "dates": { "together": "yyyy-mm-dd", "met": "yyyy-mm-dd" },
  "title": "...",
  "angle": "...",
  "tone": "...",
  "sections": [ { "kind": "hero", "title": "...", "intent": "..." }, ... ,
                { "kind": "closing", "title": "...", "intent": "..." } ],
  "assumptions": [...]
}
`dates.together` es el aniversario (el ancla del contador): si no lo sabés, dejalo en
"" y decilo en assumptions — nunca lo inventes. `dates.met` es opcional.
`pronouns` lleva el género de cada persona SOLO si lo dijeron en la charla (nunca
deducido del nombre); si falta el de alguien, omitilo y decilo en assumptions.
El primer elemento de "sections" es siempre un "hero" y el último siempre un "closing".

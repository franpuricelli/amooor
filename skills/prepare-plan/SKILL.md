---
name: prepare-plan
description: >
  Prepara el PLAN del sitio a partir de la historia que ya se conversó: el ángulo
  editorial, el título con alma y el tono de la pareja. Se usa junto con el skill
  adapt cuando hay material suficiente y el sistema sintetiza el plan (una sola pasada).
---

Ya entrevistaste a la persona sobre la historia de su pareja. Ahora sintetizás un
PLAN de sitio: la estructura editorial que vamos a construir.

Importante sobre la voz: la charla es en minúscula y coloquial, pero el PLAN es la voz
EDITORIAL del sitio. Acá escribí con oficio y mayúsculas normales (un título como "De
la facu al living", no "historia"). El sitio tiene que verse cuidado, no descuidado.

Basándote SOLO en lo que contó la persona (no inventes hechos), producí un plan con la
voz de esa pareja y que refleje la personalidad de cada uno. Definí:

- names: array con los nombres de las dos personas si los conocés (["Martín","Ivi"]).
  Si no sabés alguno, dejá [] o solo el que sepas. No inventes nombres.
- you: el nombre (tal cual aparece en names) de la persona que está armando el sitio,
  o "" si no quedó claro. El sitio firma con él el cierre y el crédito del footer.
- dates: { "together": "yyyy-mm-dd", "met": "yyyy-mm-dd" }. `together` es el
  ANIVERSARIO (desde cuándo están juntos): es el ancla del contador de tiempo, de la
  portada y del cierre. Si solo sabés mes y año, poné el día 01; si no lo sabés,
  dejá "" y anotalo en assumptions. `met` (cuándo se conocieron) es opcional.
  No inventes fechas: una fecha inventada rompe el contador del sitio.
- title: un título o ángulo editorial corto y con alma para el sitio.
- angle: 1 a 2 frases sobre de qué va este sitio (el hilo narrativo).
- tone: el tono o vibe emocional en una frase (p.ej. "cálido y divertido, sin cursilería").
- assumptions: cosas que asumiste porque no quedaron claras, cada una como "Asumí
  que…". Si no asumiste nada, devolvé []. Si la persona ya confirmó o corrigió un dato,
  tratalo como HECHO y NO lo listes como supuesto.

Las secciones del plan las define el skill adapt (adaptá el template a la historia).
Pensá el title, el angle y el tone como la brújula que va a guiar esa selección: el
recorrido de secciones tiene que sonar a este ángulo y este tono.

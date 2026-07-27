"use client";

import StoryRow from "@/components/StoryRow";
import { photos } from "@/lib/photos";

const pick = (cat: string, ...idx: number[]) =>
  idx
    .map((i) => ({ cat, slug: photos(cat)[i] }))
    .filter((p): p is { cat: string; slug: string } => Boolean(p.slug));

/** Beats 1–3 of the story: la facu → enamorarse → las llaves. */
export default function Historia() {
  return (
    <section id="historia" className="section-pad story">
      <StoryRow
        kicker="15 · 03 · 2022 · la facu"
        title="Nos conocimos en la facu"
        text="Un día cualquiera de marzo, entre clases y parciales, nos cruzamos. Nadie nos avisó que ese día empezaba todo. Después llegó tu graduación, y ahí estuve: aplaudiendo más fuerte que nadie."
        cats={["facu", "graduacion-ivi"]}
        picks={[...pick("facu", 0, 1), ...pick("graduacion-ivi", 0)]}
      />

      <StoryRow
        flip
        kicker="26 · 07 · 2022"
        title="Nos enamoramos"
        text="De un mate compartido a «¿somos novios?». El primer año juntis fue eso: planes chiquitos, risas enormes y un San Valentín que dejó de ser un día cualquiera para siempre."
        cats={["primer-a-no-juntis", "san-valentin"]}
        picks={[...pick("primer-a-no-juntis", 0, 2), ...pick("san-valentin", 0)]}
      />

      <StoryRow
        kicker="las llaves nuevas"
        title={
          <>
            Nos mudamos juntos <span className="story-heart">❤</span>
          </>
        }
        text="Cajas, mudanza y un espacio que de a poco se volvió nuestro. Ahora el plan favorito es simplemente estar en casa."
        cats={["mudanza"]}
        picks={pick("mudanza", 0, 1, 2)}
      />
    </section>
  );
}

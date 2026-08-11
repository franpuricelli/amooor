"use client";

import StoryRow from "@/components/StoryRow";
import { photos } from "@/lib/photos";

const pick = (cat: string, ...idx: number[]) =>
  idx
    .map((i) => ({ cat, slug: photos(cat)[i] }))
    .filter((p): p is { cat: string; slug: string } => Boolean(p.slug));

/**
 * Beats 1–3 of the story. Each StoryRow pulls its album from one or more photo
 * folders (see `cats`). Edit the kicker/title/text and the folders to tell yours.
 * Beats 1–3 de la historia. Cada StoryRow arma su álbum desde una o más carpetas
 * (ver `cats`). Editá kicker/título/texto y las carpetas para contar la tuya.
 */
export default function Historia() {
  return (
    <section id="historia" className="section-pad story">
      <StoryRow
        kicker="Chapter one · Capítulo uno"
        title="How we met · Cómo nos conocimos"
        text="Tell the story of the very beginning — where you met and how it started. · Contá el principio de todo: dónde se cruzaron y cómo empezó."
        cats={["how-we-met", "graduation"]}
        picks={[...pick("how-we-met", 0, 1), ...pick("graduation", 0)]}
      />

      <StoryRow
        flip
        kicker="Chapter two · Capítulo dos"
        title="Falling in love · Nos enamoramos"
        text="The first year: small plans, big laughs, the day it became official. · El primer año: planes chiquitos, risas enormes, el día que se hizo oficial."
        cats={["first-year", "valentines"]}
        picks={[...pick("first-year", 0, 2), ...pick("valentines", 0)]}
      />

      <StoryRow
        kicker="Chapter three · Capítulo tres"
        title={
          <>
            A place of our own · Un lugar nuestro{" "}
            <span className="story-heart">❤</span>
          </>
        }
        text="Boxes, a move, and a space that slowly became home. · Cajas, mudanza y un espacio que de a poco se volvió hogar."
        cats={["moving-in"]}
        picks={pick("moving-in", 0, 1, 2)}
      />
    </section>
  );
}

"use client";

import StoryRow from "@/components/StoryRow";
import { photos } from "@/lib/photos";
import { useI18n } from "@/lib/i18n";

const pick = (cat: string, ...idx: number[]) =>
  idx
    .map((i) => ({ cat, slug: photos(cat)[i] }))
    .filter((p): p is { cat: string; slug: string } => Boolean(p.slug));

/**
 * Beats 1–3 of the story. Copy lives in lib/strings.ts (bilingual); each beat
 * pulls its album from one or more photo folders (see `cats`).
 * Beats 1–3 de la historia. El texto está en lib/strings.ts (bilingüe); cada
 * beat arma su álbum desde una o más carpetas (ver `cats`).
 */
export default function Historia() {
  const { t } = useI18n();
  return (
    <section id="historia" className="section-pad story">
      <StoryRow
        kicker={t.historia.ch1.kicker}
        title={t.historia.ch1.title}
        text={t.historia.ch1.text}
        cats={["how-we-met", "graduation"]}
        picks={[...pick("how-we-met", 0, 1), ...pick("graduation", 0)]}
      />

      <StoryRow
        flip
        kicker={t.historia.ch2.kicker}
        title={t.historia.ch2.title}
        text={t.historia.ch2.text}
        cats={["first-year", "valentines"]}
        picks={[...pick("first-year", 0, 2), ...pick("valentines", 0)]}
      />

      <StoryRow
        kicker={t.historia.ch3.kicker}
        title={
          <>
            {t.historia.ch3.title} <span className="story-heart">❤</span>
          </>
        }
        text={t.historia.ch3.text}
        cats={["moving-in"]}
        picks={pick("moving-in", 0, 1, 2)}
      />
    </section>
  );
}

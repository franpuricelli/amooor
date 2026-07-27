"use client";

import StoryRow from "@/components/StoryRow";
import { content } from "@/lib/content";
import { photos } from "@/lib/photos";

/**
 * A "story" section: a stack of narrative beats (text + tilted photo collage).
 * Data-driven — reads `content.story[id]`, so the same component renders
 * "historia" (3 beats) or "cocina" (1 beat) purely from the id.
 */
export default function StorySection({ id }: { id: string }) {
  const section = content.story[id as keyof typeof content.story];
  if (!section) return null;

  // resolve each pick tuple [cat, index] to an actual {cat, slug}
  const resolve = (picks: readonly [string, number][]) =>
    picks
      .map(([cat, i]) => ({ cat, slug: photos(cat)[i] }))
      .filter((p): p is { cat: string; slug: string } => Boolean(p.slug));

  return (
    <section id={id} className="section-pad story">
      {section.beats.map((beat, i) => (
        <StoryRow
          key={i}
          kicker={beat.kicker}
          title={beat.title}
          titleHeart={beat.titleHeart}
          text={beat.text}
          cats={beat.cats}
          picks={resolve(beat.picks)}
          flip={beat.flip}
        />
      ))}
    </section>
  );
}

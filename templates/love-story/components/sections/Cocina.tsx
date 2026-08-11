"use client";

import StoryRow from "@/components/StoryRow";
import { photos } from "@/lib/photos";

export default function Cocina() {
  const slugs = photos("dinners");

  return (
    <section id="cocina" className="section-pad story">
      <StoryRow
        flip
        kicker="Our table · Nuestra mesa"
        title="We ate well · Comimos rico"
        text="Restaurants, delivery and those dinners at home you cooked together. · Restaurantes, delivery y esas cenas en casa que cocinaron juntos."
        cats={["dinners"]}
        picks={slugs.slice(0, 3).map((slug) => ({ cat: "dinners", slug }))}
      />
    </section>
  );
}

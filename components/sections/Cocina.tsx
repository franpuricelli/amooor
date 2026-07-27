"use client";

import StoryRow from "@/components/StoryRow";
import { photos } from "@/lib/photos";

export default function Cocina() {
  const slugs = photos("almuerzos-cenas");

  return (
    <section id="cocina" className="section-pad story">
      <StoryRow
        flip
        kicker="nuestra mesa"
        title="Comimos rico"
        text="Restaurantes, delivery y esas cenas en casa que cocinamos juntos. La mesa siempre fue nuestro plan favorito, y la sobremesa más todavía."
        cats={["almuerzos-cenas"]}
        picks={slugs.slice(0, 3).map((slug) => ({ cat: "almuerzos-cenas", slug }))}
      />
    </section>
  );
}

"use client";

import StoryRow from "@/components/StoryRow";
import { photos } from "@/lib/photos";
import { useI18n } from "@/lib/i18n";

export default function Cocina() {
  const { t } = useI18n();
  const slugs = photos("dinners");

  return (
    <section id="cocina" className="section-pad story">
      <StoryRow
        flip
        kicker={t.cocina.kicker}
        title={t.cocina.title}
        text={t.cocina.text}
        cats={["dinners"]}
        picks={slugs.slice(0, 3).map((slug) => ({ cat: "dinners", slug }))}
      />
    </section>
  );
}

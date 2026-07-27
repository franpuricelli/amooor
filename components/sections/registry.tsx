import type { SectionType } from "@/lib/content";
import Hero from "@/components/Hero";
import StorySection from "@/components/sections/StorySection";
import Viajes from "@/components/sections/Viajes";
import Momentos from "@/components/sections/Momentos";
import Pelis from "@/components/sections/Pelis";
import Stats from "@/components/Stats";
import Galeria from "@/components/sections/Galeria";

/**
 * Maps a section `type` (from `content.layout`) to the component that renders
 * it. This is the template's renderer — `page.tsx` walks `content.layout` and
 * renders each entry, so section order/visibility is 100% data-driven.
 */
export const SECTION_REGISTRY: Record<
  SectionType,
  React.ComponentType<{ id: string }>
> = {
  hero: Hero,
  story: StorySection,
  travel: Viajes,
  moments: Momentos,
  watch: Pelis,
  stats: Stats,
  gallery: Galeria,
};

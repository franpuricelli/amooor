// ─────────────────────────────────────────────────────────────────────────────
//  content-schema.ts — the SHAPE of the "Historia" editorial template's content.
//
//  `<EditorialTemplate content={...}>` is purely presentational: it renders any
//  object matching `EditorialContent`. This module holds ONLY the types, so both
//  the plain skeleton (content.plain.ts, shipped with the template) and any
//  per-couple adaptation (e.g. content.ts / content.en.ts) share one contract
//  without depending on each other. See components/templates/editorial.md.
// ─────────────────────────────────────────────────────────────────────────────

export interface MomentItem {
  img: string;
  title: string;
  sub: string;
  badge?: string;
}
export interface MomentTab {
  key: string;
  label: string;
  items: MomentItem[];
  /** Extra photos of this category, appended after the visible cards to form
   *  the full album the lightbox opens over (re-uses the gallery viewer). */
  more: string[];
}
export interface IconCard {
  icon: string;
  title: string;
  sub: string;
}
export interface StoryBeat {
  kicker: string;
  title: string;
  text: string;
  /** Photos for this beat's tilted collage; clicking opens the lightbox over
   *  all of them (first 3 are shown scattered, like the tenant StoryRow). */
  photos: string[];
  alt: string;
}
export interface Destination {
  title: string;
  place: string;
  flag?: string;
  emoji?: string;
  img: string;
  count: string;
}
export interface WatchFav {
  title: string;
  kind: string;
  note: string;
}

export interface EditorialContent {
  locale: string;
  couple: { a: string; b: string };
  nav: { links: { label: string; href: string }[]; date: string };
  scrollLabel: string;
  hero: { eyebrow: string; line1: string; line2: string; lede: string; cta: string; img: string; alt: string };
  facts: { icon: string; title: string; sub: string }[];
  story: { eyebrow: string; title: string; lede: string; beats: StoryBeat[] };
  moments: { eyebrow: string; title: string; lede: string; tabs: MomentTab[] };
  travel: { eyebrow: string; title: string; lede: string; destinations: Destination[] };
  dining: {
    eyebrow: string;
    big: { img: string; title: string; text: string };
    green: { titleLead: string; titleMuted: string; checklist: string[]; art: string };
    light: { eyebrow: string; title: string; thumb: string };
  };
  why: { eyebrow: string; titleLead: string; titleEm: string; lede: string; img: string; cards: IconCard[] };
  watch: { eyebrow: string; title: string; lede: string; favs: WatchFav[]; moreLabel: string; titles: string[] };
  counter: {
    eyebrow: string;
    since: string;
    labels: { days: string; hours: string; mins: string; secs: string };
    chips: string[];
    metLead: string;
    metDate: string;
  };
  gallery: { eyebrow: string; title: string; lede: string; photos: string[] };
  closing: {
    title: string;
    line: string;
    drawingSrc: string;
    drawingAlt: string;
    message: string;
    from: string;
    frontAria: string;
    backAria: string;
  };
  footer: { credit: string };
  ui: { photoView: string; seeAll: string };
  /** Song wired to the nav pill: clicking it toggles play/pause. */
  music: { src: string; playLabel: string; pauseLabel: string };
}

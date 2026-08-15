// ─────────────────────────────────────────────────────────────────────────────
//  adapt.ts — maps a tenant's `Content` (lib/content.ts) onto the Matcha
//  template's `EditorialContent` (content-schema.ts), resolving photo URLs
//  through the active `PhotoSource` (usePhotos). This is what makes "Matcha" a
//  real, publishable template: the SAME tenant data that drives the default
//  section-registry site renders as the Matcha story structure instead.
//
//  Section copy the tenant schema doesn't carry (facts labels, dining/why
//  headers, etc.) is synthesized here from dates/stats/people.
// ─────────────────────────────────────────────────────────────────────────────

import { fill, type Content } from "@/lib/content";
import type { PhotoSource } from "@/lib/photos-context";
import type { EditorialContent } from "./content-schema";

const take = <T,>(a: T[], n: number) => a.slice(0, n);

export function contentToEditorial(content: Content, photos: PhotoSource): EditorialContent {
  const thumbsOf = (cat: string) => photos.photos(cat).map((s) => photos.thumb(cat, s));
  const firstThumb = (cat: string) => {
    const s = photos.photos(cat)[0];
    return s ? photos.thumb(cat, s) : "";
  };

  const storyKeys = Object.keys(content.story);
  const timeline = content.story["historia"] ?? content.story[storyKeys[0]];
  const dining = content.story["cocina"] ?? content.story[storyKeys[1]];
  const diningBeat = dining?.beats?.[0];
  const diningCat = diningBeat?.cats?.[0] ?? "almuerzos-cenas";
  const diningThumbs = thumbsOf(diningCat);

  const totalPhotos = photos.totalPhotos;
  const titlesCount = content.watch.list.length;
  const vars = { photos: totalPhotos, titles: titlesCount, count: totalPhotos };

  const heroImg = content.hero.pixelSrc ?? photos.full(content.hero.cat, content.hero.slug);

  return {
    locale: content.site.locale,
    couple: { a: content.hero.nameStart, b: content.hero.nameEnd },
    nav: { links: [], date: content.hero.eyebrow },
    scrollLabel: "Scroll",

    hero: {
      eyebrow: content.hero.eyebrow,
      line1: `${content.dates.anniversaryYears} años`,
      line2: "de nosotros.",
      lede: content.hero.lede,
      cta: "",
      img: heroImg,
      alt: content.hero.bgAlt,
    },

    facts: [
      { icon: "calendar", title: content.dates.together.slice(0, 4), sub: "El año que empezó todo" },
      {
        icon: "plane",
        title: `${content.travel.destinations.length} destinos`,
        sub: "Juntos por el mundo",
      },
      { icon: "heart", title: `${totalPhotos} fotos`, sub: "Momentos guardados" },
      { icon: "infinity", title: "∞ mates", sub: "Y contando" },
    ],

    story: {
      eyebrow: "Nuestros comienzos",
      title: "Cómo empezó todo",
      lede: "Los momentos que lo cambiaron todo, en orden.",
      beats: (timeline?.beats ?? []).map((b) => {
        const pics = b.cats.flatMap(thumbsOf);
        return {
          kicker: b.kicker,
          title: b.title,
          text: b.text,
          photos: take(pics.length ? pics : [firstThumb(b.cats[0] ?? "")], 6),
          alt: b.title,
        };
      }),
    },

    moments: {
      eyebrow: content.moments.kicker,
      title: content.moments.title,
      lede: content.moments.lede,
      tabs: content.moments.cards
        .map((card) => {
          const t = thumbsOf(card.cat);
          return {
            key: card.cat,
            label: card.title,
            items: take(t, 4).map((img) => ({ img, title: card.title, sub: "" })),
            more: t.slice(4),
          };
        })
        .filter((tab) => tab.items.length > 0),
    },

    travel: {
      eyebrow: content.travel.kicker,
      title: content.travel.title,
      lede: content.travel.lede,
      destinations: content.travel.destinations.map((d) => ({
        title: d.title,
        place: d.place,
        flag: d.flag,
        emoji: d.emoji,
        img: firstThumb(d.cat),
        count: fill(content.ui.photosCount, { count: photos.photos(d.cat).length }),
      })),
    },

    dining: {
      eyebrow: "Vuestra mesa",
      big: {
        img: diningThumbs[0] ?? "",
        title: diningBeat?.title ?? "Comimos rico",
        text: diningBeat?.text ?? "",
      },
      green: {
        titleLead: "Nuestra receta",
        titleMuted: "es simple",
        checklist: ["Cocinar juntos", "Sobremesa larga", "Postre compartido"],
        art: diningThumbs[1] ?? diningThumbs[0] ?? "",
      },
      light: {
        eyebrow: "El plan favorito",
        title: "Estar en casa",
        thumb: diningThumbs[2] ?? diningThumbs[0] ?? "",
      },
    },

    why: {
      eyebrow: "Lo que los une",
      titleLead: "Un amor de",
      titleEm: "todos los días.",
      lede: "No somos perfectos, somos nuestros. El amor se construye en lo pequeño: un mate compartido, una serie a medianoche, un «te elijo» dicho sin apuro.",
      img: firstThumb("otros-cute") || firstThumb(content.hero.cat),
      cards: [
        { icon: "spark", title: "Complicidad", sub: "Nos entendemos con una mirada." },
        { icon: "leaf", title: "Aventura", sub: "Siempre listos para lo que venga." },
        { icon: "home", title: "Hogar", sub: "Donde estás vos, estoy en casa." },
        { icon: "infinity", title: "Para siempre", sub: "Elegirte, todos los días." },
      ],
    },

    watch: {
      eyebrow: fill(content.watch.kicker, { count: titlesCount }),
      title: content.watch.title,
      lede: content.watch.lede,
      favs: content.watch.list
        .filter((w) => w.fav)
        .slice(0, 3)
        .map((w) => ({
          title: w.title,
          kind: w.kind === "peli" ? "Película" : "Serie",
          note: w.note ?? "",
        })),
      moreLabel: content.watch.moreLabel,
      titles: content.watch.list.filter((w) => !w.fav).map((w) => w.title),
    },

    counter: {
      eyebrow: content.stats.kicker,
      since: `${content.dates.together}T00:00:00`,
      labels: content.stats.labels,
      chips: content.stats.chips.map((c) => fill(c, vars)),
      metLead: "Se conocieron el",
      metDate: content.stats.metDate,
    },

    gallery: {
      eyebrow: fill(content.gallery.eyebrow, { count: totalPhotos }),
      title: content.gallery.title,
      lede: content.gallery.lede,
      photos: take(photos.allPhotos, 30).map((p) => photos.thumb(p.cat, p.slug)),
    },

    closing: {
      title: content.footer.title,
      line: fill(content.footer.line, { years: content.dates.anniversaryYears }),
      drawingSrc: content.drawing.src,
      drawingAlt: content.drawing.alt,
      message: content.drawing.message,
      from: content.drawing.from,
      frontAria: content.drawing.frontAria,
      backAria: content.drawing.backAria,
    },

    footer: { credit: content.footer.credit },

    ui: { photoView: content.ui.photoView, seeAll: "Ver todas" },

    music: {
      src: content.media?.audioUrl || photos.audio(content.music.cat, content.music.slug),
      playLabel: content.music.playLabel,
      pauseLabel: content.music.pauseLabel,
    },
  };
}

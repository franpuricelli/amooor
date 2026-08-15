// ─────────────────────────────────────────────────────────────────────────────
//  content.plain.ts — the EMPTY skeleton of the "Historia" editorial template:
//  same structure and layout, generic placeholder copy, and ONE placeholder
//  image in every slot. It's fully self-contained (no couple's data), so it
//  ships WITH the template and doubles as its default sample content.
//
//  Served at /template/plain. To adapt the template to a real couple, copy this
//  shape into a `content.ts` (+ `content.en.ts`) and fill it — see
//  components/templates/editorial.md.
// ─────────────────────────────────────────────────────────────────────────────

import type { EditorialContent } from "./content-schema";

/** One neutral placeholder image used in EVERY image slot. It always loads (a
 *  real committed asset), and each component sizes it via its own object-fit
 *  rules, so the plain template shows a single consistent image style. */
const PH = "/plantilla-foto.svg";

const plain: EditorialContent = {
  locale: "es",
  couple: { a: "Nombre", b: "Nombre" },
  nav: {
    links: [
      { label: "Historia", href: "#historia" },
      { label: "Viajes", href: "#viajes" },
      { label: "Momentos", href: "#momentos" },
      { label: "Nosotros", href: "#nosotros" },
    ],
    date: "DD·MM·AAAA → ∞",
  },
  scrollLabel: "Scroll",

  hero: {
    eyebrow: "Vuestra historia · fecha",
    line1: "Un título",
    line2: "en dos líneas.",
    lede: "Una frase corta que resume vuestra historia. Va acá, con calma y sin apuro.",
    cta: "Vuestra historia",
    img: PH,
    alt: "Foto de portada",
  },

  facts: [
    { icon: "calendar", title: "Año", sub: "El año que empezó todo" },
    { icon: "plane", title: "N países", sub: "Juntos por el mundo" },
    { icon: "heart", title: "N fotos", sub: "Momentos guardados" },
    { icon: "infinity", title: "∞", sub: "Y contando" },
  ],

  story: {
    eyebrow: "Vuestros comienzos",
    title: "Cómo empezó todo",
    lede: "Tres momentos que lo cambiaron todo, en orden.",
    beats: [
      {
        kicker: "Fecha · lugar",
        title: "Se conocieron",
        text: "Contá acá el primer momento: dónde, cuándo y esa sensación de que algo empezaba. Dos o tres frases alcanzan.",
        photos: [PH, PH, PH],
        alt: "Foto del primer momento",
      },
      {
        kicker: "Fecha",
        title: "Se enamoraron",
        text: "El momento en que se volvió amor. Un detalle, una anécdota, un lugar que quedó marcado.",
        photos: [PH, PH, PH],
        alt: "Foto del segundo momento",
      },
      {
        kicker: "Un hito",
        title: "Un paso importante",
        text: "Una mudanza, un viaje, una promesa. El beat que muestra que la historia sigue creciendo.",
        photos: [PH, PH, PH],
        alt: "Foto del tercer momento",
      },
    ],
  },

  moments: {
    eyebrow: "Y en el medio…",
    title: "Lo celebraron todo",
    lede: "Fechas especiales, escapadas y todas las cositas del medio. Una pestaña por categoría.",
    tabs: [
      {
        key: "categoria-1",
        label: "Categoría 1",
        items: [
          { img: PH, title: "Un momento", sub: "Subtítulo" },
          { img: PH, title: "Otro momento", sub: "Subtítulo" },
          { img: PH, title: "Un tercero", sub: "Subtítulo" },
          { img: PH, title: "Y uno más", sub: "Subtítulo" },
        ],
        more: [PH, PH, PH, PH],
      },
      {
        key: "categoria-2",
        label: "Categoría 2",
        items: [
          { img: PH, title: "Un momento", sub: "Subtítulo" },
          { img: PH, title: "Otro momento", sub: "Subtítulo" },
          { img: PH, title: "Un tercero", sub: "Subtítulo" },
        ],
        more: [],
      },
      {
        key: "categoria-3",
        label: "Categoría 3",
        items: [
          { img: PH, title: "Un momento", sub: "Subtítulo" },
          { img: PH, title: "Otro momento", sub: "Subtítulo" },
        ],
        more: [PH, PH],
      },
    ],
  },

  travel: {
    eyebrow: "Con la valija lista",
    title: "Viajaron",
    lede: "Los lugares que recorrieron juntos. En cada uno, la misma foto: ustedes.",
    destinations: [
      { title: "Destino 1", place: "Lugar", emoji: "📍", img: PH, count: "N fotos" },
      { title: "Destino 2", place: "Lugar", emoji: "📍", img: PH, count: "N fotos" },
      { title: "Destino 3", place: "Lugar", emoji: "📍", img: PH, count: "N fotos" },
      { title: "Destino 4", place: "Lugar", emoji: "📍", img: PH, count: "N fotos" },
      { title: "Más escapadas", place: "por todos lados", emoji: "✈️", img: PH, count: "N fotos" },
    ],
  },

  dining: {
    eyebrow: "Vuestra mesa",
    big: {
      img: PH,
      title: "Un ritual compartido",
      text: "Ese plan que es 100% de ustedes: cocinar juntos, una salida fija, un café de domingo. Contalo en dos frases.",
    },
    green: {
      titleLead: "Vuestra receta",
      titleMuted: "es simple",
      checklist: ["Un ingrediente", "Otro", "Y el tercero"],
      art: PH,
    },
    light: {
      eyebrow: "El plan favorito",
      title: "Estar juntos",
      thumb: PH,
    },
  },

  why: {
    eyebrow: "Lo que los une",
    titleLead: "Un amor de",
    titleEm: "todos los días.",
    lede: "Una frase sobre qué hace único a este vínculo. Lo pequeño, lo cotidiano, lo que se elige cada día.",
    img: PH,
    cards: [
      { icon: "spark", title: "Valor 1", sub: "Una línea que lo explica." },
      { icon: "leaf", title: "Valor 2", sub: "Una línea que lo explica." },
      { icon: "home", title: "Valor 3", sub: "Una línea que lo explica." },
      { icon: "infinity", title: "Valor 4", sub: "Una línea que lo explica." },
    ],
  },

  watch: {
    eyebrow: "De noche · N títulos",
    title: "Maratonearon",
    lede: "Pelis, series y madrugadas de «un capítulo más». Su propia programación.",
    favs: [
      { title: "Título 1", kind: "Película", note: "Por qué es especial" },
      { title: "Título 2", kind: "Serie", note: "Por qué es especial" },
      { title: "Título 3", kind: "Serie", note: "Por qué es especial" },
    ],
    moreLabel: "…y las que faltan",
    titles: [
      "Título", "Título", "Título", "Título", "Título", "Título",
      "Título", "Título", "Título", "Título", "Título", "Título",
    ],
  },

  counter: {
    eyebrow: "…y acá están",
    since: "2022-01-01T00:00:00",
    labels: { days: "días", hours: "horas", mins: "min", secs: "seg" },
    chips: ["N fotos", "N países", "N títulos", "∞"],
    metLead: "Se conocieron el",
    metDate: "DD·MM·AAAA",
  },

  gallery: {
    eyebrow: "❤ Wall of love",
    title: "Todos los recuerdos",
    lede: "Cada foto es un día que eligieron estar juntos.",
    photos: [PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH, PH],
  },

  closing: {
    title: "Feliz aniversario",
    line: "N años · DD.MM.AAAA → ∞",
    drawingSrc: PH,
    drawingAlt: "Un dibujo de ustedes",
    message: "Un mensaje",
    from: "De: …",
    frontAria: "Ver el mensaje",
    backAria: "Ver el dibujo",
  },

  footer: {
    credit: "Hecho con amor ❤️",
  },

  ui: {
    photoView: "Ver foto",
    seeAll: "Ver todas",
  },

  music: {
    src: "",
    playLabel: "Reproducir la música",
    pauseLabel: "Pausar la música",
  },
};

export default plain;

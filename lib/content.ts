// ─────────────────────────────────────────────────────────────────────────────
//  content.ts — TODO el contenido del sitio, por datos. Los componentes no
//  contienen ningún string; leen de acá. Cambiar este objeto (o el `content`
//  de otro tenant, mismo shape) produce el sitio de otra pareja sin tocar .tsx.
//
//  `content` acá abajo es el `defaultContent` del template (Puri & Ivi), que
//  sirve de preview/seed. El wizard (WP-3) genera uno nuevo por tenant y Convex
//  (WP-2) lo persiste. El shape está validado por `contentSchema` en template.ts.
//
//  Convención de placeholders en strings: `{count}` se reemplaza en runtime por
//  el número correspondiente (fotos, títulos, etc.) — así el copy vive acá y no
//  en los componentes.
// ─────────────────────────────────────────────────────────────────────────────

export type SectionType =
  | "hero"
  | "story"
  | "travel"
  | "moments"
  | "watch"
  | "stats"
  | "gallery";

export interface Trait {
  icon: string;
  label: string;
}
export interface Artist {
  name: string;
  img?: string; // opcional — sin imagen se muestra un avatar neutro con la inicial
}
export interface Person {
  name: string;
  tagline: string;
  zoneLabel: string; // aria-label de la zona hover ("Conocé a …")
  traits: Trait[];
  artists: Artist[];
}
export interface StoryBeat {
  kicker: string;
  title: string;
  titleHeart?: boolean; // agrega el ❤ estilizado al final del título
  text: string;
  cats: string[]; // categorías de fotos que arman el álbum del beat
  picks: [string, number][]; // [categoría, índice] — fotos del collage
  flip?: boolean;
}
export interface Destination {
  cat: string;
  title: string;
  place: string;
  flag?: string;
  emoji?: string;
}
export interface MomentCard {
  cat: string;
  title: string;
  emoji?: string;
  flag?: string;
}
export type WatchKind = "peli" | "serie";
export interface WatchItem {
  title: string;
  kind: WatchKind;
  fav: boolean;
  note?: string;
}
export interface SectionEntry {
  type: SectionType;
  id: string; // id/ancla del DOM
  enabled: boolean;
}

// ── Media por tenant (WP-3/WP-4) ─────────────────────────────────────────────
//  Fotos subidas por el usuario, con las URLs ya resueltas (Cloudflare Images).
//  Cuando `content.media` existe, el sitio usa ESTAS fotos; cuando no (el default
//  Puri & Ivi), cae al manifiesto estático `lib/photos.ts`. Ver lib/photos-context.tsx.
export interface MediaPhoto {
  slug: string; // id estable dentro de la categoría
  thumb: string; // URL de la variante `thumb`
  full: string; // URL de la variante `full`
}
export interface MediaSet {
  /** categoría → fotos (incluye "all" = no categorizadas). */
  photos: Record<string, MediaPhoto[]>;
  /** canción propia subida (si el usuario no eligió una de la librería). */
  audioUrl?: string;
}

export const content = {
  // ── Metadata del sitio (app/layout.tsx) ──────────────────────────────────
  site: {
    locale: "es",
    title: "Purivi",
    description: "Nuestra historia, en fotos. Feliz aniversario ❤️",
    ogTitle: "Purivi ❤️",
    ogDescription: "Nuestra historia, en fotos.",
    themeColor: "#ff6fae",
  },

  couple: "Puri & Ivi",

  dates: {
    together: "2022-07-26", // aniversario
    met: "2022-03-15", // el día que se conocieron
    anniversaryYears: 4,
  },

  // ── Orden y visibilidad de secciones (data-driven) ───────────────────────
  //  Reordenar/activar/desactivar acá cambia el sitio sin tocar page.tsx.
  layout: [
    { type: "hero", id: "inicio", enabled: true },
    { type: "story", id: "historia", enabled: true },
    { type: "travel", id: "viajes", enabled: true },
    { type: "story", id: "cocina", enabled: true },
    { type: "moments", id: "momentos", enabled: true },
    { type: "watch", id: "pelis", enabled: true },
    { type: "stats", id: "stats", enabled: true },
    { type: "gallery", id: "galeria", enabled: true },
  ] as SectionEntry[],

  // ── Hero ─────────────────────────────────────────────────────────────────
  hero: {
    eyebrow: "26 · 07 · 2022 → ∞",
    // el h1 se arma como `${nameStart} & ${nameEnd}` con el & estilizado
    nameStart: "Puri",
    nameEnd: "Ivi",
    lede: "Cuatro años de nosotros. Esta es nuestra historia, desde el día que nos cruzamos en la facu hasta hoy.",
    bgAlt: "Puri e Ivi, en 8-bit",
    // Con pixelSrc = null se usa la foto real (cat/slug); poné "/hero-8bit.jpg"
    // para el arte 8-bit.
    pixelSrc: null as string | null,
    cat: "bariloche",
    slug: "f9b37c4a-db15-46e1-ab37-eadd1999f6f9",
  },

  people: {
    artistsLabel: "Artistas favoritos",
    // left = se muestra a la izquierda del hero, right a la derecha
    left: {
      name: "Ivi",
      tagline: "main character energy",
      zoneLabel: "Conocé a Ivi",
      traits: [
        { icon: "📚", label: "Leer" },
        { icon: "🍝", label: "Comer rico" },
        { icon: "❤️", label: "Amor" },
        { icon: "📈", label: "Marketing loverr" },
      ],
      artists: [
        { name: "Sabrina Carpenter" },
        { name: "Tini" },
        { name: "Emilia" },
      ],
    } as Person,
    right: {
      name: "Fran",
      tagline: "aka Puri",
      zoneLabel: "Conocé a Fran",
      traits: [
        { icon: "💻", label: "Tech guy" },
        { icon: "⚽", label: "Fútbol" },
        { icon: "🍳", label: "Cocinar" },
      ],
      artists: [
        { name: "The Beatles" },
        { name: "Red Hot Chili Peppers" },
        { name: "Imagine Dragons" },
      ],
    } as Person,
  },

  // ── Secciones tipo "story" (beats narrativos), por id de sección ──────────
  story: {
    historia: {
      beats: [
        {
          kicker: "15 · 03 · 2022 · la facu",
          title: "Nos conocimos en la facu",
          text: "Un día cualquiera de marzo, entre clases y parciales, nos cruzamos. Nadie nos avisó que ese día empezaba todo. Después llegó tu graduación, y ahí estuve: aplaudiendo más fuerte que nadie.",
          cats: ["facu", "graduacion-ivi"],
          picks: [["facu", 0], ["facu", 1], ["graduacion-ivi", 0]],
        },
        {
          flip: true,
          kicker: "26 · 07 · 2022",
          title: "Nos enamoramos",
          text: "De un mate compartido a «¿somos novios?». El primer año juntis fue eso: planes chiquitos, risas enormes y un San Valentín que dejó de ser un día cualquiera para siempre.",
          cats: ["primer-a-no-juntis", "san-valentin"],
          picks: [["primer-a-no-juntis", 0], ["primer-a-no-juntis", 2], ["san-valentin", 0]],
        },
        {
          kicker: "las llaves nuevas",
          title: "Nos mudamos juntos",
          titleHeart: true,
          text: "Cajas, mudanza y un espacio que de a poco se volvió nuestro. Ahora el plan favorito es simplemente estar en casa.",
          cats: ["mudanza"],
          picks: [["mudanza", 0], ["mudanza", 1], ["mudanza", 2]],
        },
      ] as StoryBeat[],
    },
    cocina: {
      beats: [
        {
          flip: true,
          kicker: "nuestra mesa",
          title: "Comimos rico",
          text: "Restaurantes, delivery y esas cenas en casa que cocinamos juntos. La mesa siempre fue nuestro plan favorito, y la sobremesa más todavía.",
          cats: ["almuerzos-cenas"],
          picks: [["almuerzos-cenas", 0], ["almuerzos-cenas", 1], ["almuerzos-cenas", 2]],
        },
      ] as StoryBeat[],
    },
    // Nota: el shape se ensancha a un record genérico para que un tenant generado
    // pueda tener CUALQUIER conjunto de secciones "story" (no sólo historia/cocina).
  } as Record<string, { beats: StoryBeat[] }>,

  // ── Viajes ────────────────────────────────────────────────────────────────
  travel: {
    kicker: "con la valija lista",
    title: "Viajamos",
    lede: "Bariloche fue el primero. Después cruzamos la cordillera, un trópico y un charco. En todos lados, la misma foto: nosotros.",
    destinations: [
      { cat: "bariloche", title: "Bariloche", place: "Argentina", flag: "/brand/flags/ar.png" },
      { cat: "chile", title: "Chile", place: "Chile", flag: "/brand/flags/cl.png" },
      { cat: "mexico", title: "México", place: "México", flag: "/brand/flags/mx.png" },
      { cat: "uruguay", title: "Uruguay", place: "Uruguay", flag: "/brand/flags/uy.png" },
      { cat: "otros-viajes", title: "Más escapadas", place: "por todos lados", emoji: "✈️" },
    ] as Destination[],
  },

  // ── Momentos ──────────────────────────────────────────────────────────────
  moments: {
    kicker: "y en el medio…",
    title: "Celebramos todo",
    lede: "San Valentín, aniversarios, el Mundial que ganamos y todas las cositas cute del medio. Tocá una carta para verlas todas.",
    cards: [
      { cat: "san-valentin", title: "San Valentín", emoji: "💘" },
      { cat: "aniversarios", title: "Aniversarios", emoji: "🥂" },
      { cat: "mundial", title: "El Mundial", emoji: "🏆", flag: "/brand/flags/ar.png" },
      { cat: "halloween", title: "Halloween", emoji: "🎃" },
      { cat: "otros-cute", title: "Cositas cute", emoji: "🎀" },
    ] as MomentCard[],
  },

  // ── Pelis / watchlist ─────────────────────────────────────────────────────
  watch: {
    kicker: "de noche · {count} títulos",
    title: "Maratoneamos",
    lede: "Pelis, series y madrugadas de «un capítulo más». Nuestra propia programación.",
    moreLabel: "…y las que faltan",
    // Video que cierra el capítulo. provider "video" (default) usa un <video>
    // propio (src apunta a un mp4/webm subido por la pareja); provider "tiktok"
    // queda por compatibilidad si el tenant pega un link de TikTok.
    video: {
      provider: "video" as "tiktok" | "video",
      label: "y nuestra película sin fin ↓",
      url: "",
      videoId: "",
      caption: "Una película sin fin 🥰♥️",
      src: null as string | null, // usado cuando provider === "video"
      poster: null as string | null,
    },
    list: [
      // ⭐ Las especiales (van destacadas arriba)
      { title: "The Notebook", kind: "peli", fav: true, note: "nuestra primera peli" },
      { title: "Friends", kind: "serie", fav: true, note: "la que maratoneamos" },
      { title: "La Casa de Papel", kind: "serie", fav: true, note: "la que no pudimos parar" },
      // 📺 Series (default)
      { title: "Stranger Things", kind: "serie", fav: false },
      { title: "Breaking Bad", kind: "serie", fav: false },
      { title: "The Office", kind: "serie", fav: false },
      { title: "Dark", kind: "serie", fav: false },
      { title: "Peaky Blinders", kind: "serie", fav: false },
      { title: "The Crown", kind: "serie", fav: false },
      { title: "Wednesday", kind: "serie", fav: false },
      { title: "Squid Game", kind: "serie", fav: false },
      { title: "Better Call Saul", kind: "serie", fav: false },
      { title: "Black Mirror", kind: "serie", fav: false },
    ] as WatchItem[],
  },

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats: {
    kicker: "…y acá estamos: juntos desde el 26 · 07 · 2022",
    labels: { days: "días", hours: "horas", mins: "min", secs: "seg" },
    // {count} → cantidades reales (fotos / títulos vistos)
    chips: ["{photos} fotos", "5 países", "{titles} títulos vistos", "∞ mates"],
    metLead: "…y contando. Nos conocimos el ",
    metDate: "15 · 03 · 2022",
    metAgoPrefix: "hace",
    metAgoSuffix: "días",
  },

  // ── Wall of love / galería ────────────────────────────────────────────────
  gallery: {
    eyebrow: "❤ wall of love · {count} recuerdos",
    title: "Wall of love",
    lede: "Todos los recuerdos, juntitos. Cada foto es un día que elegimos estar juntos. Tocá cualquiera para verla grande.",
    cta: "Ver todas las {count} fotos →",
    closeLabel: "Cerrar",
  },

  // ── Footer + dibujo ───────────────────────────────────────────────────────
  footer: {
    title: "Feliz aniversario, mi amor",
    // {years} → años, línea "N años · 26.07.2022 → ∞"
    line: "{years} años · 26.07.2022 → ∞",
    credit: "hecho por Puri, con amor (y un poco de código) ❤️",
  },
  drawing: {
    src: "/drawing.png",
    alt: "Nosotros dos, dibujados",
    frontAria: "Dar vuelta la carta",
    backAria: "Ver el dibujo",
    message: "Te amo",
    from: "De: Fran",
  },

  // ── Música ────────────────────────────────────────────────────────────────
  //  El mp3 vive en Convex storage (kind "audio"); MusicToggle arma la URL con
  //  `audio(cat, slug)`.
  music: {
    cat: "music",
    slug: "when-i-was-your-man",
    playLabel: "Reproducir la música",
    pauseLabel: "Pausar la música",
  },

  // ── Labels de UI reutilizables (con {placeholders}) ───────────────────────
  ui: {
    photosCount: "{count} fotos", // chip de viajes/momentos
    seeAllPhotos: "Ver las {count} fotos →", // botón de StoryRow
    photoAria: "Foto {n} de {total}", // aria de cada tile
    albumAria: "Ver las {count} fotos de {title}", // aria del chip de viajes
    momentAria: "Ver fotos de {title}", // aria de la carta de momentos
    photoView: "Ver foto", // aria genérico de collage
    close: "Cerrar", // aria de cerrar overlays
    // lightbox
    photoN: "Foto {n}", // aria de thumb/tile en el lightbox
    prev: "Anterior",
    next: "Siguiente",
    seeAllGrid: "▦ ver todas",
    backFromGrid: "◂ volver",
  },
};

// El default (Puri & Ivi) no trae `media` — usa el manifiesto estático de fotos.
// Un tenant generado por el wizard sí lo incluye (sus fotos subidas).
export type Content = typeof content & { media?: MediaSet };

/** Reemplaza `{key}` en un string por los valores dados. */
export function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

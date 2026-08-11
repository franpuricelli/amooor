// ─────────────────────────────────────────────────────────────────────────────
//  config.ts — your content lives here ✏️
//  config.ts — acá vive tu contenido ✏️
//
//  EN · This is a TEMPLATE: fantasy names, made-up favorites, blank photos.
//       Fixed UI text (section titles, buttons…) lives in lib/strings.ts and is
//       bilingual with the top-right switch. The descriptive bits below can also
//       be bilingual — write { en: "…", es: "…" } — or a plain string for both.
//  ES · Esto es una PLANTILLA: nombres de fantasía, favoritos inventados, fotos
//       en blanco. El texto fijo de UI vive en lib/strings.ts y es bilingüe con
//       el switch de arriba a la derecha. Los textos descriptivos de abajo también
//       pueden ser bilingües — poné { en: "…", es: "…" } — o un string para ambos.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  // `left` / `right` = the two people (left and right in the hero).
  names: {
    left: "Sera",
    right: "Orion",
    couple: "Orion & Sera",
  },

  // Dates in YYYY-MM-DD. The live counter is computed automatically.
  dates: {
    together: "2020-02-14", // the day it all started · el día que empezó todo
    met: "2019-09-01", // the day you met · el día que se conocieron
    anniversaryYears: 5,
  },

  // Hero cover. pixelSrc: null → uses the photo at cat/slug below.
  hero: {
    pixelSrc: null as string | null,
    cat: "trip-one",
    slug: "01",
  },

  people: {
    // LEFT person (hero left). traits = chips; artists = square avatars in
    // /public/brand/artists/.
    left: {
      name: "Sera",
      tagline: { en: "main character energy", es: "main character energy" },
      traits: [
        { icon: "📚", label: { en: "Reading", es: "Leer" } },
        { icon: "🍝", label: { en: "Good food", es: "Comer rico" } },
        { icon: "🎨", label: { en: "Art", es: "Arte" } },
        { icon: "❤️", label: { en: "Love", es: "Amor" } },
      ],
      artists: [
        { name: "The Moonlarks", img: "/brand/artists/artist-1.jpg" },
        { name: "Velvet Aria", img: "/brand/artists/artist-2.jpg" },
        { name: "Isolde", img: "/brand/artists/artist-3.jpg" },
      ],
    },
    // RIGHT person (hero right).
    right: {
      name: "Orion",
      tagline: { en: "aka your nickname", es: "alias tu apodo" },
      traits: [
        { icon: "💻", label: { en: "Tech", es: "Tecnología" } },
        { icon: "⚽", label: { en: "Football", es: "Fútbol" } },
        { icon: "🍳", label: { en: "Cooking", es: "Cocinar" } },
      ],
      artists: [
        { name: "Ashgrove", img: "/brand/artists/artist-4.jpg" },
        { name: "Nightfell", img: "/brand/artists/artist-5.jpg" },
        { name: "The Kestrels", img: "/brand/artists/artist-6.jpg" },
      ],
    },
  },

  // Trips — each is a photo folder in /public/photos + /public/thumbs.
  // `place` is descriptive (bilingual ok). Use `emoji` or a `flag` image path.
  viajes: [
    { cat: "trip-one", title: "Rivermist", place: { en: "the mountains", es: "las montañas" }, emoji: "🏔️" },
    { cat: "trip-two", title: "Solvann", place: { en: "across the sea", es: "cruzando el mar" }, emoji: "🌊" },
    { cat: "trip-three", title: "Marisol Bay", place: { en: "the tropics", es: "el trópico" }, emoji: "🌴" },
    { cat: "trip-four", title: "Verdemar", place: { en: "next door", es: "acá al lado" }, emoji: "⛵" },
    { cat: "trip-five", title: "Elsewhere", place: { en: "everywhere", es: "por todos lados" }, emoji: "✈️" },
  ],

  // Moments — the bento grid of little celebrations. `title` is bilingual ok.
  momentos: [
    { cat: "valentines", title: { en: "Valentine's", es: "San Valentín" }, emoji: "💘" },
    { cat: "anniversaries", title: { en: "Anniversaries", es: "Aniversarios" }, emoji: "🥂" },
    { cat: "big-win", title: { en: "The big win", es: "El gran triunfo" }, emoji: "🏆" },
    { cat: "costumes", title: { en: "Costumes", es: "Disfraces" }, emoji: "🎭" },
    { cat: "little-things", title: { en: "Little things", es: "Cositas" }, emoji: "🎀" },
  ],

  // Watchlist — everything you watched together (all made up). kind:
  // "peli" (movie) | "serie" (series) · fav: true highlights it · note is a
  // caption for the featured ones (bilingual ok).
  watchlist: [
    { title: "The Midnight Library", kind: "peli", fav: true, note: { en: "our first movie", es: "nuestra primera peli" } },
    { title: "Starlight Hollow", kind: "serie", fav: true, note: { en: "the one we binged", es: "la que maratoneamos" } },
    { title: "Letters to the Moon", kind: "serie", fav: true, note: { en: "the one that made you cry", es: "la que te hizo llorar" } },

    { title: "Crimson Vale", kind: "serie", fav: false },
    { title: "The Lantern Keeper", kind: "peli", fav: false },
    { title: "Echoes of Eldoria", kind: "serie", fav: false },
    { title: "Paper Boats", kind: "peli", fav: false },
    { title: "Wild North", kind: "serie", fav: false },
    { title: "Two of Us", kind: "peli", fav: false },
    { title: "Someday Soon", kind: "serie", fav: false },
    { title: "The Glass Garden", kind: "serie", fav: false },
    { title: "Northern Lights", kind: "peli", fav: false },
    { title: "Hearts in Orbit", kind: "serie", fav: false },
  ] as {
    title: string;
    kind: "peli" | "serie";
    fav: boolean;
    note?: string | { en: string; es: string };
  }[],

  // TikTok that closes the "watched together" chapter. Paste your own video URL
  // and its numeric id, or leave as-is for a placeholder.
  tiktok: {
    url: "https://www.tiktok.com/",
    videoId: "0000000000000000000",
    caption: { en: "Your favorite video 🎬", es: "Tu video favorito 🎬" },
  },
} as const;

export type Config = typeof config;

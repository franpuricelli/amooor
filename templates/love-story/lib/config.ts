// ─────────────────────────────────────────────────────────────────────────────
//  config.ts — the ONLY file you really need to edit ✏️
//  config.ts — el ÚNICO archivo que de verdad necesitás editar ✏️
//
//  EN · This is a template. Everything you see on the site is a placeholder:
//       fantasy names, fake favorites and blank photos. Swap the values below
//       for your own story and drop your photos into /public (see README).
//  ES · Esto es una plantilla. Todo lo que ves en el sitio es de relleno:
//       nombres de fantasía, favoritos inventados y fotos en blanco. Cambiá los
//       valores de abajo por tu propia historia y poné tus fotos en /public
//       (ver README).
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  // EN · The two people. `couple` shows in the navbar + hero title.
  // ES · Las dos personas. `couple` aparece en la barra + título del hero.
  names: {
    left: "Sera", // EN · left person (hero, left side)  · ES · persona de la izquierda
    right: "Orion", // EN · right person (hero, right side) · ES · persona de la derecha
    couple: "Orion & Sera",
  },

  // EN · Dates in YYYY-MM-DD. The live counter is computed automatically.
  // ES · Fechas en AAAA-MM-DD. El contador en vivo se calcula solo.
  dates: {
    together: "2020-02-14", // EN · the day it all started · ES · el día que empezó todo
    met: "2019-09-01", // EN · the day you met · ES · el día que se conocieron
    anniversaryYears: 5, // EN · number shown in the footer · ES · número que sale en el footer
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Hero — the big cover photo and the "main character" card that appears when
  //  you hover each person. `left` is on the left, `right` is on the right.
  //  Hero — la foto grande de portada y la tarjeta de "main character" que
  //  aparece al pasar el mouse por cada persona. `left` a la izquierda,
  //  `right` a la derecha.
  // ───────────────────────────────────────────────────────────────────────────
  hero: {
    // EN · Cover image. `null` uses the real photo (cat/slug below). Set a path
    //      like "/hero.jpg" to use a dedicated cover instead.
    // ES · Imagen de portada. `null` usa la foto real (cat/slug de abajo). Poné
    //      una ruta como "/hero.jpg" para usar una portada dedicada.
    pixelSrc: null as string | null,
    cat: "trip-one", // EN · which photo folder · ES · de qué carpeta sale la foto
    slug: "01", // EN · which photo in it · ES · qué foto de esa carpeta
  },

  people: {
    // EN · LEFT person. traits = chips on the card. artists = favorite bands,
    //      each with a square image in /public/brand/artists/.
    // ES · Persona IZQUIERDA. traits = chips de la tarjeta. artists = bandas
    //      favoritas, cada una con una imagen cuadrada en /public/brand/artists/.
    left: {
      name: "Sera",
      tagline: "main character energy",
      traits: [
        { icon: "📚", label: "Reading · Leer" },
        { icon: "🍝", label: "Good food · Comer rico" },
        { icon: "🎨", label: "Art · Arte" },
        { icon: "❤️", label: "Love · Amor" },
      ],
      artists: [
        { name: "The Moonlarks", img: "/brand/artists/artist-1.jpg" },
        { name: "Velvet Aria", img: "/brand/artists/artist-2.jpg" },
        { name: "Isolde", img: "/brand/artists/artist-3.jpg" },
      ],
    },
    // EN · RIGHT person. Same idea.  ·  ES · Persona DERECHA. Misma idea.
    right: {
      name: "Orion",
      tagline: "aka your nickname · alias tu apodo",
      traits: [
        { icon: "💻", label: "Tech · Tecnología" },
        { icon: "⚽", label: "Football · Fútbol" },
        { icon: "🍳", label: "Cooking · Cocinar" },
      ],
      artists: [
        { name: "Ashgrove", img: "/brand/artists/artist-4.jpg" },
        { name: "Nightfell", img: "/brand/artists/artist-5.jpg" },
        { name: "The Kestrels", img: "/brand/artists/artist-6.jpg" },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Trips — each entry is a photo folder in /public/photos + /public/thumbs.
  //  Use `emoji` OR a `flag` image path. Add/remove entries freely.
  //  Viajes — cada entrada es una carpeta de fotos en /public/photos +
  //  /public/thumbs. Usá `emoji` O una imagen `flag`. Agregá/sacá a gusto.
  // ───────────────────────────────────────────────────────────────────────────
  viajes: [
    { cat: "trip-one", title: "Rivermist", place: "the mountains · las montañas", emoji: "🏔️" },
    { cat: "trip-two", title: "Solvann", place: "across the sea · cruzando el mar", emoji: "🌊" },
    { cat: "trip-three", title: "Marisol Bay", place: "the tropics · el trópico", emoji: "🌴" },
    { cat: "trip-four", title: "Verdemar", place: "next door · acá al lado", emoji: "⛵" },
    { cat: "trip-five", title: "Elsewhere", place: "everywhere · por todos lados", emoji: "✈️" },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  //  Moments — the bento grid of little celebrations. Same folder idea.
  //  Momentos — la grilla bento de pequeñas celebraciones. Misma idea de carpetas.
  // ───────────────────────────────────────────────────────────────────────────
  momentos: [
    { cat: "valentines", title: "Valentine's · San Valentín", emoji: "💘" },
    { cat: "anniversaries", title: "Anniversaries · Aniversarios", emoji: "🥂" },
    { cat: "big-win", title: "The big win · El gran triunfo", emoji: "🏆" },
    { cat: "costumes", title: "Costumes · Disfraces", emoji: "🎭" },
    { cat: "little-things", title: "Little things · Cositas", emoji: "🎀" },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  //  Watchlist — everything you watched together (all made up here).
  //  kind: "peli" (movie) | "serie" (series) · fav: true highlights it ❤️ ·
  //  note: a special caption for the featured ones.
  //  Watchlist — todo lo que vieron juntos (acá todo inventado).
  //  kind: "peli" | "serie" · fav: true la destaca ❤️ · note: texto especial.
  // ───────────────────────────────────────────────────────────────────────────
  watchlist: [
    // EN · Featured (shown big on top) · ES · Destacadas (van grandes arriba)
    { title: "The Midnight Library", kind: "peli", fav: true, note: "our first movie · nuestra primera peli" },
    { title: "Starlight Hollow", kind: "serie", fav: true, note: "the one we binged · la que maratoneamos" },
    { title: "Letters to the Moon", kind: "serie", fav: true, note: "the one that made you cry · la que te hizo llorar" },

    // EN · The rest of the list · ES · El resto de la lista
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
    // 👉 EN · add or remove anything. `note: "..."` makes one featured.
    // 👉 ES · agregá o sacá lo que quieras. `note: "..."` la destaca.
  ] as { title: string; kind: "peli" | "serie"; fav: boolean; note?: string }[],

  // ───────────────────────────────────────────────────────────────────────────
  //  TikTok that closes the "watched together" chapter. Replace with your own:
  //  paste a video URL and its numeric id. Leave as-is to show a placeholder.
  //  TikTok que cierra el capítulo de las pelis. Reemplazá con el tuyo: pegá la
  //  URL del video y su id numérico. Dejalo así para mostrar un placeholder.
  // ───────────────────────────────────────────────────────────────────────────
  tiktok: {
    url: "https://www.tiktok.com/",
    videoId: "0000000000000000000",
    caption: "Your favorite video · Tu video favorito 🎬",
  },
} as const;

export type Config = typeof config;

// ─────────────────────────────────────────────────────────────────────────────
//  config.ts — el ÚNICO archivo que Franco necesita editar ✏️
//  Cambiá nombres, fechas y la lista de pelis/series acá. El resto se acomoda solo.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  names: {
    her: "Ivi",
    him: "Puri",
    couple: "Puri & Ivi",
  },

  dates: {
    // Formato: YYYY-MM-DD (año-mes-día)
    together: "2022-07-26", // 💘 aniversario — el día que empezaron
    met: "2022-03-15", // 🎓 el día que se conocieron en la facu
    anniversaryYears: 4,
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Hero — la foto grande y el "main character" de cada uno (aparece al hacer
  //  hover sobre cada persona en la foto). Ivi está a la izquierda, Fran a la
  //  derecha.
  // ───────────────────────────────────────────────────────────────────────────
  hero: {
    // Foto del hero. Con pixelSrc en null se usa la foto real (cat/slug);
    // poné "/hero-8bit.jpg" para volver al arte 8-bit.
    pixelSrc: null as string | null,
    cat: "bariloche",
    slug: "f9b37c4a-db15-46e1-ab37-eadd1999f6f9",
  },

  people: {
    ivi: {
      name: "Ivi",
      tagline: "main character energy",
      traits: [
        { icon: "📚", label: "Leer" },
        { icon: "🍝", label: "Comer rico" },
        { icon: "❤️", label: "Amor" },
        { icon: "📈", label: "Marketing loverr" },
      ],
      artists: [
        { name: "Sabrina Carpenter", img: "/brand/artists/sabrina-carpenter.jpg" },
        { name: "Tini", img: "/brand/artists/tini.jpg" },
        { name: "Emilia", img: "/brand/artists/emilia.jpg" },
      ],
    },
    fran: {
      name: "Fran",
      tagline: "aka Puri",
      traits: [
        { icon: "💻", label: "Tech guy" },
        { icon: "⚽", label: "Fútbol" },
        { icon: "🍳", label: "Cocinar" },
      ],
      artists: [
        { name: "The Beatles", img: "/brand/artists/the-beatles.jpg" },
        { name: "Red Hot Chili Peppers", img: "/brand/artists/rhcp.jpg" },
        { name: "Imagine Dragons", img: "/brand/artists/imagine-dragons.jpg" },
      ],
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  //  Escenarios — cada carpeta de ~/Downloads/Fotos aniversario es una
  //  categoría (ver lib/photos.ts). Acá se define cómo se muestran.
  // ───────────────────────────────────────────────────────────────────────────
  viajes: [
    { cat: "bariloche", title: "Bariloche", place: "Argentina", flag: "/brand/flags/ar.png" },
    { cat: "chile", title: "Chile", place: "Chile", flag: "/brand/flags/cl.png" },
    { cat: "mexico", title: "México", place: "México", flag: "/brand/flags/mx.png" },
    { cat: "uruguay", title: "Uruguay", place: "Uruguay", flag: "/brand/flags/uy.png" },
    { cat: "otros-viajes", title: "Más escapadas", place: "por todos lados", emoji: "✈️" },
  ],

  // (la mudanza ahora es su propio capítulo de la historia, por eso no está acá)
  momentos: [
    { cat: "san-valentin", title: "San Valentín", emoji: "💘" },
    { cat: "aniversarios", title: "Aniversarios", emoji: "🥂" },
    { cat: "mundial", title: "El Mundial", emoji: "🏆", flag: "/brand/flags/ar.png" },
    { cat: "halloween", title: "Halloween", emoji: "🎃" },
    { cat: "otros-cute", title: "Cositas cute", emoji: "🎀" },
  ],

  // ───────────────────────────────────────────────────────────────────────────
  //  Cap. 4 · "Lo que vimos juntos"
  //  Todo lo que Puri & Ivi miraron juntos. Para agregar/sacar, editá esta lista.
  //  kind: "peli" | "serie"  ·  fav: true la resalta ❤️  ·  note: texto especial
  // ───────────────────────────────────────────────────────────────────────────
  watchlist: [
    // ⭐ Las especiales (van destacadas arriba)
    { title: "Wendy Wu", kind: "peli", fav: true, note: "nuestra primera peli" },
    { title: "Attack on Titan", kind: "serie", fav: true, note: "la que maratoneamos" },
    { title: "Kimetsu no Yaiba", kind: "serie", fav: true, note: "la que te hizo llorar" },

    // 🍥 Animes
    { title: "My Hero Academia", kind: "serie", fav: false },
    { title: "That Time I Got Reincarnated as a Slime", kind: "serie", fav: false },
    { title: "The Promised Neverland", kind: "serie", fav: false },
    { title: "The Greatest Demon Lord Is Reborn as a Typical Nobody", kind: "serie", fav: false },
    { title: "Fullmetal Alchemist: Brotherhood", kind: "serie", fav: false },
    { title: "The Aristocrat's Otherworldly Adventure", kind: "serie", fav: false },
    { title: "Dr. Stone", kind: "serie", fav: false },
    { title: "Chainsaw Man", kind: "serie", fav: false },
    { title: "SPY x FAMILY", kind: "serie", fav: false },
    { title: "Mushoku Tensei: Jobless Reincarnation", kind: "serie", fav: false },
    { title: "Jujutsu Kaisen", kind: "serie", fav: false },
    { title: "Death Note", kind: "serie", fav: false },
    { title: "The Apothecary Diaries", kind: "serie", fav: false },
    { title: "Blue Exorcist", kind: "serie", fav: false },
    { title: "Mashle: Magic and Muscles", kind: "serie", fav: false },
    { title: "Solo Leveling", kind: "serie", fav: false },
    { title: "Gods' Games We Play", kind: "serie", fav: false },
    { title: "Viral Hit", kind: "serie", fav: false },
    { title: "The World's Finest Assassin Reincarnated", kind: "serie", fav: false },
    { title: "Kaiju No. 8", kind: "serie", fav: false },
    { title: "Hunter x Hunter", kind: "serie", fav: false },
    { title: "Tokyo Revengers", kind: "serie", fav: false },
    { title: "Kill Blue", kind: "serie", fav: false },
    { title: "Sakamoto Days", kind: "serie", fav: false },
    { title: "Dandadan", kind: "serie", fav: false },
    { title: "Haikyuu!!", kind: "serie", fav: false },
    { title: "Kakegurui", kind: "serie", fav: false },

    // 📺 Series
    { title: "The King's Affection", kind: "serie", fav: false },
    { title: "Echoes", kind: "serie", fav: false },
    { title: "I Will Find You", kind: "serie", fav: false },
    { title: "Billionaires' Bunker", kind: "serie", fav: false },
    { title: "Soulmates", kind: "serie", fav: false },
    { title: "The Witcher", kind: "serie", fav: false },
    { title: "3 Body Problem", kind: "serie", fav: false },
    { title: "Envious", kind: "serie", fav: false },
    { title: "The Night Agent", kind: "serie", fav: false },
    { title: "Anne with an E", kind: "serie", fav: false },
    { title: "His & Hers", kind: "serie", fav: false },
    { title: "The Perfect Couple", kind: "serie", fav: false },
    { title: "Stranger Things", kind: "serie", fav: false },
    { title: "Young Sheldon", kind: "serie", fav: false },
    { title: "Squid Game", kind: "serie", fav: false },
    { title: "When the Phone Rings", kind: "serie", fav: false },
    { title: "You", kind: "serie", fav: false },
    { title: "Black Mirror", kind: "serie", fav: false },
    { title: "Adolescence", kind: "serie", fav: false },
    { title: "Crash Landing on You", kind: "serie", fav: false },
    { title: "Billions", kind: "serie", fav: false },
    { title: "Baby Reindeer", kind: "serie", fav: false },
    { title: "3%", kind: "serie", fav: false },
    { title: "Elite", kind: "serie", fav: false },
    { title: "Sex Education", kind: "serie", fav: false },
    { title: "Biohackers", kind: "serie", fav: false },

    // 🎬 Pelis
    { title: "The Woman in the Window", kind: "peli", fav: false },
    { title: "Carry-On", kind: "peli", fav: false },
    { title: "The Woman in Cabin 10", kind: "peli", fav: false },
    { title: "Don't Move", kind: "peli", fav: false },
    { title: "KPop Demon Hunters", kind: "peli", fav: false },
    { title: "Get Out", kind: "peli", fav: false },
    { title: "People We Meet on Vacation", kind: "peli", fav: false },
    { title: "Happy Gilmore 2", kind: "peli", fav: false },
    { title: "The Hangover", kind: "peli", fav: false },
    { title: "The Hunger Games", kind: "peli", fav: false },
    { title: "Avatar", kind: "peli", fav: false },
    { title: "Jeffrey Epstein", kind: "peli", fav: false },
    // 👉 Franco: agregá o sacá lo que quieras. Poné note: "..." para destacar una.
  ] as { title: string; kind: "peli" | "serie"; fav: boolean; note?: string }[],

  // TikTok que cierra el capítulo de las pelis — "Una película sin fin 🥰♥️"
  tiktok: {
    url: "https://www.tiktok.com/@iviwang/video/7341422188127358213",
    videoId: "7341422188127358213",
    caption: "Una película sin fin 🥰♥️",
  },
} as const;

export type Config = typeof config;

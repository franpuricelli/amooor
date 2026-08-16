// ─────────────────────────────────────────────────────────────────────────────
//  content.ts — copy + media for the "Historia" editorial template. Español
//  (locale default). English lives in content.en.ts with the SAME shape
//  (`EditorialContent`). <EditorialTemplate content={...}> is purely
//  presentational: it reads everything from here, so each locale is
//  self-contained (mismo criterio que lib/marketing.ts ↔ lib/marketing.en.ts).
//
//  Sample data = Puri & Ivi (purivi.love). Las fotos son las reales del sitio,
//  servidas desde www.purivi.love (/thumbs = miniatura, /photos = full). Se
//  referencian por URL absoluta a propósito, para que este preview sea
//  self-contained sin copiar binarios al repo.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://www.purivi.love";
/** Miniatura de una foto (categoría + slug del manifiesto de purivi). */
export const THUMB = (cat: string, slug: string) => `${BASE}/thumbs/${cat}/${slug}.jpg`;
/** Foto full-size. */
export const FULL = (cat: string, slug: string) => `${BASE}/photos/${cat}/${slug}.jpg`;
/** Banderita de país (brand/flags). */
export const FLAG = (code: string) => `${BASE}/brand/flags/${code}.png`;
/** El dibujo del cierre. */
export const DRAWING = `${BASE}/drawing.png`;

// The content shape lives in the shared contract so the plain skeleton and this
// per-couple adaptation stay in sync. See ./content-schema.
import type { EditorialContent } from "./content-schema";

const editorial: EditorialContent = {
  locale: "es",
  couple: { a: "Puri", b: "Ivi" },
  nav: {
    links: [
      { label: "Historia", href: "#historia" },
      { label: "Viajes", href: "#viajes" },
      { label: "Momentos", href: "#momentos" },
      { label: "Nosotros", href: "#nosotros" },
    ],
    date: "26·07·2022 → ∞",
  },
  scrollLabel: "Scroll",

  hero: {
    eyebrow: "Nuestra historia · 26·07·2022",
    line1: "Cuatro años",
    line2: "de nosotros.",
    lede: "Esta es nuestra historia, desde el día que nos cruzamos en la facu hasta hoy. En fotos, como nos gusta recordarla.",
    cta: "Nuestra historia",
    img: FULL("bariloche", "f9b37c4a-db15-46e1-ab37-eadd1999f6f9"),
    alt: "Puri e Ivi en Bariloche",
  },

  facts: [
    { icon: "calendar", title: "2022", sub: "El año que empezó todo" },
    { icon: "plane", title: "5 países", sub: "Juntos por el mundo" },
    { icon: "heart", title: "470 fotos", sub: "Momentos guardados" },
    { icon: "infinity", title: "∞ mates", sub: "Y contando" },
  ],

  story: {
    eyebrow: "Nuestros comienzos",
    title: "Cómo empezó todo",
    lede: "Tres momentos que lo cambiaron todo, en orden.",
    beats: [
      {
        kicker: "15·03·2022 · la facu",
        title: "Nos conocimos en la facu",
        text: "Un día cualquiera de marzo, entre clases y parciales, nos cruzamos. Nadie nos avisó que ese día empezaba todo. Después llegó tu graduación, y ahí estuve: aplaudiendo más fuerte que nadie.",
        photos: [
          THUMB("graduacion-ivi", "img-7009"), THUMB("graduacion-ivi", "img-6998"),
          THUMB("graduacion-ivi", "img-7027"), THUMB("graduacion-ivi", "whatsapp-image-2026-07-27-at-21-05-23"),
        ],
        alt: "La graduación de Ivi",
      },
      {
        kicker: "26·07·2022",
        title: "Nos enamoramos",
        text: "De un mate compartido a «¿somos novios?». El primer año juntis fue eso: planes chiquitos, risas enormes y un San Valentín que dejó de ser un día cualquiera para siempre.",
        photos: [
          THUMB("primer-a-no-juntis", "img-4591"), THUMB("primer-a-no-juntis", "1c5a9b34-b644-44d8-b3bf-684739026fc1"),
          THUMB("primer-a-no-juntis", "24b3a4f0-cfd6-4eb1-bf33-5db703ab5d38"), THUMB("primer-a-no-juntis", "761f68b6-fede-4de6-a2b9-97270dad74fa"),
          THUMB("primer-a-no-juntis", "7d1c3db6-7386-42f6-8130-65562bf4b53e"), THUMB("primer-a-no-juntis", "a7bf9c6e-415d-4709-b567-914c054d7225"),
        ],
        alt: "Nuestro primer año juntos",
      },
      {
        kicker: "las llaves nuevas",
        title: "Nos mudamos juntos",
        text: "Cajas, mudanza y un espacio que de a poco se volvió nuestro. Ahora el plan favorito es simplemente estar en casa.",
        photos: [
          THUMB("mudanza", "img-1904"), THUMB("mudanza", "2c09469b-4cdf-404e-a303-9167ee02e756"),
          THUMB("mudanza", "35ce9ef8-9487-4195-a9d9-91a8e31c3da3"), THUMB("mudanza", "5bf1868f-ecbb-47d8-a016-6009234ff3a0"),
          THUMB("mudanza", "a0653c64-3e5b-46bc-be12-908e294fceb2"),
        ],
        alt: "El día de la mudanza",
      },
    ],
  },

  moments: {
    eyebrow: "Y en el medio…",
    title: "Celebramos todo",
    lede: "San Valentín, aniversarios, el Mundial que ganamos y todas las cositas cute del medio.",
    tabs: [
      {
        key: "san-valentin",
        label: "San Valentín",
        items: [
          { img: THUMB("san-valentin", "img-1321"), title: "San Valentín", sub: "Nuestro primero" },
          { img: THUMB("san-valentin", "img-9177"), title: "14 de febrero", sub: "Otra vez juntos" },
          { img: THUMB("san-valentin", "img-9195"), title: "Flores", sub: "Como siempre" },
          { img: THUMB("san-valentin", "img-1514"), title: "Cena especial", sub: "En casa" },
        ],
        more: [
          THUMB("san-valentin", "img-1322"), THUMB("san-valentin", "img-1355"), THUMB("san-valentin", "img-1516"),
          THUMB("san-valentin", "img-1519"), THUMB("san-valentin", "img-2968"), THUMB("san-valentin", "img-2978"),
          THUMB("san-valentin", "img-6286"), THUMB("san-valentin", "img-6295"), THUMB("san-valentin", "img-9178"),
        ],
      },
      {
        key: "aniversarios",
        label: "Aniversarios",
        items: [
          { img: THUMB("aniversarios", "facetune-27-07-2023-00-37-10"), title: "Un año", sub: "2023" },
          { img: THUMB("aniversarios", "img-3703"), title: "Brindis", sub: "Por nosotros" },
          { img: THUMB("aniversarios", "d30b99a2-228b-4a6f-aace-476e701550d9"), title: "Otro año más", sub: "Y los que vienen" },
        ],
        more: [],
      },
      {
        key: "mundial",
        label: "El Mundial",
        items: [
          { img: THUMB("mundial", "img-1183"), title: "¡Campeones!", sub: "Argentina, 2022" },
          { img: THUMB("mundial", "facetune-18-12-2022-19-09-22"), title: "La final", sub: "18·12·2022" },
          { img: THUMB("mundial", "352cab01-e6ef-48f8-a3c7-3b9a09dac220-2"), title: "Festejo", sub: "En las calles" },
        ],
        more: [
          THUMB("mundial", "d69c0efd-0c86-467f-b58e-169a50cbedf4-2"),
          THUMB("mundial", "dd3752f9-dbdc-49f7-8978-71a70344cdc5-2"),
          THUMB("mundial", "facetune-18-12-2022-19-09-22-1"),
        ],
      },
      {
        key: "halloween",
        label: "Halloween",
        items: [
          { img: THUMB("halloween", "facetune-29-10-2022-23-22-31"), title: "Disfraces", sub: "31 de octubre" },
          { img: THUMB("halloween", "facetune-29-10-2022-23-24-46"), title: "Noche de brujas", sub: "Juntos" },
        ],
        more: [],
      },
      {
        key: "cute",
        label: "Cositas cute",
        items: [
          { img: THUMB("otros-cute", "img-3567"), title: "Un día normal", sub: "Los mejores" },
          { img: THUMB("otros-cute", "img-6244"), title: "Selfie", sub: "Porque sí" },
          { img: THUMB("otros-cute", "img-6919"), title: "Juntitos", sub: "Como siempre" },
          { img: THUMB("otros-cute", "img-6546"), title: "Nosotros", sub: "Sin motivo" },
        ],
        more: [
          THUMB("otros-cute", "img-6245"), THUMB("otros-cute", "img-6547"), THUMB("otros-cute", "img-6616"),
          THUMB("otros-cute", "img-6920"), THUMB("otros-cute", "1479d7c5-f16f-4820-a84d-4a5fcb8dd884"),
          THUMB("otros-cute", "2089a4cf-f76d-43c4-9e35-34d29278a002"), THUMB("otros-cute", "325595d7-1224-4d01-9dee-d2fc38f249df"),
          THUMB("otros-cute", "3e8c7eb3-eac6-49de-9666-37a5def5fc92"),
        ],
      },
    ],
  },

  travel: {
    eyebrow: "Con la valija lista",
    title: "Viajamos",
    lede: "Bariloche fue el primero. Después cruzamos la cordillera, un trópico y un charco. En todos lados, la misma foto: nosotros.",
    destinations: [
      { title: "Bariloche", place: "Argentina", flag: FLAG("ar"), img: THUMB("bariloche", "1b9a5458-a379-4609-8809-19e7710cc705"), count: "21 fotos" },
      { title: "Chile", place: "Chile", flag: FLAG("cl"), img: THUMB("chile", "img-8438"), count: "18 fotos" },
      { title: "México", place: "México", flag: FLAG("mx"), img: THUMB("mexico", "4b9c2658-5c4f-4d64-a14f-6493e01bbb7e"), count: "51 fotos" },
      { title: "Uruguay", place: "Uruguay", flag: FLAG("uy"), img: THUMB("uruguay", "img-0912"), count: "35 fotos" },
      { title: "Más escapadas", place: "por todos lados", emoji: "✈️", img: THUMB("otros-viajes", "1e245c4d-0849-4edf-bc86-830799feae81"), count: "33 fotos" },
    ],
  },

  dining: {
    eyebrow: "Nuestra mesa",
    big: {
      img: THUMB("almuerzos-cenas", "img-9347"),
      title: "Comimos rico",
      text: "Restaurantes, delivery y esas cenas en casa que cocinamos juntos. La mesa siempre fue nuestro plan favorito, y la sobremesa más todavía.",
    },
    green: {
      titleLead: "Nuestra receta",
      titleMuted: "es simple",
      checklist: ["Cocinar juntos", "Sobremesa larga", "Postre compartido"],
      art: THUMB("almuerzos-cenas", "img-7805"),
    },
    light: {
      eyebrow: "El plan favorito",
      title: "Estar en casa",
      thumb: THUMB("almuerzos-cenas", "img-0965"),
    },
  },

  why: {
    eyebrow: "Lo que nos une",
    titleLead: "Un amor de",
    titleEm: "todos los días.",
    lede: "No somos perfectos, somos nuestros. Creemos que el amor se construye en lo pequeño: un mate compartido, una serie a medianoche, un «te amo» dicho sin apuro.",
    img: THUMB("otros-cute", "img-6919"),
    cards: [
      { icon: "spark", title: "Complicidad", sub: "Nos entendemos con una mirada." },
      { icon: "leaf", title: "Aventura", sub: "Siempre listos para lo que venga." },
      { icon: "home", title: "Hogar", sub: "Donde estás vos, estoy en casa." },
      { icon: "infinity", title: "Para siempre", sub: "Elegirte, todos los días." },
    ],
  },

  watch: {
    eyebrow: "De noche · 68 títulos",
    title: "Maratoneamos",
    lede: "Pelis, series y madrugadas de «un capítulo más». Nuestra propia programación.",
    favs: [
      { title: "Wendy Wu", kind: "Película", note: "Nuestra primera peli" },
      { title: "Attack on Titan", kind: "Serie", note: "La que maratoneamos" },
      { title: "Kimetsu no Yaiba", kind: "Serie", note: "La que te hizo llorar" },
    ],
    moreLabel: "…y las que faltan",
    titles: [
      "Jujutsu Kaisen", "Death Note", "SPY x FAMILY", "Chainsaw Man", "Solo Leveling",
      "Dr. Stone", "Haikyuu!!", "Dandadan", "Hunter x Hunter", "Stranger Things",
      "The Witcher", "Squid Game", "You", "Black Mirror", "Sex Education",
      "Crash Landing on You", "Elite", "The Night Agent", "Baby Reindeer",
      "Get Out", "The Hunger Games", "Avatar", "The Hangover", "Carry-On",
    ],
  },

  counter: {
    eyebrow: "…y acá estamos",
    since: "2022-07-26T00:00:00",
    labels: { days: "días", hours: "horas", mins: "min", secs: "seg" },
    chips: ["470 fotos", "5 países", "68 títulos vistos", "∞ mates"],
    metLead: "Nos conocimos el",
    metDate: "15·03·2022",
  },

  gallery: {
    eyebrow: "❤ Wall of love",
    title: "Todos los recuerdos",
    lede: "Cada foto es un día que elegimos estar juntos. Un pedacito de los 470.",
    photos: [
      THUMB("bariloche", "274e3ce2-db16-4b94-84b8-74282816c8d9"), THUMB("mexico", "a1510de8-c81f-4de7-a6d6-3428050c73de"), THUMB("uruguay", "img-0914"),
      THUMB("primer-a-no-juntis", "1c5a9b34-b644-44d8-b3bf-684739026fc1"), THUMB("chile", "img-8521"), THUMB("otros-cute", "5ea8b651-f600-4805-955d-f7ac8ce58d59-2"),
      THUMB("san-valentin", "img-9177"), THUMB("bariloche", "583128c7-a8a7-48be-8c0d-fe8cada07471"), THUMB("mexico", "img-7613"),
      THUMB("almuerzos-cenas", "img-9347"), THUMB("uruguay", "img-0938"), THUMB("otros-cute", "99597011-f36d-478c-8ab1-8e9a491e4821"),
      THUMB("mundial", "352cab01-e6ef-48f8-a3c7-3b9a09dac220-2"), THUMB("chile", "img-8600"), THUMB("mexico", "img-7685"),
      THUMB("bariloche", "b5da46e1-d709-4c4c-bf29-edbe44a16382"), THUMB("otros-viajes", "bcaecf8b-b6ca-4a52-9e20-efc8cfb8a73a"), THUMB("san-valentin", "img-9195"),
      THUMB("uruguay", "img-0982"), THUMB("otros-cute", "ebca7fdb-3bae-408b-b328-0d565be7d2ac"), THUMB("mexico", "img-7741"),
      THUMB("mudanza", "img-1905"), THUMB("chile", "img-8798"), THUMB("aniversarios", "d30b99a2-228b-4a6f-aace-476e701550d9"),
      THUMB("bariloche", "eee1f816-3f3f-4fd9-942c-bf24cb6a351c"), THUMB("otros-cute", "img-6547"),
      THUMB("mexico", "img-7477"), THUMB("uruguay", "photo-2026-07-25-18-35-56-2"),
    ],
  },

  closing: {
    title: "Feliz aniversario, mi amor",
    line: "4 años · 26.07.2022 → ∞",
    drawingSrc: DRAWING,
    drawingAlt: "Nosotros dos, dibujados",
    message: "Te amo",
    from: "De: Fran",
    frontAria: "Ver el mensaje",
    backAria: "Ver el dibujo",
  },

  footer: {
    credit: "Hecho por Puri, con amor (y un poco de código) ❤️",
  },

  ui: {
    photoView: "Ver foto",
    seeAll: "Ver todas",
  },

  music: {
    src: "https://canny-pheasant-391.convex.site/audio/music/when-i-was-your-man.mp3",
    playLabel: "Reproducir la música",
    pauseLabel: "Pausar la música",
  },
};

export default editorial;

// ─────────────────────────────────────────────────────────────────────────────
//  content.en.ts — English copy for the "Historia" editorial template (locale
//  "en", served at /en/template/<slug>). Same shape as content.ts (Spanish
//  default). Photos come from the shared THUMB/FULL/FLAG/DRAWING helpers
//  (purivi.love), so image URLs live in one place. Puri & Ivi is a real couple,
//  so names/places aren't translated — only narration is.
// ─────────────────────────────────────────────────────────────────────────────

import { THUMB, FULL, FLAG, DRAWING } from "./content";
import type { EditorialContent } from "./content-schema";

const editorialEn: EditorialContent = {
  locale: "en",
  couple: { a: "Puri", b: "Ivi" },
  nav: {
    links: [
      { label: "Story", href: "#historia" },
      { label: "Travel", href: "#viajes" },
      { label: "Moments", href: "#momentos" },
      { label: "Us", href: "#nosotros" },
    ],
    date: "26·07·2022 → ∞",
  },
  scrollLabel: "Scroll",

  hero: {
    eyebrow: "Our story · 07·26·2022",
    line1: "Four years",
    line2: "of us.",
    lede: "This is our story, from the day we met at university until today. In photos, the way we like to remember it.",
    cta: "Our story",
    img: FULL("bariloche", "f9b37c4a-db15-46e1-ab37-eadd1999f6f9"),
    alt: "Puri and Ivi in Bariloche",
  },

  facts: [
    { icon: "calendar", title: "2022", sub: "The year it all began" },
    { icon: "plane", title: "5 countries", sub: "Around the world together" },
    { icon: "heart", title: "470 photos", sub: "Moments we kept" },
    { icon: "infinity", title: "∞ mates", sub: "And counting" },
  ],

  story: {
    eyebrow: "Our beginnings",
    title: "How it all started",
    lede: "Three moments that changed everything, in order.",
    beats: [
      {
        kicker: "03·15·2022 · university",
        title: "We met at university",
        text: "One ordinary March day, between classes and midterms, we crossed paths. No one warned us it was the day everything began. Then came your graduation, and there I was: cheering louder than anyone.",
        photos: [
          THUMB("graduacion-ivi", "img-7009"), THUMB("graduacion-ivi", "img-6998"),
          THUMB("graduacion-ivi", "img-7027"), THUMB("graduacion-ivi", "whatsapp-image-2026-07-27-at-21-05-23"),
        ],
        alt: "Ivi's graduation",
      },
      {
        kicker: "07·26·2022",
        title: "We fell in love",
        text: "From a shared mate to «are we dating?». Our first year together was just that: little plans, huge laughs, and a Valentine's Day that stopped being ordinary forever.",
        photos: [
          THUMB("primer-a-no-juntis", "img-4591"), THUMB("primer-a-no-juntis", "1c5a9b34-b644-44d8-b3bf-684739026fc1"),
          THUMB("primer-a-no-juntis", "24b3a4f0-cfd6-4eb1-bf33-5db703ab5d38"), THUMB("primer-a-no-juntis", "761f68b6-fede-4de6-a2b9-97270dad74fa"),
          THUMB("primer-a-no-juntis", "7d1c3db6-7386-42f6-8130-65562bf4b53e"), THUMB("primer-a-no-juntis", "a7bf9c6e-415d-4709-b567-914c054d7225"),
        ],
        alt: "Our first year together",
      },
      {
        kicker: "the new keys",
        title: "We moved in together",
        text: "Boxes, moving day, and a space that slowly became ours. Now our favorite plan is simply being home.",
        photos: [
          THUMB("mudanza", "img-1904"), THUMB("mudanza", "2c09469b-4cdf-404e-a303-9167ee02e756"),
          THUMB("mudanza", "35ce9ef8-9487-4195-a9d9-91a8e31c3da3"), THUMB("mudanza", "5bf1868f-ecbb-47d8-a016-6009234ff3a0"),
          THUMB("mudanza", "a0653c64-3e5b-46bc-be12-908e294fceb2"),
        ],
        alt: "Moving day",
      },
    ],
  },

  moments: {
    eyebrow: "And in between…",
    title: "We celebrated everything",
    lede: "Valentine's, anniversaries, the World Cup we won, and all the cute little things in between.",
    tabs: [
      {
        key: "san-valentin",
        label: "Valentine's",
        items: [
          { img: THUMB("san-valentin", "img-1321"), title: "Valentine's", sub: "Our first" },
          { img: THUMB("san-valentin", "img-9177"), title: "February 14", sub: "Together again" },
          { img: THUMB("san-valentin", "img-9195"), title: "Flowers", sub: "As always" },
          { img: THUMB("san-valentin", "img-1514"), title: "Special dinner", sub: "At home" },
        ],
        more: [
          THUMB("san-valentin", "img-1322"), THUMB("san-valentin", "img-1355"), THUMB("san-valentin", "img-1516"),
          THUMB("san-valentin", "img-1519"), THUMB("san-valentin", "img-2968"), THUMB("san-valentin", "img-2978"),
          THUMB("san-valentin", "img-6286"), THUMB("san-valentin", "img-6295"), THUMB("san-valentin", "img-9178"),
        ],
      },
      {
        key: "aniversarios",
        label: "Anniversaries",
        items: [
          { img: THUMB("aniversarios", "facetune-27-07-2023-00-37-10"), title: "One year", sub: "2023" },
          { img: THUMB("aniversarios", "img-3703"), title: "A toast", sub: "To us" },
          { img: THUMB("aniversarios", "d30b99a2-228b-4a6f-aace-476e701550d9"), title: "Another year", sub: "And more to come" },
        ],
        more: [],
      },
      {
        key: "mundial",
        label: "World Cup",
        items: [
          { img: THUMB("mundial", "img-1183"), title: "Champions!", sub: "Argentina, 2022" },
          { img: THUMB("mundial", "facetune-18-12-2022-19-09-22"), title: "The final", sub: "12·18·2022" },
          { img: THUMB("mundial", "352cab01-e6ef-48f8-a3c7-3b9a09dac220-2"), title: "Celebration", sub: "In the streets" },
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
          { img: THUMB("halloween", "facetune-29-10-2022-23-22-31"), title: "Costumes", sub: "October 31" },
          { img: THUMB("halloween", "facetune-29-10-2022-23-24-46"), title: "Spooky night", sub: "Together" },
        ],
        more: [],
      },
      {
        key: "cute",
        label: "Cute things",
        items: [
          { img: THUMB("otros-cute", "img-3567"), title: "An ordinary day", sub: "The best ones" },
          { img: THUMB("otros-cute", "img-6244"), title: "Selfie", sub: "Just because" },
          { img: THUMB("otros-cute", "img-6919"), title: "Together", sub: "As always" },
          { img: THUMB("otros-cute", "img-6546"), title: "Us", sub: "No reason" },
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
    eyebrow: "Bags packed",
    title: "We traveled",
    lede: "Bariloche was the first. Then we crossed the mountains, a tropic, and a river. Everywhere, the same photo: us.",
    destinations: [
      { title: "Bariloche", place: "Argentina", flag: FLAG("ar"), img: THUMB("bariloche", "1b9a5458-a379-4609-8809-19e7710cc705"), count: "21 photos" },
      { title: "Chile", place: "Chile", flag: FLAG("cl"), img: THUMB("chile", "img-8438"), count: "18 photos" },
      { title: "Mexico", place: "Mexico", flag: FLAG("mx"), img: THUMB("mexico", "4b9c2658-5c4f-4d64-a14f-6493e01bbb7e"), count: "51 photos" },
      { title: "Uruguay", place: "Uruguay", flag: FLAG("uy"), img: THUMB("uruguay", "img-0912"), count: "35 photos" },
      { title: "More escapes", place: "all over", emoji: "✈️", img: THUMB("otros-viajes", "1e245c4d-0849-4edf-bc86-830799feae81"), count: "33 photos" },
    ],
  },

  dining: {
    eyebrow: "Our table",
    big: {
      img: THUMB("almuerzos-cenas", "img-9347"),
      title: "We ate well",
      text: "Restaurants, takeout, and those dinners at home we cooked together. The table was always our favorite plan, and lingering after even more.",
    },
    green: {
      titleLead: "Our recipe",
      titleMuted: "is simple",
      checklist: ["Cooking together", "Long conversations", "Shared dessert"],
      art: THUMB("almuerzos-cenas", "img-7805"),
    },
    light: {
      eyebrow: "The favorite plan",
      title: "Being home",
      thumb: THUMB("almuerzos-cenas", "img-0965"),
    },
  },

  why: {
    eyebrow: "What holds us together",
    titleLead: "An everyday",
    titleEm: "kind of love.",
    lede: "We're not perfect, we're ours. We believe love is built in the small things: a shared mate, a midnight show, an unhurried «I love you».",
    img: THUMB("otros-cute", "img-6919"),
    cards: [
      { icon: "spark", title: "Complicity", sub: "We understand each other with a glance." },
      { icon: "leaf", title: "Adventure", sub: "Always ready for whatever comes." },
      { icon: "home", title: "Home", sub: "Where you are, I'm home." },
      { icon: "infinity", title: "Forever", sub: "Choosing you, every day." },
    ],
  },

  watch: {
    eyebrow: "Late nights · 68 titles",
    title: "We binged",
    lede: "Movies, series, and late nights of «just one more episode». Our own programming.",
    favs: [
      { title: "Wendy Wu", kind: "Movie", note: "Our first movie" },
      { title: "Attack on Titan", kind: "Series", note: "The one we binged" },
      { title: "Kimetsu no Yaiba", kind: "Series", note: "The one that made you cry" },
    ],
    moreLabel: "…and the rest",
    titles: [
      "Jujutsu Kaisen", "Death Note", "SPY x FAMILY", "Chainsaw Man", "Solo Leveling",
      "Dr. Stone", "Haikyuu!!", "Dandadan", "Hunter x Hunter", "Stranger Things",
      "The Witcher", "Squid Game", "You", "Black Mirror", "Sex Education",
      "Crash Landing on You", "Elite", "The Night Agent", "Baby Reindeer",
      "Get Out", "The Hunger Games", "Avatar", "The Hangover", "Carry-On",
    ],
  },

  counter: {
    eyebrow: "…and here we are",
    since: "2022-07-26T00:00:00",
    labels: { days: "days", hours: "hours", mins: "min", secs: "sec" },
    chips: ["470 photos", "5 countries", "68 titles watched", "∞ mates"],
    metLead: "We met on",
    metDate: "03·15·2022",
  },

  gallery: {
    eyebrow: "❤ Wall of love",
    title: "All the memories",
    lede: "Every photo is a day we chose to be together. A little piece of the 470.",
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
    title: "Happy anniversary, my love",
    line: "4 years · 07.26.2022 → ∞",
    drawingSrc: DRAWING,
    drawingAlt: "The two of us, drawn",
    message: "I love you",
    from: "From: Fran",
    frontAria: "Show the message",
    backAria: "Show the drawing",
  },

  footer: {
    credit: "Made by Puri, with love (and a bit of code) ❤️",
  },

  ui: {
    photoView: "View photo",
    seeAll: "See all",
  },

  music: {
    src: "https://canny-pheasant-391.convex.site/audio/music/when-i-was-your-man.mp3",
    playLabel: "Play the music",
    pauseLabel: "Pause the music",
  },
};

export default editorialEn;

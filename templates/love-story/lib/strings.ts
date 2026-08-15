// ─────────────────────────────────────────────────────────────────────────────
//  strings.ts — all fixed UI / narrative copy, in both languages.
//  strings.ts — todo el texto fijo de UI / narrativa, en los dos idiomas.
//
//  EN · The language switch (top-right) toggles between `en` and `es`. Names,
//       trips, favorites etc. are your content and live in lib/config.ts.
//  ES · El switch de idioma (arriba a la derecha) alterna entre `en` y `es`.
//       Nombres, viajes, favoritos, etc. son tu contenido y viven en
//       lib/config.ts.
// ─────────────────────────────────────────────────────────────────────────────

export type Lang = "en" | "es";

export interface Dict {
  nav: { play: string; pause: string; music: string };
  hero: {
    coverAlt: string;
    lede: string;
    meet: string; // "{name}" placeholder is replaced in the component
    artistsLabel: string;
  };
  historia: {
    ch1: { kicker: string; title: string; text: string };
    ch2: { kicker: string; title: string; text: string };
    ch3: { kicker: string; title: string; text: string };
  };
  cocina: { kicker: string; title: string; text: string };
  viajes: { kicker: string; title: string; lede: string };
  momentos: { kicker: string; title: string; lede: string };
  pelis: { kicker: string; titlesWord: string; title: string; lede: string; more: string; tiktokLabel: string; kind: { peli: string; serie: string } };
  stats: {
    sinceKicker: string; // "…and here we are: together since"
    days: string; hours: string; mins: string; secs: string;
    photos: string; places: string; titles: string; moments: string;
    metPre: string; daysAgo: string; // "{n}" replaced
  };
  footer: { title: string; years: string; credit: string };
  drawing: { msg: string; from: string; toDrawing: string; toMessage: string; alt: string };
  gallery: { memories: string; title: string; lede: string; seeAll: string; close: string; photo: string };
  story: { seePhotos: string }; // "See the {n} photos"
  lightbox: { photo: string; close: string; prev: string; next: string; back: string; seeAll: string; ofPhotos: string };
  photosWord: string; // "photos" / "fotos"
}

export const STRINGS: Record<Lang, Dict> = {
  en: {
    nav: { play: "Play music", pause: "Pause music", music: "Music" },
    hero: {
      coverAlt: "Cover photo",
      lede: "Write the one line that sums up your story here.",
      meet: "Meet {name}",
      artistsLabel: "Favorite artists",
    },
    historia: {
      ch1: {
        kicker: "Chapter one",
        title: "How we met",
        text: "Tell the story of the very beginning — where you met and how it all started.",
      },
      ch2: {
        kicker: "Chapter two",
        title: "Falling in love",
        text: "The first year: small plans, big laughs, the day it became official.",
      },
      ch3: {
        kicker: "Chapter three",
        title: "A place of our own",
        text: "Boxes, a move, and a space that slowly became home.",
      },
    },
    cocina: {
      kicker: "Our table",
      title: "We ate well",
      text: "Restaurants, delivery and those dinners at home you cooked together.",
    },
    viajes: {
      kicker: "Bags packed",
      title: "We traveled",
      lede: "Every place you went, the same photo: the two of you. List your trips in lib/config.ts.",
    },
    momentos: {
      kicker: "In between",
      title: "We celebrated everything",
      lede: "The little celebrations along the way. Tap a card to see them all.",
    },
    pelis: {
      kicker: "At night",
      titlesWord: "titles",
      title: "We binged",
      lede: "Movies, series and «just one more episode» nights. Your own lineup.",
      more: "…and the rest",
      tiktokLabel: "and our never-ending movie ↓",
      kind: { peli: "movie", serie: "series" },
    },
    stats: {
      sinceKicker: "…and here we are: together since",
      days: "days", hours: "hours", mins: "min", secs: "sec",
      photos: "photos", places: "places", titles: "titles", moments: "moments",
      metPre: "…and counting. We met on",
      daysAgo: "{n} days ago",
    },
    footer: {
      title: "Happy anniversary, my love",
      years: "years",
      credit: "made with love (and a bit of code) ❤️",
    },
    drawing: {
      msg: "I love you",
      from: "From: {name}",
      toDrawing: "See the drawing",
      toMessage: "Flip the card",
      alt: "A drawing of the two of you",
    },
    gallery: {
      memories: "memories",
      title: "Wall of love",
      lede: "Every memory, all together. Tap any one to see it big.",
      seeAll: "See all",
      close: "Close",
      photo: "Photo",
    },
    story: { seePhotos: "See the {n} photos" },
    lightbox: { photo: "Photo", close: "Close", prev: "Previous", next: "Next", back: "◂ back", seeAll: "▦ see all", ofPhotos: "of" },
    photosWord: "photos",
  },
  es: {
    nav: { play: "Reproducir la música", pause: "Pausar la música", music: "Música" },
    hero: {
      coverAlt: "Foto de portada",
      lede: "Escribí acá la línea que resume su historia.",
      meet: "Conocé a {name}",
      artistsLabel: "Artistas favoritos",
    },
    historia: {
      ch1: {
        kicker: "Capítulo uno",
        title: "Cómo nos conocimos",
        text: "Contá el principio de todo: dónde se cruzaron y cómo empezó.",
      },
      ch2: {
        kicker: "Capítulo dos",
        title: "Nos enamoramos",
        text: "El primer año: planes chiquitos, risas enormes, el día que se hizo oficial.",
      },
      ch3: {
        kicker: "Capítulo tres",
        title: "Un lugar nuestro",
        text: "Cajas, mudanza y un espacio que de a poco se volvió hogar.",
      },
    },
    cocina: {
      kicker: "Nuestra mesa",
      title: "Comimos rico",
      text: "Restaurantes, delivery y esas cenas en casa que cocinaron juntos.",
    },
    viajes: {
      kicker: "Con la valija lista",
      title: "Viajamos",
      lede: "Cada lugar al que fueron, la misma foto: ustedes dos. Cargá tus viajes en lib/config.ts.",
    },
    momentos: {
      kicker: "Y en el medio…",
      title: "Celebramos todo",
      lede: "Las pequeñas celebraciones del camino. Tocá una carta para verlas todas.",
    },
    pelis: {
      kicker: "De noche",
      titlesWord: "títulos",
      title: "Maratoneamos",
      lede: "Pelis, series y madrugadas de «un capítulo más». Tu propia programación.",
      more: "…y las que faltan",
      tiktokLabel: "y nuestra película sin fin ↓",
      kind: { peli: "peli", serie: "serie" },
    },
    stats: {
      sinceKicker: "…y acá estamos: juntos desde el",
      days: "días", hours: "horas", mins: "min", secs: "seg",
      photos: "fotos", places: "lugares", titles: "títulos", moments: "momentos",
      metPre: "…y contando. Nos conocimos el",
      daysAgo: "hace {n} días",
    },
    footer: {
      title: "Feliz aniversario, mi amor",
      years: "años",
      credit: "hecho con amor (y un poco de código) ❤️",
    },
    drawing: {
      msg: "Te amo",
      from: "De: {name}",
      toDrawing: "Ver el dibujo",
      toMessage: "Dar vuelta la carta",
      alt: "Un dibujo de ustedes dos",
    },
    gallery: {
      memories: "recuerdos",
      title: "Wall of love",
      lede: "Todos los recuerdos, juntitos. Tocá cualquiera para verla grande.",
      seeAll: "Ver todas",
      close: "Cerrar",
      photo: "Foto",
    },
    story: { seePhotos: "Ver las {n} fotos" },
    lightbox: { photo: "Foto", close: "Cerrar", prev: "Anterior", next: "Siguiente", back: "◂ volver", seeAll: "▦ ver todas", ofPhotos: "de" },
    photosWord: "fotos",
  },
};

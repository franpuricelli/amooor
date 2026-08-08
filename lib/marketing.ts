// ─────────────────────────────────────────────────────────────────────────────
//  lib/marketing.ts — toda la copy de la landing pública de amooor.
//  Español (locale default). El inglés vive en lib/marketing.en.ts con la misma
//  forma. Los componentes leen el locale activo vía lib/marketing-context.
//  Los precios/planes salen de lib/pricing.ts (fuente única de montos); acá solo
//  vive el TEXTO de display por locale.
// ─────────────────────────────────────────────────────────────────────────────

import { PLANS, PLAN_ORDER } from "./pricing";
import type { PlanId } from "./pricing";

export interface NavLink {
  label: string;
  href: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  secondaryCta: string;
}

export interface HowItWorksStep {
  icon: string;
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SectionIntro {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export interface PlanDisplay {
  name: string;
  tagline: string;
  features: string[];
}

export interface ShowcaseCard {
  tag: string;
  couple: string;
  description: string;
  linkLabel: string;
  href: string;
  previewUrl: string;
  ariaView: string;
}

export interface UiStrings {
  once: string; // "pago único"
  currency: string; // "US$"
  planLabel: string; // aria: "Plan {name}"
  startWith: string; // aria: "{startWith} {name}"
  inheritPrefix: string; // marca los features heredados ("Todo lo de …")
  navAria: string;
  openMenu: string;
  closeMenu: string;
  footerAria: string;
  commentsAria: string;
  statsAria: string;
  previewAria: string;
  wallImgAlt: string;
  langHref: string; // link al otro locale
  langLabel: string; // etiqueta del switch (ej. "EN")
}

export interface MarketingContent {
  lang: "es" | "en";
  home: string; // base del brand/footer link ("/" o "/en")
  brand: string;
  tagline: string;
  navLinks: NavLink[];
  hero: HeroContent;
  howIntro: SectionIntro;
  howItWorks: HowItWorksStep[];
  showcaseIntro: SectionIntro;
  showcaseCard: ShowcaseCard;
  wallIntro: SectionIntro;
  wallStats: { value: string; label: string }[];
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    signature: string;
    video: { url: string; videoId: string; caption: string };
  };
  pricingIntro: SectionIntro;
  plans: Record<PlanId, PlanDisplay>;
  faqIntro: SectionIntro;
  faq: FaqItem[];
  footerCta: { title: string };
  footer: { tagline: string; links: NavLink[] };
  ui: UiStrings;
}

// El texto de los planes en español ES el de pricing.ts (fuente única). En
// inglés se traduce en lib/marketing.en.ts.
const plansEs: Record<PlanId, PlanDisplay> = PLAN_ORDER.reduce(
  (acc, id) => {
    acc[id] = {
      name: PLANS[id].name,
      tagline: PLANS[id].tagline,
      features: PLANS[id].features,
    };
    return acc;
  },
  {} as Record<PlanId, PlanDisplay>,
);

const marketing: MarketingContent = {
  lang: "es",
  home: "/",
  brand: "amooor",
  tagline: "Sitios de aniversario que se sienten únicos.",

  navLinks: [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Ejemplos", href: "#ejemplos" },
    { label: "Nosotros", href: "#sobre-nosotros" },
    { label: "Precios", href: "#precios" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    eyebrow: "El sitio que su historia merece",
    title: "Tu amooor,\nhecho sitio.",
    subtitle:
      "Respondé algunas preguntas, subí sus fotos y en minutos tenés un sitio de aniversario hermoso y hecho a medida para compartir con quien más querés.",
    ctaLabel: "Comenzar",
    secondaryCta: "Ver ejemplos",
  },

  howIntro: {
    eyebrow: "Cómo funciona",
    title: "De cero a sitio en\ncuatro pasos.",
  },

  howItWorks: [
    {
      icon: "✍️",
      title: "Armás su historia",
      text: "Contanos quiénes son, cuándo se conocieron y qué los hace únicos. El asistente te guía paso a paso.",
    },
    {
      icon: "📸",
      title: "Subís sus fotos",
      text: "Subí todas las fotos que quieras, por viaje o por momento. Organizamos todo por vos.",
    },
    {
      icon: "✨",
      title: "Generamos tu sitio",
      text: "Con IA y un diseño hecho para el amooor, armamos un sitio que los representa de verdad.",
    },
    {
      icon: "🌐",
      title: "Conectás tu dominio",
      text: "Tu sitio vive en nombre.amooor.com o, si querés algo más especial, en su propio dominio .love.",
    },
  ],

  showcaseIntro: {
    eyebrow: "Ejemplos reales",
    title: "Sitios que ya\ncuentan su historia.",
    subtitle:
      "Cada sitio es distinto: paleta, secciones y contenido a medida de cada pareja. Este es el de Puri e Ivi.",
  },

  showcaseCard: {
    tag: "Historia real",
    couple: "Puri & Ivi",
    description:
      "Cuatro años juntos, contados foto por foto. Paleta rosa, música, contador en vivo y su propio dominio.",
    linkLabel: "Ver el sitio en purivi.love",
    href: "https://purivi.love/",
    previewUrl: "puri-e-ivi.amooor.com",
    ariaView: "Ver el sitio de Puri e Ivi",
  },

  wallIntro: {
    eyebrow: "Lo que piensa la gente",
    title: "Regalá un momento\ninolvidable.",
    subtitle:
      "El video de nuestra historia se volvió viral. Estos son comentarios reales de quienes lo vieron por primera vez.",
  },

  wallStats: [
    { value: "+600 mil", label: "Views" },
    { value: "+100 mil", label: "Me gusta" },
    { value: "+800", label: "Comentarios" },
  ],

  about: {
    eyebrow: "Sobre nosotros",
    title: "Empezó como\nun regalo.",
    paragraphs: [
      "Somos Ivi y Puri, una pareja que, sin planearlo, terminó convirtiendo su propia historia de amor en amooor.",
      "Todo empezó cuando cumplimos 4 años de novios. Para nuestro aniversario, Puri me hizo un regalo que no me esperaba para nada: una página web con toda nuestra historia. Tenía nuestras fotos, recuerdos, momentos importantes y un montón de detalles que me hicieron revivir nuestra relación desde el principio.",
      "Me emocionó tanto que se la mostré a todo el mundo: a mis amigos, a mi familia… y hasta subí un video a TikTok que terminó haciéndose viral.",
      "Cuando empezamos a leer los comentarios de tantas personas diciendo que les encantaría recibir algo así, pensamos: ¿por qué no ayudar a otras parejas a tener su propia página?",
      "Y así nació amooor. De nuestra historia, de un regalo que me conmovió muchísimo y de las ganas de que otras personas también puedan sentir algo así.",
      "Hoy creamos páginas personalizadas para convertir cada historia de amor en un regalo que no se guarda en un cajón, sino que se visita una y otra vez. Porque cada pareja tiene una historia que merece ser contada.",
    ],
    signature: "Con amooor, Ivi y Puri",
    video: {
      url: "https://www.tiktok.com/@iviwang/video/7667705851221773575",
      videoId: "7667705851221773575",
      caption: "El video que hice para mostrar nuestro sitio.",
    },
  },

  pricingIntro: {
    eyebrow: "Pago único, sin suscripción",
    title: "Un precio,\npara siempre.",
    subtitle:
      "Pagás una sola vez y tu sitio queda online sin costos mensuales. Elegí el plan que se ajuste a lo que quieren contar.",
  },

  plans: plansEs,

  faqIntro: {
    eyebrow: "Preguntas frecuentes",
    title: "Todo lo que\nnecesitás saber.",
  },

  faq: [
    {
      q: "¿Necesito saber programar o tener conocimientos técnicos?",
      a: "Para nada. amooor está pensado para cualquier persona. El asistente te guía paso a paso: respondés unas preguntas, subís las fotos y nosotros armamos todo. No hace falta escribir una sola línea de código.",
    },
    {
      q: "¿Cuánto tiempo lleva crear el sitio?",
      a: "Una vez que terminás el asistente y subís las fotos, el sitio está listo en minutos. El proceso completo te lleva entre 20 y 40 minutos, según cuánto detalle quieran agregar.",
    },
    {
      q: "¿Pueden editar el sitio después de pagarlo?",
      a: "Con Cupido el sitio queda fijo después de generado. Nuestra Historia incluye hasta 3 cambios personalizables, y Para Siempre te da cambios ilimitados: editás cualquier sección con IA escribiendo lo que querés.",
    },
    {
      q: "¿Qué pasa si quiero un dominio .love propio?",
      a: "Podés agregar tu dominio .love personalizado como upsell al momento del pago. El primer año está incluido; la renovación anual (~US$20) corre por tu cuenta.",
    },
    {
      q: "¿El sitio queda online para siempre?",
      a: "Sí. El hosting está incluido sin límite de tiempo. No hay costos mensuales ni vencimientos.",
    },
    {
      q: "¿Cuántas fotos puedo subir?",
      a: "El plan Cupido admite hasta 150 fotos. Los planes Nuestra Historia y Para Siempre aceptan fotos ilimitadas.",
    },
  ],

  footerCta: {
    title: "Armá el tuyo\nhoy.",
  },

  footer: {
    tagline: "Hecho con amooor.",
    links: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
      { label: "Contacto", href: "mailto:hola@amooor.com" },
    ],
  },

  ui: {
    once: "pago único",
    currency: "US$",
    planLabel: "Plan",
    startWith: "Comenzar con el plan",
    inheritPrefix: "Todo lo de",
    navAria: "Navegación principal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    footerAria: "Pie de página",
    commentsAria: "Comentarios de la gente",
    statsAria: "Repercusión del video",
    previewAria: "Vista previa del sitio de Puri e Ivi",
    wallImgAlt: "Comentario de una persona sobre amooor",
    langHref: "/en",
    langLabel: "EN",
  },
};

export default marketing;

// ─────────────────────────────────────────────────────────────────────────────
//  lib/marketing.ts — toda la copy de la landing pública de amooor (WP-5).
//  Texto en español; los precios vienen de lib/pricing.ts (no se duplican acá).
// ─────────────────────────────────────────────────────────────────────────────

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

export interface Testimonial {
  quote: string;
  author: string;
}

export interface MarketingContent {
  brand: string;
  tagline: string;
  navLinks: NavLink[];
  hero: HeroContent;
  howItWorks: HowItWorksStep[];
  pricingIntro: { eyebrow: string; title: string; subtitle: string };
  faq: FaqItem[];
  testimonials: Testimonial[];
  footer: { tagline: string; links: NavLink[] };
}

const marketing: MarketingContent = {
  brand: "amooor",
  tagline: "Sitios de aniversario que se sienten únicos.",

  navLinks: [
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Precios", href: "#precios" },
    { label: "Ejemplos", href: "#ejemplos" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    eyebrow: "El sitio que su historia merece",
    title: "Tu amor,\nhecho sitio.",
    subtitle:
      "Respondé algunas preguntas, subí sus fotos y en minutos tenés un sitio de aniversario personalizado y hermoso — para compartir con quien más querés.",
    ctaLabel: "Comenzar",
    secondaryCta: "Ver ejemplos",
  },

  howItWorks: [
    {
      icon: "✍️",
      title: "Armás su historia",
      text: "Contanos quiénes son, cuándo se conocieron y qué los hace únicos. El wizard te guía paso a paso.",
    },
    {
      icon: "📸",
      title: "Subís sus fotos",
      text: "Subí todas las fotos que quieras — por viaje, momento o como quieras. Organizamos todo por vos.",
    },
    {
      icon: "✨",
      title: "Generamos tu sitio",
      text: "Con IA y un diseño hecho para el amor, armamos un sitio que los representa de verdad.",
    },
    {
      icon: "🌐",
      title: "Conectás tu dominio",
      text: "Tu sitio vive en nombre.amooor.com o, si querés algo más especial, en su propio dominio .love.",
    },
  ],

  pricingIntro: {
    eyebrow: "Pago único, sin suscripción",
    title: "Un precio,\npara siempre.",
    subtitle:
      "Pagás una sola vez y tu sitio queda online sin costos mensuales. Elegí el plan que se ajuste a lo que quieren contar.",
  },

  faq: [
    {
      q: "¿Cuánto tiempo lleva crear el sitio?",
      a: "Una vez que terminás el wizard y subís las fotos, el sitio está listo en minutos. El proceso completo te lleva entre 20 y 40 minutos, según cuánto detalle quieran agregar.",
    },
    {
      q: "¿Pueden editar el sitio después de pagarlo?",
      a: "Con el plan Esencial y Completo el sitio queda fijo después de generado. Con el plan A medida podés editar cualquier sección con IA usando texto — cuando quieras.",
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
      a: "El plan Esencial admite hasta 150 fotos. Los planes Completo y A medida aceptan fotos ilimitadas.",
    },
  ],

  testimonials: [
    {
      quote:
        "No podía creer lo bien que quedó. Lo usé para nuestro quinto aniversario y ella lloró cuando lo vio. Totalmente recomendado.",
      author: "Martín R. — Buenos Aires",
    },
    {
      quote:
        "Le regalé el sitio a mi pareja en su cumpleaños. Subí 200 fotos y quedó como algo que pagarías miles por hacer a medida.",
      author: "Valentina C. — Córdoba",
    },
    {
      quote:
        "Pensé que iba a ser complicado pero el wizard te lleva de la mano. En una tarde lo tuvimos listo y lo compartimos en familia.",
      author: "Diego M. — Montevideo",
    },
  ],

  footer: {
    tagline: "Hecho con amor. Para el amor.",
    links: [
      { label: "Privacidad", href: "/privacidad" },
      { label: "Términos", href: "/terminos" },
      { label: "Contacto", href: "mailto:hola@amooor.com" },
    ],
  },
};

export default marketing;

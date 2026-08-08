// ─────────────────────────────────────────────────────────────────────────────
//  lib/marketing.en.ts — English copy for the public landing (locale "en",
//  served at /en). Same shape as lib/marketing.ts (Spanish default). Plan
//  amounts still come from lib/pricing.ts; only the display text is translated.
// ─────────────────────────────────────────────────────────────────────────────

import type { MarketingContent, PlanDisplay } from "./marketing";
import type { PlanId } from "./pricing";

const plansEn: Record<PlanId, PlanDisplay> = {
  basic: {
    name: "Cupid",
    tagline: "The first site of your story.",
    features: [
      "Complete site with your story",
      "Assisted onboarding",
      "Customizable sections",
      "Subdomain included (name.amooor.com)",
      "Up to 150 photos",
      "Music and live counter",
      "Your own video",
    ],
  },
  plus: {
    name: "Our Story",
    tagline: "With video and all your photos.",
    features: [
      "Everything in Cupid",
      "Unlimited photos",
      "Up to 3 custom changes",
      "Priority support",
    ],
  },
  pro: {
    name: "Forever",
    tagline: "Create and edit your own site.",
    features: [
      "Everything in Our Story",
      "Unlimited changes",
      "Edit anything, just by typing",
      "On-demand custom elements",
      "Top priority",
    ],
  },
};

const marketingEn: MarketingContent = {
  lang: "en",
  home: "/en",
  brand: "amooor",
  tagline: "Anniversary sites that feel one of a kind.",

  navLinks: [
    { label: "How it works", href: "#como-funciona" },
    { label: "Examples", href: "#ejemplos" },
    { label: "About", href: "#sobre-nosotros" },
    { label: "Pricing", href: "#precios" },
    { label: "FAQ", href: "#faq" },
  ],

  hero: {
    eyebrow: "The site your story deserves",
    title: "Your love,\nmade a site.",
    subtitle:
      "Answer a few questions, upload your photos, and in minutes you have a beautiful, custom anniversary site to share with the person you love most.",
    ctaLabel: "Get started",
    secondaryCta: "See examples",
  },

  howIntro: {
    eyebrow: "How it works",
    title: "From zero to site in\nfour steps.",
  },

  howItWorks: [
    {
      icon: "✍️",
      title: "Build your story",
      text: "Tell us who you are, when you met, and what makes you unique. The assistant guides you step by step.",
    },
    {
      icon: "📸",
      title: "Upload your photos",
      text: "Add as many photos as you want, by trip or by moment. We organize everything for you.",
    },
    {
      icon: "✨",
      title: "We generate your site",
      text: "With AI and a design made for love, we build a site that truly represents the two of you.",
    },
    {
      icon: "🌐",
      title: "Connect your domain",
      text: "Your site lives at name.amooor.com or, if you want something more special, on its own .love domain.",
    },
  ],

  showcaseIntro: {
    eyebrow: "Real examples",
    title: "Sites already\ntelling their story.",
    subtitle:
      "Every site is different: palette, sections, and content tailored to each couple. This one is Puri and Ivi's.",
  },

  showcaseCard: {
    tag: "Real story",
    couple: "Puri & Ivi",
    description:
      "Four years together, told photo by photo. Rose palette, music, a live counter, and their own domain.",
    linkLabel: "See the site at purivi.love",
    href: "https://purivi.love/",
    previewUrl: "puri-e-ivi.amooor.com",
    ariaView: "Visit Puri and Ivi's site",
  },

  wallIntro: {
    eyebrow: "What people think",
    title: "Give a moment\nthey'll never forget.",
    subtitle:
      "The video of our story went viral. These are real comments from people who saw it for the first time.",
  },

  wallStats: [
    { value: "+600k", label: "Views" },
    { value: "+100k", label: "Likes" },
    { value: "+800", label: "Comments" },
  ],

  about: {
    eyebrow: "About us",
    title: "It started as\na gift.",
    paragraphs: [
      "We're Ivi and Puri, a couple that, without planning it, ended up turning our own love story into amooor.",
      "It all started when we hit 4 years together. For our anniversary, Puri gave me a gift I never saw coming: a website with our whole story. It had our photos, our memories, the important moments, and a ton of little details that made me relive our relationship from the very beginning.",
      "It moved me so much that I showed it to everyone: my friends, my family… and I even posted a video on TikTok that ended up going viral.",
      "When we started reading the comments from so many people saying they'd love to get something like this, we thought: why not help other couples have their own page?",
      "And that's how amooor was born. From our story, from a gift that moved me deeply, and from the wish for other people to feel something like it too.",
      "Today we create personalized pages that turn every love story into a gift you don't tuck away in a drawer, but visit again and again. Because every couple has a story worth telling.",
    ],
    signature: "With amooor, Ivi and Puri",
    video: {
      url: "https://www.tiktok.com/@iviwang/video/7667705851221773575",
      videoId: "7667705851221773575",
      caption: "The video I made to show our site.",
    },
  },

  pricingIntro: {
    eyebrow: "One-time payment, no subscription",
    title: "One price,\nforever.",
    subtitle:
      "You pay once and your site stays online with no monthly fees. Choose the plan that fits what you want to tell.",
  },

  plans: plansEn,

  faqIntro: {
    eyebrow: "Frequently asked questions",
    title: "Everything you\nneed to know.",
  },

  faq: [
    {
      q: "Do I need to know how to code or have technical knowledge?",
      a: "Not at all. amooor is made for anyone. The assistant guides you step by step: you answer a few questions, upload your photos, and we build everything. You never write a single line of code.",
    },
    {
      q: "How long does it take to create the site?",
      a: "Once you finish the assistant and upload the photos, your site is ready in minutes. The whole process takes between 20 and 40 minutes, depending on how much detail you want to add.",
    },
    {
      q: "Can we edit the site after paying for it?",
      a: "With Cupid the site is fixed once generated. Our Story includes up to 3 custom changes, and Forever gives you unlimited changes: you edit any section with AI just by typing what you want.",
    },
    {
      q: "What if I want my own .love domain?",
      a: "You can add your custom .love domain as an upsell at checkout. The first year is included; the annual renewal (~US$20) is on you.",
    },
    {
      q: "Does the site stay online forever?",
      a: "Yes. Hosting is included with no time limit. There are no monthly fees and nothing expires.",
    },
    {
      q: "How many photos can I upload?",
      a: "The Cupid plan supports up to 150 photos. The Our Story and Forever plans accept unlimited photos.",
    },
  ],

  footerCta: {
    title: "Build yours\ntoday.",
  },

  footer: {
    tagline: "Made with amooor.",
    links: [
      { label: "Privacy", href: "/en/privacy" },
      { label: "Terms", href: "/en/terms" },
      { label: "Contact", href: "mailto:hola@amooor.com" },
    ],
  },

  ui: {
    once: "one-time",
    currency: "US$",
    planLabel: "Plan",
    startWith: "Get started with",
    inheritPrefix: "Everything in",
    navAria: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    footerAria: "Footer",
    commentsAria: "What people say",
    statsAria: "Video reach",
    previewAria: "Preview of Puri and Ivi's site",
    wallImgAlt: "A person's comment about amooor",
    langHref: "/",
    langLabel: "ES",
  },
};

export default marketingEn;

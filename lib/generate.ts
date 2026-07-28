// ─────────────────────────────────────────────────────────────────────────────
//  generate.ts — el generador determinista del template de aniversario (WP-3).
//  Toma un `WizardState` (lo que aportó el usuario) + las fotos subidas y produce
//  un `Content` COMPLETO y válido (contentSchema). Es isomórfico (corre en el
//  cliente para el preview del "Review" y en el server para el alta post-pago).
//
//  La "narrativa IA" (skill `generar-narrativa`) es una MEJORA opcional encima de
//  esto: `lib/ai.ts` reescribe los textos si hay una API key; sin key, este
//  resultado determinista ya arma un sitio coherente. Nunca depende de la IA.
// ─────────────────────────────────────────────────────────────────────────────

import {
  content as base,
  type Content,
  type MediaSet,
  type Person,
  type StoryBeat,
  type Trait,
  type SectionEntry,
  type SectionType,
} from "./content";
import { palettes, type PaletteId } from "./theme";
import type { WizardState, WizardSection } from "./draft";

// ── helpers ──────────────────────────────────────────────────────────────────
const clone = <T>(x: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(x)
    : (JSON.parse(JSON.stringify(x)) as T);

/** "2022-07-26" → "26 · 07 · 2022". Vacío si la fecha no es válida. */
function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d} · ${mo} · ${y}`;
}

/** Años cumplidos desde una fecha ISO (para el contador/eyebrow). */
function yearsSince(iso: string, fallback: number): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return fallback;
  const then = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  const now = new Date();
  let years = now.getFullYear() - then.getFullYear();
  const passed =
    now.getMonth() > then.getMonth() ||
    (now.getMonth() === then.getMonth() && now.getDate() >= then.getDate());
  if (!passed) years -= 1;
  return Math.max(0, years);
}

/** "bariloche" → "Bariloche"; "almuerzos-cenas" → "Almuerzos cenas". */
function prettify(slug: string): string {
  const s = (slug ?? "").replace(/[-_]+/g, " ").trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Divide "Puri & Ivi" en ["Puri", "Ivi"] (o "y"/"+"). */
function splitCouple(couple: string): [string, string] {
  const parts = (couple ?? "").split(/\s*(?:&|\+|\by\b)\s*/i).filter(Boolean);
  return [parts[0] ?? "", parts[1] ?? ""];
}

/** Las primeras `n` fotos (índices) de un set de categorías, como picks [cat, i]. */
function firstPicks(
  cats: string[],
  countPerCat: (cat: string) => number,
  n: number
): [string, number][] {
  const out: [string, number][] = [];
  for (const cat of cats) {
    const total = countPerCat(cat);
    for (let i = 0; i < total && out.length < n; i++) out.push([cat, i]);
    if (out.length >= n) break;
  }
  return out;
}

// ── el generador ─────────────────────────────────────────────────────────────
export interface GenerateInput {
  state: WizardState;
  /** fotos subidas del tenant (opcional; sin ellas el sitio usa placeholders). */
  media?: MediaSet;
}

export function generateContent({ state, media }: GenerateInput): Content {
  const c = clone(base) as Content;
  const palette = palettes[state.palette as PaletteId] ?? palettes.rosa;
  const countPerCat = (cat: string) => media?.photos?.[cat]?.length ?? 0;

  const [nameA, nameB] = splitCouple(state.couple || c.couple);
  const leftName = state.people.left.name || nameA || c.people.left.name;
  const rightName = state.people.right.name || nameB || c.people.right.name;
  const couple = state.couple || `${leftName} & ${rightName}`;
  const years = yearsSince(state.dates.together, c.dates.anniversaryYears);

  // ── site metadata ──────────────────────────────────────────────────────────
  c.couple = couple;
  c.site = {
    ...c.site,
    title: couple,
    ogTitle: `${couple} ❤️`,
    themeColor: palette.accentStrong,
  };
  c.dates = {
    together: state.dates.together || c.dates.together,
    met: state.dates.met || c.dates.met,
    anniversaryYears: years,
  };

  // ── layout: orden + visibilidad desde el wizard ─────────────────────────────
  const enabled = state.sections.filter((s) => s.enabled);
  c.layout = enabled.map(
    (s): SectionEntry => ({ type: s.type as SectionType, id: s.id, enabled: true })
  );

  // ── hero ─────────────────────────────────────────────────────────────────
  const heroSection = enabled.find((s) => s.type === "hero");
  const heroCat =
    heroSection?.categories.find((cat) => countPerCat(cat) > 0) ??
    Object.keys(media?.photos ?? {}).find((cat) => cat !== "all" && countPerCat(cat) > 0);
  const heroSlug = heroCat ? media?.photos?.[heroCat]?.[0]?.slug : undefined;
  c.hero = {
    ...c.hero,
    eyebrow: state.dates.together ? `${fmtDate(state.dates.together)} → ∞` : c.hero.eyebrow,
    nameStart: leftName,
    nameEnd: rightName,
    lede:
      state.story?.trim().split(/(?<=[.!?])\s+/)[0]?.slice(0, 180) ||
      `${years > 0 ? `${years} años` : "Nuestra historia"} de ${leftName} y ${rightName}.`,
    bgAlt: `${leftName} y ${rightName}`,
    pixelSrc: null,
    cat: heroCat ?? c.hero.cat,
    slug: heroSlug ?? c.hero.slug,
  };

  // ── people (perfil por persona) ────────────────────────────────────────────
  const toPerson = (p: WizardState["people"]["left"], fallback: Person): Person => ({
    name: p.name || fallback.name,
    tagline: p.personality?.trim() ? p.personality.trim().slice(0, 60) : fallback.tagline,
    zoneLabel: `Conocé a ${p.name || fallback.name}`,
    traits: (p.traits.length ? p.traits : fallback.traits) as Trait[],
    artists: p.bands.length ? p.bands.map((name) => ({ name })) : fallback.artists,
  });
  c.people = {
    ...c.people,
    left: toPerson(state.people.left, c.people.left),
    right: toPerson(state.people.right, c.people.right),
  };

  // ── secciones "story" (beats narrativos) ────────────────────────────────────
  const story: Content["story"] = {};
  for (const s of enabled.filter((x) => x.type === "story")) {
    const cats = s.categories.length ? s.categories : [];
    const beat: StoryBeat = {
      kicker: prettify(s.title),
      title: s.title,
      text:
        s.aiPrompt?.trim() ||
        state.story?.trim().slice(0, 240) ||
        `Un capítulo de ${couple}.`,
      cats,
      picks: firstPicks(cats, countPerCat, 3),
    };
    story[s.id] = { beats: [beat] };
  }
  c.story = story;

  // ── travel ─────────────────────────────────────────────────────────────────
  const travelSection = enabled.find((s) => s.type === "travel");
  const destinations = state.destinations.length
    ? state.destinations
    : (travelSection?.categories ?? []).map((cat) => ({
        cat,
        title: prettify(cat),
        place: prettify(cat),
      }));
  c.travel = {
    ...c.travel,
    title: travelSection?.title || c.travel.title,
    destinations,
  };

  // ── moments ────────────────────────────────────────────────────────────────
  const momentsSection = enabled.find((s) => s.type === "moments");
  c.moments = {
    ...c.moments,
    title: momentsSection?.title || c.moments.title,
    cards: (momentsSection?.categories ?? []).length
      ? momentsSection!.categories.map((cat) => ({ cat, title: prettify(cat) }))
      : c.moments.cards,
  };

  // ── watch (pelis/series + video) ───────────────────────────────────────────
  const watchSection = enabled.find((s) => s.type === "watch");
  c.watch = {
    ...c.watch,
    title: watchSection?.title || c.watch.title,
    list: state.watchlist.length ? state.watchlist : c.watch.list,
    video: {
      ...c.watch.video,
      provider: state.video.mode === "upload" ? "video" : "tiktok",
      url: state.video.url ?? c.watch.video.url,
      videoId: state.video.videoId ?? c.watch.video.videoId,
      caption: state.video.caption || c.watch.video.caption,
      src: state.video.mode === "upload" ? state.video.src ?? null : null,
      poster: state.video.mode === "upload" ? state.video.poster ?? null : null,
    },
  };

  // ── stats ──────────────────────────────────────────────────────────────────
  c.stats = {
    ...c.stats,
    metDate: state.dates.met ? fmtDate(state.dates.met) : c.stats.metDate,
  };

  // ── footer + drawing + music ────────────────────────────────────────────────
  c.footer = { ...c.footer, title: couple };
  c.music =
    state.music.mode === "library" && state.music.cat && state.music.slug
      ? { ...c.music, cat: state.music.cat, slug: state.music.slug }
      : c.music;

  // ── media (fotos subidas del tenant) ────────────────────────────────────────
  if (media && Object.keys(media.photos ?? {}).length > 0) {
    c.media = media;
  }

  return c;
}

/** Deriva el `MediaSet` a partir de las fotos de un draft (draftPhotos de Convex).
 *  El `cloudflareId` hace de slug estable dentro de la categoría. */
export function mediaFromPhotos(
  rows: {
    category: string;
    cloudflareId: string;
    thumbUrl: string;
    fullUrl: string;
    order: number;
  }[],
  audioUrl?: string
): MediaSet {
  const photos: MediaSet["photos"] = {};
  for (const r of [...rows].sort((a, b) => a.order - b.order)) {
    (photos[r.category] ??= []).push({
      slug: r.cloudflareId,
      thumb: r.thumbUrl,
      full: r.fullUrl,
    });
  }
  return audioUrl ? { photos, audioUrl } : { photos };
}

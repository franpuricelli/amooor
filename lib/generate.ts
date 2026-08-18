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
import { fmtDate } from "./dates";
import type { WizardState, WizardSection } from "./draft";

// ── helpers ──────────────────────────────────────────────────────────────────
const clone = <T>(x: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(x)
    : (JSON.parse(JSON.stringify(x)) as T);

/** Años cumplidos desde una fecha ISO (para el contador/eyebrow); 0 sin fecha. */
function yearsSince(iso: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return 0;
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

/**
 * Las primeras `n` fotos (índices) de un set de categorías, como picks [cat, i].
 * Si la sección todavía no tiene ninguna foto, devolvemos igual los `n` slots de su
 * primera categoría: en el preview del builder eso rinde marcos vacíos (se ve dónde
 * van a entrar), y en un sitio real esos slots se filtran solos (StorySection
 * descarta los picks que no resuelven a una foto).
 */
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
  if (out.length === 0 && cats.length > 0) {
    return Array.from({ length: n }, (_, i) => [cats[0], i] as [string, number]);
  }
  return out;
}

// ── el generador ─────────────────────────────────────────────────────────────
export interface GenerateInput {
  state: WizardState;
  /** fotos subidas del tenant (sin ellas el sitio queda con las secciones vacías). */
  media?: MediaSet;
  /** categoría de la sección `closing` — de ahí sale la imagen del dibujo. */
  closingCat?: string;
}

/**
 * ⚠️ `base` (lib/content.ts) es el content de la DEMO (Puri & Ivi). Se usa como
 * ESQUELETO: labels, aria, kickers y textos de chrome del template. Ningún dato
 * personal de la demo puede sobrevivir acá (nombres, fechas, fotos, pelis,
 * canción, dibujo): si el estado no lo trae, va vacío o derivado del plan. Si no,
 * el preview del builder se llena de "purivi".
 */
export function generateContent({ state, media, closingCat }: GenerateInput): Content {
  const c = clone(base) as Content;
  const palette = palettes[state.palette as PaletteId] ?? palettes.rosa;
  const countPerCat = (cat: string) => media?.photos?.[cat]?.length ?? 0;

  const [nameA, nameB] = splitCouple(state.couple);
  const leftName = state.people.left.name || nameA || "";
  const rightName = state.people.right.name || nameB || "";
  const couple =
    state.couple || [leftName, rightName].filter(Boolean).join(" & ") || "Nuestra historia";
  const years = yearsSince(state.dates.together);

  // ── site metadata ──────────────────────────────────────────────────────────
  c.couple = couple;
  c.site = {
    ...c.site,
    title: couple,
    ogTitle: `${couple} ❤️`,
    themeColor: palette.accentStrong,
  };
  c.dates = {
    together: state.dates.together,
    met: state.dates.met,
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
  const bothNames = [leftName, rightName].filter(Boolean).join(" y ");
  c.hero = {
    ...c.hero,
    eyebrow: state.dates.together ? `${fmtDate(state.dates.together)} → ∞` : "Nuestra historia",
    nameStart: leftName,
    nameEnd: rightName,
    lede:
      state.story?.trim().split(/(?<=[.!?])\s+/)[0]?.slice(0, 180) ||
      [years > 0 ? `${years} años` : "La historia", bothNames && `de ${bothNames}`]
        .filter(Boolean)
        .join(" ") + ".",
    bgAlt: bothNames || couple,
    pixelSrc: null,
    // sin fotos todavía: la categoría de la portada existe igual (es donde se van
    // a subir) y el slug queda vacío → el preview muestra un marco vacío.
    cat: heroCat ?? heroSection?.categories[0] ?? "",
    slug: heroSlug ?? "",
  };

  // ── people (perfil por persona) ────────────────────────────────────────────
  //  Sin dato del usuario va VACÍO: los rasgos/artistas de la demo no son de esta
  //  pareja (el pass de IA y el editor los completan después).
  const toPerson = (p: WizardState["people"]["left"], name: string): Person => ({
    name,
    tagline: p.personality?.trim().slice(0, 60) ?? "",
    zoneLabel: name ? `Conocé a ${name}` : "Conocé a esta persona",
    traits: p.traits as Trait[],
    artists: p.bands.map((band) => ({ name: band })),
  });
  c.people = {
    ...c.people,
    left: toPerson(state.people.left, leftName),
    right: toPerson(state.people.right, rightName),
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
    // el lede de la demo nombra SUS viajes ("Bariloche fue el primero…"): acá sale
    // de la intención de la sección del plan.
    lede: travelSection?.aiPrompt?.trim() || "Los viajes que marcaron esta historia.",
    destinations,
  };

  // ── moments ────────────────────────────────────────────────────────────────
  const momentsSection = enabled.find((s) => s.type === "moments");
  c.moments = {
    ...c.moments,
    title: momentsSection?.title || c.moments.title,
    lede:
      momentsSection?.aiPrompt?.trim() ||
      "Las cosas chiquitas que arman el día a día. Tocá una carta para verlas.",
    cards: (momentsSection?.categories ?? []).map((cat) => ({ cat, title: prettify(cat) })),
  };

  // ── watch (pelis/series + video) ───────────────────────────────────────────
  //  La watchlist de la demo NO es de esta pareja: sin datos, la lista va vacía.
  const watchSection = enabled.find((s) => s.type === "watch");
  const uploaded = state.video.mode === "upload";
  c.watch = {
    ...c.watch,
    title: watchSection?.title || c.watch.title,
    // el kicker cuenta títulos ("de noche · {count} títulos"): sin lista todavía,
    // mostrar "0 títulos" queda peor que no contar nada.
    kicker: state.watchlist.length ? c.watch.kicker : "de noche",
    list: state.watchlist,
    video: {
      ...c.watch.video,
      provider: uploaded || !state.video.videoId ? "video" : "tiktok",
      url: state.video.url ?? "",
      videoId: state.video.videoId ?? "",
      caption: state.video.caption || c.watch.video.caption,
      src: uploaded ? state.video.src ?? null : null,
      poster: uploaded ? state.video.poster ?? null : null,
    },
  };

  // ── stats ──────────────────────────────────────────────────────────────────
  //  El kicker y los chips de la demo traen SUS datos (la fecha, "5 países"):
  //  se rearman con los de esta pareja.
  const togetherDate = state.dates.together ? fmtDate(state.dates.together) : "";
  c.stats = {
    ...c.stats,
    kicker: togetherDate ? `…y acá estamos: juntos desde el ${togetherDate}` : "…y acá estamos",
    chips: ["{photos} fotos", years > 0 ? `${years} años` : "", "{titles} títulos vistos"].filter(
      Boolean
    ),
    metDate: state.dates.met ? fmtDate(state.dates.met) : "",
  };

  // ── footer + drawing + music ────────────────────────────────────────────────
  // `narrator` = quién arma el sitio (el intake lo pregunta): es quien firma.
  const author = state.narrator?.trim() || leftName;
  const shortDate = fmtDate(state.dates.together, ".");
  c.footer = {
    ...c.footer,
    title: couple,
    line: [years > 0 ? `{years} años` : "", shortDate && `${shortDate} → ∞`]
      .filter(Boolean)
      .join(" · "),
    credit: author ? `hecho por ${author}, con amor ❤️` : "hecho con amor ❤️",
  };
  // El dibujo del cierre sale de la foto que se sube a la sección `closing` (en el
  // alta real la estiliza FAL, ver app/api/generate). Sin esa foto va vacío: el
  // dibujo de la demo son Puri & Ivi.
  const closingPhoto = closingCat ? media?.photos?.[closingCat]?.[0] : undefined;
  c.drawing = {
    ...c.drawing,
    src: closingPhoto?.full ?? "",
    alt: bothNames ? `${bothNames}, dibujados` : c.drawing.alt,
    from: author ? `De: ${author}` : "",
  };
  // La canción de la librería es la de la demo: sólo va si el usuario la eligió.
  c.music =
    state.music.mode === "library" && state.music.cat && state.music.slug
      ? { ...c.music, cat: state.music.cat, slug: state.music.slug }
      : { ...c.music, cat: "", slug: "" };

  // ── media (fotos subidas del tenant) ────────────────────────────────────────
  //  Siempre, aunque venga vacío: `content.media` presente = "este sitio tiene SUS
  //  fotos" (aunque sean cero). Sin él, el sitio caería al manifiesto de la demo.
  c.media = media ?? { photos: {} };

  return c;
}

/**
 * Re-ata SOLO los campos que referencian fotos de un `Content` ya generado, con el
 * `MediaSet` actual del draft — sin tocar NINGÚN texto/copy (spec §Phase 2).
 *
 * `generateContent` corre UNA sola vez (primer build). Cualquier cambio posterior
 * de fotos (agregar / reordenar / reemplazar / borrar) llama a esto: recalcula
 *   - `content.media`               (las fotos crudas),
 *   - `hero.cat` / `hero.slug`      (primera foto de la categoría del hero),
 *   - `story[id].beats[].picks`     (las primeras fotos del collage de cada beat),
 * preservando todo el copy editado. Reordenar para poner otra foto primero cambia
 * el hero/first-pick sin pisar los textos del usuario.
 */
export function rebindMedia(content: Content, media: MediaSet): Content {
  const c = clone(content);
  const countPerCat = (cat: string) => media.photos?.[cat]?.length ?? 0;

  c.media = media;

  // ── hero: primera foto de su categoría (con fallback si quedó sin fotos) ──────
  const heroCat =
    countPerCat(c.hero.cat) > 0
      ? c.hero.cat
      : Object.keys(media.photos ?? {}).find(
          (cat) => cat !== "all" && countPerCat(cat) > 0
        ) ?? c.hero.cat;
  const heroSlug = media.photos?.[heroCat]?.[0]?.slug;
  c.hero = { ...c.hero, cat: heroCat, slug: heroSlug ?? c.hero.slug };

  // ── story: recomputar los picks del collage de cada beat (mismas cats) ───────
  for (const id of Object.keys(c.story)) {
    const beats = c.story[id]?.beats ?? [];
    c.story[id] = {
      beats: beats.map((b) => ({
        ...b,
        picks: firstPicks(b.cats, countPerCat, 3),
      })),
    };
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

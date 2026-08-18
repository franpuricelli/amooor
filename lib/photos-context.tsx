"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  photos-context.tsx — la fuente de fotos del tenant activo (WP-3/WP-4).
//  Antes los componentes importaban las funciones estáticas de `lib/photos.ts`
//  (las 468 fotos de Puri & Ivi). En multi-tenant cada sitio tiene SUS fotos, así
//  que ahora llaman `usePhotos()`:
//    · si el tenant trae `content.media` (fotos subidas → Cloudflare Images),
//      la fuente resuelve las URLs de ahí — AUNQUE ESTÉ VACÍO. Un sitio sin fotos
//      propias muestra cero fotos, nunca las de Puri & Ivi.
//    · sólo sin `media` (el default Puri & Ivi, la landing, /template/*) cae al
//      manifiesto estático `lib/photos.ts`.
//
//  `placeholders` (preview del builder): con la media vacía devuelve marcos vacíos
//  en lugar de nada, para que se vea DÓNDE van a entrar las fotos mientras las subís.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  allPhotos as staticAll,
  photos as staticPhotos,
  full as staticFull,
  thumb as staticThumb,
  audio as staticAudio,
  totalPhotos as staticTotal,
} from "@/lib/photos";
import type { MediaSet } from "@/lib/content";

export interface CatPhoto {
  cat: string;
  slug: string;
}

/** La API que consumen las secciones. Mismo shape que las funciones estáticas. */
export interface PhotoSource {
  photos: (cat: string) => string[];
  thumb: (cat: string, slug: string) => string;
  full: (cat: string, slug: string) => string;
  audio: (cat: string, slug: string) => string;
  allPhotos: CatPhoto[];
  totalPhotos: number;
}

const staticSource: PhotoSource = {
  photos: staticPhotos,
  thumb: staticThumb,
  full: staticFull,
  audio: staticAudio,
  allPhotos: staticAll,
  totalPhotos: staticTotal,
};

// ── marcos vacíos (sólo en el preview del builder) ───────────────────────────
/** Un marco de "foto pendiente": SVG neutro que entra en cualquier paleta. */
export const PLACEHOLDER_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e9e5e6"/><g fill="none" stroke="#bdb5b8" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"><rect x="139" y="104" width="122" height="92" rx="12"/><circle cx="171" cy="136" r="11"/><path d="M145 182l40-36 27 23 23-19 22 32"/></g></svg>`
  );
const PLACEHOLDER_SLUGS = ["ph-1", "ph-2", "ph-3"];
const PLACEHOLDER_ALL: CatPhoto[] = Array.from({ length: 8 }, (_, i) => ({
  cat: "__placeholder",
  slug: `ph-${i + 1}`,
}));

/** Construye una fuente desde las fotos subidas del tenant (`content.media`). */
function sourceFromMedia(media: MediaSet, placeholders: boolean): PhotoSource {
  const byCat = media.photos ?? {};
  const url = new Map<string, { thumb: string; full: string }>();
  const all: CatPhoto[] = [];
  for (const [cat, list] of Object.entries(byCat)) {
    for (const p of list) {
      url.set(`${cat}/${p.slug}`, { thumb: p.thumb, full: p.full });
      // "all" es un bucket derivado; no lo duplicamos en el total/mural.
      if (cat !== "all") all.push({ cat, slug: p.slug });
    }
  }
  const at = (cat: string, slug: string) => url.get(`${cat}/${slug}`);
  return {
    photos: (cat) => {
      const list = (byCat[cat] ?? []).map((p) => p.slug);
      return list.length === 0 && placeholders ? PLACEHOLDER_SLUGS : list;
    },
    // una foto que no existe devuelve el marco vacío, nunca "" (un <img src="">
    // se ve como imagen rota).
    thumb: (cat, slug) => at(cat, slug)?.thumb ?? PLACEHOLDER_PHOTO,
    full: (cat, slug) => at(cat, slug)?.full ?? PLACEHOLDER_PHOTO,
    // La música propia se sirve por `content.media.audioUrl` / `content.music.url`;
    // este helper sólo aplica al modo librería (assets estáticos).
    audio: staticAudio,
    allPhotos: all.length === 0 && placeholders ? PLACEHOLDER_ALL : all,
    totalPhotos: all.length,
  };
}

const PhotoContext = createContext<PhotoSource>(staticSource);

export function PhotoProvider({
  media,
  placeholders = false,
  children,
}: {
  media?: MediaSet;
  /** preview del builder: sin fotos propias, mostrá marcos vacíos (no nada) */
  placeholders?: boolean;
  children: ReactNode;
}) {
  // Con `media` (aunque venga vacío) la fuente es la del tenant: un sitio sin
  // fotos muestra marcos vacíos, nunca el manifiesto de Puri & Ivi.
  const source = useMemo(
    () => (media ? sourceFromMedia(media, placeholders) : staticSource),
    [media, placeholders]
  );
  return <PhotoContext.Provider value={source}>{children}</PhotoContext.Provider>;
}

/** La fuente de fotos del tenant activo (o la estática fuera de un provider). */
export function usePhotos(): PhotoSource {
  return useContext(PhotoContext);
}

"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  photos-context.tsx — la fuente de fotos del tenant activo (WP-3/WP-4).
//  Antes los componentes importaban las funciones estáticas de `lib/photos.ts`
//  (las 468 fotos de Puri & Ivi). En multi-tenant cada sitio tiene SUS fotos, así
//  que ahora llaman `usePhotos()`:
//    · si el tenant trae `content.media` (fotos subidas → Cloudflare Images),
//      la fuente resuelve las URLs de ahí.
//    · si no (el default Puri & Ivi), cae al manifiesto estático `lib/photos.ts`.
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

/** Construye una fuente desde las fotos subidas del tenant (`content.media`). */
function sourceFromMedia(media: MediaSet): PhotoSource {
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
    photos: (cat) => (byCat[cat] ?? []).map((p) => p.slug),
    thumb: (cat, slug) => at(cat, slug)?.thumb ?? "",
    full: (cat, slug) => at(cat, slug)?.full ?? "",
    // La música propia se sirve por `content.media.audioUrl` / `content.music.url`;
    // este helper sólo aplica al modo librería (assets estáticos).
    audio: staticAudio,
    allPhotos: all,
    totalPhotos: all.length,
  };
}

const PhotoContext = createContext<PhotoSource>(staticSource);

export function PhotoProvider({
  media,
  children,
}: {
  media?: MediaSet;
  children: ReactNode;
}) {
  const source = useMemo(
    () =>
      media && Object.keys(media.photos ?? {}).length > 0
        ? sourceFromMedia(media)
        : staticSource,
    [media]
  );
  return <PhotoContext.Provider value={source}>{children}</PhotoContext.Provider>;
}

/** La fuente de fotos del tenant activo (o la estática fuera de un provider). */
export function usePhotos(): PhotoSource {
  return useContext(PhotoContext);
}

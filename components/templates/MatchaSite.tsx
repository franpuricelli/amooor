"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  MatchaSite — renders a tenant with the "Matcha" template: the editorial story
//  structure fed from the tenant's own Content + photos (via the adapter). Used
//  by SiteApp (live) and PreviewSite (editor) when theme.template === "matcha".
//  It IS the whole page (its own nav pill, sections, lightbox, footer), so the
//  caller renders it instead of the section-registry tree.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useContent } from "@/lib/tenant";
import { usePhotos } from "@/lib/photos-context";
import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate";
import { contentToEditorial } from "@/components/templates/editorial/adapt";

export default function MatchaSite() {
  const content = useContent();
  const photos = usePhotos();
  const data = useMemo(() => contentToEditorial(content, photos), [content, photos]);
  return <EditorialTemplate content={data} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  /mono — a live preview of the MONO template (editorial, story-first).
//  It renders the default couple (Puri & Ivi) through the new renderer, wrapped
//  in its own TenantProvider so the demo is deterministic regardless of host.
//  This is the WP-6 "second template" surface; wire it into the host/builder
//  template switch once the direction is approved.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { TenantProvider } from "@/lib/tenant";
import { content } from "@/lib/content";
import MonoSite from "@/components/templates/mono/MonoSite";
import "./mono.css";

export const metadata: Metadata = {
  title: "MONO — plantilla editorial · amooor",
  description: "Una plantilla que cuenta una historia, en clave editorial.",
};

export default function MonoPage() {
  return (
    <TenantProvider content={content}>
      <MonoSite />
    </TenantProvider>
  );
}

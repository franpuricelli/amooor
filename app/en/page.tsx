// ─────────────────────────────────────────────────────────────────────────────
//  app/en/page.tsx — English version of the marketing landing (/en).
//  Marketing-only route (apex); it never resolves a tenant.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Landing from "@/components/marketing/Landing";
import marketingEn from "@/lib/marketing.en";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const title = "amooor: Your love, made a site";
  const description = marketingEn.hero.subtitle;
  const image = "/demo/poster.jpg";

  return {
    title,
    description,
    alternates: { canonical: "/en", languages: { es: "/", en: "/en" } },
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "amooor",
      locale: "en_US",
      images: [{ url: image, width: 1663, height: 900, alt: "amooor" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function HomeEn() {
  return <Landing content={marketingEn} />;
}

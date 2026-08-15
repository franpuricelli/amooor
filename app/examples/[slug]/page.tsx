import type { Metadata } from "next";
import type { ReactElement } from "react";
import { notFound } from "next/navigation";
import SiteApp from "@/components/SiteApp";
import EditorialTemplate from "@/components/templates/editorial/EditorialTemplate";
import editorialEs from "@/components/templates/editorial/content";

// ─────────────────────────────────────────────────────────────────────────────
//  /examples/<slug> — REAL, filled examples (a specific couple's site), as
//  opposed to /template/<slug> which shows the empty, reusable template.
//    · purivi         → Puri & Ivi in the original site structure (SiteApp).
//    · purivi-matcha  → Puri & Ivi in the Matcha template (filled content.ts).
// ─────────────────────────────────────────────────────────────────────────────

interface Example {
  name: string;
  description: string;
  render: () => ReactElement;
}

const EXAMPLES: Record<string, Example> = {
  purivi: {
    name: "Puri & Ivi",
    description: "El sitio original de Puri & Ivi.",
    render: () => <SiteApp />,
  },
  "purivi-matcha": {
    name: "Puri & Ivi — Matcha",
    description: "Puri & Ivi con el template Matcha.",
    render: () => <EditorialTemplate content={editorialEs} />,
  },
};

export function generateStaticParams() {
  return Object.keys(EXAMPLES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ex = EXAMPLES[slug];
  if (!ex) return { title: "amooor — ejemplo" };
  return { title: `amooor — ${ex.name}`, description: ex.description };
}

export default async function ExamplePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ex = EXAMPLES[slug];
  if (!ex) notFound();
  return ex.render();
}

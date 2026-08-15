import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplatePreview, TEMPLATE_PREVIEWS } from "@/components/templates/registry";

// Standalone template previews (WP-6), español (locale default). Each slug
// renders a full-page template design so it can be reviewed before being wired
// into the multi-tenant builder. English is served at /en/template/<slug>.
export function generateStaticParams() {
  return Object.keys(TEMPLATE_PREVIEWS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tpl = getTemplatePreview(slug);
  if (!tpl) return { title: "amooor — plantilla" };
  return { title: `amooor — plantilla ${tpl.name}`, description: tpl.description };
}

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = getTemplatePreview(slug);
  if (!tpl) notFound();
  return tpl.render("es");
}

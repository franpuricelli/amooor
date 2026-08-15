import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTemplatePreview, TEMPLATE_PREVIEWS } from "@/components/templates/registry";

// English template previews (locale "en"), served at /en/template/<slug>.
// Same registry as the Spanish route (app/template/[slug]); only the locale
// passed to render() differs.
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
  if (!tpl) return { title: "amooor — template" };
  return { title: `amooor — ${tpl.name} template`, description: tpl.description };
}

export default async function TemplatePreviewPageEn({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tpl = getTemplatePreview(slug);
  if (!tpl) notFound();
  return tpl.render("en");
}

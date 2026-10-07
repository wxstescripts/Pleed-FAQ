import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SITE_NAME } from "@/lib/site";
import { getDocsPage } from "@/content/docs/content";
import { docsHref, docsPages } from "@/content/docs/index";
import { DocsArticle } from "@/components/docs/docs-article";

type Props = { params: Promise<{ slug: string }> };

// Every docs page is prerendered; anything else is a 404 (docs/not-found.tsx).
export const dynamicParams = false;

export function generateStaticParams() {
  return docsPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getDocsPage(slug);
  if (!page) return {};
  const title = `${page.title} — Docs`;
  return {
    title,
    description: page.description,
    alternates: { canonical: docsHref(page.slug) },
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description: page.description,
      url: docsHref(page.slug),
    },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE_NAME}`, description: page.description },
  };
}

export default async function DocsSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getDocsPage(slug);
  if (!page) notFound();
  return <DocsArticle page={page} />;
}

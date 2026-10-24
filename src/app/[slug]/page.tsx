import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Article } from "@/components/article";
import { getPage, getPages, isRedirect } from "@/lib/rblog";
import { pageMetadata, shareImage } from "@/lib/seo";

// Static pages live at /{slug} (RBlog's path for a page, docs/api.md "Paths"). Routes of this
// app (search, preview, feed.xml, …) take precedence: don't give a page one of those slugs.
type Props = PageProps<"/[slug]">;

export async function generateStaticParams() {
  const pages = await getPages();
  return pages.data.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const page = await getPage(slug);
  if (!page || isRedirect(page)) return {};
  return pageMetadata({
    title: page.seo.meta_title ?? page.title,
    description: page.seo.meta_description ?? page.excerpt,
    path: `/${page.slug}`,
    canonical: page.seo.canonical_url,
    image: shareImage(page.seo.og_image, page.cover),
  });
}

// Looked up before anything streams: a real 404 or 301 (see posts/[slug]).
export const instant = false;

export default async function StaticPage(props: Props) {
  const { slug } = await props.params;
  const page = await getPage(slug);
  if (!page) notFound();
  if (isRedirect(page)) permanentRedirect(`/${page.redirect}`);
  return <Article entry={page} />;
}

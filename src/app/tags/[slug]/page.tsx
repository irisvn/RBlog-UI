import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Listing } from "@/components/listing";
import { pageNumber, staticSlugs } from "@/lib/format";
import { getTag, getTags, isRedirect } from "@/lib/rblog";
import { pageMetadata, withPage } from "@/lib/seo";

type Props = PageProps<"/tags/[slug]">;

export async function generateStaticParams() {
  const tags = await getTags();
  return staticSlugs(tags.data.filter((t) => t.post_count > 0).map((t) => t.slug));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const tag = await getTag(slug);
  if (!tag || isRedirect(tag)) return {};
  const page = pageNumber((await props.searchParams).page);
  return pageMetadata({
    title: page > 1 ? `#${tag.name} (trang ${page})` : `#${tag.name}`,
    description: tag.description ?? `Các bài viết gắn thẻ ${tag.name}.`,
    path: withPage(`/tags/${tag.slug}`, page),
  });
}

// Looked up before anything streams: a real 404 or 301 (see posts/[slug]).
export const instant = false;

export default async function TagPage(props: Props) {
  const { slug } = await props.params;
  const tag = await getTag(slug);
  if (!tag) notFound();
  if (isRedirect(tag)) permanentRedirect(`/tags/${tag.redirect}`);

  return (
    <Listing
      eyebrow="Thẻ"
      title={`#${tag.name}`}
      description={tag.description}
      filter={{ tag: tag.slug }}
      searchParams={props.searchParams}
      base={`/tags/${tag.slug}`}
    />
  );
}

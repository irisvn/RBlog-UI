import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Listing } from "@/components/listing";
import { pageNumber, staticSlugs } from "@/lib/format";
import { getCategories, getCategory, isRedirect } from "@/lib/rblog";
import { pageMetadata, withPage } from "@/lib/seo";

type Props = PageProps<"/categories/[slug]">;

export async function generateStaticParams() {
  const categories = await getCategories();
  return staticSlugs(categories.data.map((c) => c.slug));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category || isRedirect(category)) return {};
  const page = pageNumber((await props.searchParams).page);
  const name = category.meta_title ?? category.name;
  return pageMetadata({
    title: page > 1 ? `${name} (trang ${page})` : name,
    description: category.meta_description ?? category.description ?? `Các bài viết trong chuyên mục ${category.name}.`,
    path: withPage(`/categories/${category.slug}`, page),
  });
}

// Looked up before anything streams: a real 404 or 301 (see posts/[slug]).
export const instant = false;

export default async function CategoryPage(props: Props) {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) notFound();
  if (isRedirect(category)) permanentRedirect(`/categories/${category.redirect}`);

  return (
    <Listing
      eyebrow="Chuyên mục"
      title={category.name}
      description={category.description}
      filter={{ category: category.slug }}
      searchParams={props.searchParams}
      base={`/categories/${category.slug}`}
    />
  );
}

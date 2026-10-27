import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Article } from "@/components/article";
import { formatShortDate, staticSlugs } from "@/lib/format";
import { getPost, getPosts, getSettings, isRedirect } from "@/lib/rblog";
import { absolute, jsonLd, pageMetadata, shareImage } from "@/lib/seo";
import type { Post } from "@/lib/types";

type Props = PageProps<"/posts/[slug]">;

export async function generateStaticParams() {
  const posts = await getPosts({ perPage: 100 });
  return staticSlugs(posts.data.map((post) => post.slug));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post || isRedirect(post)) return {};

  return pageMetadata({
    title: post.seo.meta_title ?? post.title,
    description: post.seo.meta_description ?? post.excerpt,
    path: `/posts/${post.slug}`,
    canonical: post.seo.canonical_url,
    image: shareImage(post.seo.og_image, post.cover),
    article: {
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author.name],
      tags: post.tags.map((t) => t.name),
      section: post.category?.name,
    },
  });
}

// The lookup runs before anything streams, so a missing post is a real 404 and an old
// slug a real 301 (docs/api.md, "Redirects"). It is cached and prerendered, so blocking
// on it costs next to nothing.
export const instant = false;

export default async function PostPage(props: Props) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();
  if (isRedirect(post)) permanentRedirect(`/posts/${post.redirect}`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: await structuredData(post) }} />
      <Article entry={post} />
      <Related post={post} />
    </>
  );
}

async function structuredData(post: Post): Promise<string> {
  const settings = await getSettings();
  const image = post.seo.og_image ?? post.cover?.url;
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.meta_description ?? post.excerpt ?? undefined,
    url: await absolute(`/posts/${post.slug}`),
    mainEntityOfPage: await absolute(post.seo.canonical_url ?? `/posts/${post.slug}`),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: image ? [image] : undefined,
    inLanguage: settings.site_language,
    articleSection: post.category?.name,
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: post.author.slug ? await absolute(`/authors/${post.author.slug}`) : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: settings.site_name,
      logo: settings.logo ? { "@type": "ImageObject", url: settings.logo.url } : undefined,
    },
  });
}

async function Related({ post }: { post: Post }) {
  if (!post.category) return null;
  const { data } = await getPosts({ category: post.category.slug, perPage: 4 });
  const others = data.filter((p) => p.id !== post.id).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <aside className="mt-16 border-t border-line pt-8" aria-labelledby="_related">
      <h2 id="_related" className="text-sm font-medium text-muted">
        Cùng chuyên mục {post.category.name}
      </h2>
      <ul className="mt-4 space-y-3">
        {others.map((p) => (
          <li key={p.id} className="flex items-baseline justify-between gap-4">
            <Link href={`/posts/${p.slug}`} className="font-medium hover:text-accent">
              {p.title}
            </Link>
            <time dateTime={p.published_at} className="shrink-0 text-sm text-muted">
              {formatShortDate(p.published_at)}
            </time>
          </li>
        ))}
      </ul>
    </aside>
  );
}

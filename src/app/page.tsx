import type { Metadata } from "next";
import { Suspense } from "react";
import { Article } from "@/components/article";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { ListSkeleton } from "@/components/skeleton";
import { pageNumber } from "@/lib/format";
import { getPage, getPosts, getSettings, isRedirect } from "@/lib/rblog";
import { absolute, jsonLd, pageMetadata, shareImage, withPage } from "@/lib/seo";

export async function generateMetadata(props: PageProps<"/">): Promise<Metadata> {
  const settings = await getSettings();
  const home = await homePage();
  if (home) {
    return pageMetadata({
      description: home.seo.meta_description ?? home.excerpt,
      path: "/",
      image: shareImage(home.seo.og_image, home.cover),
    });
  }
  const page = pageNumber((await props.searchParams).page);
  return pageMetadata({
    title: page > 1 ? `Trang ${page}` : undefined,
    description: settings.seo.meta_description || settings.description,
    path: withPage("/", page),
  });
}

/** The static page shown as the homepage (Settings → Reading), if any. */
async function homePage() {
  const settings = await getSettings();
  if (settings.homepage.shows !== "page" || !settings.homepage.page_slug) return null;
  const page = await getPage(settings.homepage.page_slug);
  return page && !isRedirect(page) ? page : null;
}

export default async function Home(props: PageProps<"/">) {
  const settings = await getSettings();
  const home = await homePage();

  const website = jsonLd({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.site_name,
    description: settings.description || undefined,
    url: await absolute("/"),
    inLanguage: settings.site_language,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${await absolute("/search")}?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: website }} />
      {home ? (
        <Article entry={home} />
      ) : (
        <>
          <h1 className="sr-only">{settings.site_name}</h1>
          {settings.description && (
            <p className="max-w-xl text-lg leading-relaxed text-muted">{settings.description}</p>
          )}
          <section aria-label="Bài viết mới" className={settings.description ? "mt-8" : ""}>
            <Suspense fallback={<ListSkeleton />}>
              <LatestPosts searchParams={props.searchParams} perPage={settings.posts_per_page} />
            </Suspense>
          </section>
        </>
      )}
    </>
  );
}

async function LatestPosts({
  searchParams,
  perPage,
}: {
  searchParams: PageProps<"/">["searchParams"];
  perPage: number;
}) {
  const page = pageNumber((await searchParams).page);
  const posts = await getPosts({ page, perPage });

  return (
    <>
      <PostList posts={posts.data} />
      <Pagination meta={posts.meta} base="/" />
    </>
  );
}

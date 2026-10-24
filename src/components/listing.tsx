import { Suspense } from "react";
import { pageNumber } from "@/lib/format";
import { getPosts, getSettings } from "@/lib/rblog";
import type { PostFilter } from "@/lib/types";
import { Pagination } from "./pagination";
import { PostList } from "./post-list";
import { ListSkeleton } from "./skeleton";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** A titled list of posts, for category, tag and author pages. Only the list waits for `?page`. */
export function Listing({
  eyebrow,
  title,
  description,
  filter,
  searchParams,
  base,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string | null;
  filter: PostFilter;
  searchParams: SearchParams;
  base: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-line pb-6">
        <p className="text-sm text-muted">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-3 max-w-xl leading-relaxed text-muted">{description}</p>}
        {children}
      </header>
      <Suspense fallback={<ListSkeleton />}>
        <Posts filter={filter} searchParams={searchParams} base={base} />
      </Suspense>
    </>
  );
}

async function Posts({ filter, searchParams, base }: { filter: PostFilter; searchParams: SearchParams; base: string }) {
  const settings = await getSettings();
  const page = pageNumber((await searchParams).page);
  const posts = await getPosts({ ...filter, page, perPage: settings.posts_per_page });

  return (
    <>
      <p className="mt-4 text-sm text-muted">{posts.meta.total} bài viết</p>
      <PostList posts={posts.data} />
      <Pagination meta={posts.meta} base={base} />
    </>
  );
}

import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { ListSkeleton } from "@/components/skeleton";
import { firstParam, pageNumber } from "@/lib/format";
import { getCategories, getPosts, getSettings, getTags } from "@/lib/rblog";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  robots: { index: false, follow: true },
};

type Props = PageProps<"/search">;

export default function SearchPage(props: Props) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Tìm kiếm</h1>
      <Suspense fallback={<SearchBox />}>
        <SearchBoxWithQuery searchParams={props.searchParams} />
      </Suspense>
      <Suspense fallback={<ListSkeleton />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

function SearchBox({ q = "" }: { q?: string }) {
  return (
    <Form action="/search" className="mt-6" role="search">
      <label htmlFor="q" className="sr-only">
        Từ khoá
      </label>
      <div className="flex gap-2">
        <input
          key={q}
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder="Nhập từ khoá, ví dụ: pho, rust…"
          autoComplete="off"
          className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3.5 text-base outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-fg px-4 font-medium text-bg transition-opacity hover:opacity-85"
        >
          Tìm
        </button>
      </div>
    </Form>
  );
}

async function SearchBoxWithQuery({ searchParams }: { searchParams: Props["searchParams"] }) {
  return <SearchBox q={firstParam((await searchParams).q)} />;
}

async function Results({ searchParams }: { searchParams: Props["searchParams"] }) {
  const params = await searchParams;
  const q = firstParam(params.q).slice(0, 100);

  if (!q) return <Browse />;

  const settings = await getSettings();
  const posts = await getPosts({ q, page: pageNumber(params.page), perPage: settings.posts_per_page });

  return (
    <section aria-live="polite" className="mt-8">
      <p className="text-sm text-muted">
        {posts.meta.total} kết quả cho “{q}”
      </p>
      <PostList posts={posts.data} empty="Không tìm thấy bài viết phù hợp. Thử từ khoá khác nhé." />
      <Pagination meta={posts.meta} base="/search" query={{ q }} />
    </section>
  );
}

/** With no query: browse by category and tag instead. */
async function Browse() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  const chip = "block rounded-full bg-surface px-3 py-1 text-muted transition-colors hover:text-fg";

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="text-sm font-medium text-muted">Chuyên mục</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {categories.data
            .filter((c) => c.post_count > 0)
            .map((c) => (
              <li key={c.id}>
                <Link href={`/categories/${c.slug}`} className={chip}>
                  {c.name} <span className="opacity-60">{c.post_count}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-medium text-muted">Thẻ</h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          {tags.data
            .filter((t) => t.post_count > 0)
            .map((t) => (
              <li key={t.id}>
                <Link href={`/tags/${t.slug}`} className={chip}>
                  #{t.name} <span className="opacity-60">{t.post_count}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

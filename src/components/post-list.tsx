import Link from "next/link";
import { formatShortDate } from "@/lib/format";
import type { PostSummary } from "@/lib/types";

export function PostList({ posts, empty = "Chưa có bài viết nào." }: { posts: PostSummary[]; empty?: string }) {
  if (posts.length === 0) {
    return <p className="py-10 text-muted">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {posts.map((post) => (
        <li key={post.id}>
          <article className="group relative py-6">
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
              <time dateTime={post.published_at}>{formatShortDate(post.published_at)}</time>
              {post.category && (
                <>
                  <span aria-hidden="true">·</span>
                  <Link href={`/categories/${post.category.slug}`} className="relative z-10 hover:text-fg">
                    {post.category.name}
                  </Link>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{post.reading_minutes} phút đọc</span>
              {post.featured && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">Nổi bật</span>
              )}
            </div>
            <h2 className="mt-1.5 text-xl font-semibold leading-snug tracking-tight">
              <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
                {post.title}
              </Link>
            </h2>
            {post.excerpt && <p className="mt-2 line-clamp-2 text-muted">{post.excerpt}</p>}
          </article>
        </li>
      ))}
    </ul>
  );
}

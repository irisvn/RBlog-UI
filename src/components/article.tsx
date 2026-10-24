import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { renderBody } from "@/lib/rich-text";
import type { Entry } from "@/lib/types";

type Props = {
  entry: Entry;
  /** Preview images are token URLs: never send them through the shared image optimizer. */
  unoptimized?: boolean;
  badge?: React.ReactNode;
};

export function Article({ entry, unoptimized = false, badge }: Props) {
  const post = "tags" in entry ? entry : null;

  return (
    <article>
      <header>
        {badge}
        {post && (
          <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
            {entry.published_at && <time dateTime={entry.published_at}>{formatDate(entry.published_at)}</time>}
            {post.category && (
              <>
                <span aria-hidden="true">·</span>
                <Link href={`/categories/${post.category.slug}`} className="hover:text-fg">
                  {post.category.name}
                </Link>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{entry.reading_minutes} phút đọc</span>
          </div>
        )}
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-balance sm:text-[2.5rem]">
          {entry.title}
        </h1>
        {post && (
          <p className="mt-4 text-sm text-muted">
            {post.author.slug ? (
              <Link href={`/authors/${post.author.slug}`} className="font-medium text-fg hover:text-accent">
                {post.author.name}
              </Link>
            ) : (
              <span className="font-medium text-fg">{post.author.name}</span>
            )}
          </p>
        )}
      </header>

      {entry.cover && (
        <figure className="mt-8">
          <Image
            src={entry.cover.url}
            alt={entry.cover.alt}
            width={entry.cover.width ?? 1600}
            height={entry.cover.height ?? 900}
            sizes="(min-width: 768px) 720px, 100vw"
            preload
            unoptimized={unoptimized}
            className="h-auto w-full rounded-lg"
          />
        </figure>
      )}

      {entry.outline.length >= 3 && (
        <details className="mt-8 rounded-lg border border-line px-4 py-3 text-sm" id="site_toc">
          <summary className="cursor-pointer select-none font-medium">Mục lục</summary>
          <ol className="mt-3 space-y-1.5">
            {entry.outline.map((h) => (
              <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 1}rem` }}>
                <a href={`#${h.id}`} className="text-muted hover:text-accent">
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </details>
      )}

      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: renderBody(entry.html) }} />

      {post && post.tags.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-2 text-sm" aria-label="Thẻ">
          {post.tags.map((tag) => (
            <li key={tag.slug}>
              <Link
                href={`/tags/${tag.slug}`}
                className="block rounded-full bg-surface px-3 py-1 text-muted transition-colors hover:text-fg"
              >
                #{tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

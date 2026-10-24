import Link from "next/link";
import type { Meta } from "@/lib/types";

/** Newer / older links. `base` is the path; extra query values (like `q`) are kept. */
export function Pagination({
  meta,
  base,
  query = {},
}: {
  meta: Meta;
  base: string;
  query?: Record<string, string>;
}) {
  if (meta.lastPage <= 1) return null;

  const href = (page: number) => {
    const search = new URLSearchParams(query);
    if (page > 1) search.set("page", String(page));
    const s = search.toString();
    return s ? `${base}?${s}` : base;
  };

  const linkClass = "rounded-md px-3 py-1.5 transition-colors hover:bg-surface hover:text-fg";

  return (
    <nav aria-label="Phân trang" className="mt-6 flex items-center justify-between text-sm text-muted">
      {meta.page > 1 ? (
        <Link href={href(meta.page - 1)} rel="prev" className={linkClass}>
          ← Mới hơn
        </Link>
      ) : (
        <span />
      )}
      <span>
        Trang {meta.page} / {meta.lastPage}
      </span>
      {meta.page < meta.lastPage ? (
        <Link href={href(meta.page + 1)} rel="next" className={linkClass}>
          Cũ hơn →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

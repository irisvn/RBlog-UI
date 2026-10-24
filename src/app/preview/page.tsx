import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Article } from "@/components/article";
import { ArticleSkeleton } from "@/components/skeleton";
import { firstParam } from "@/lib/format";
import { getPreview } from "@/lib/rblog";

// The admin's Preview link: {frontend_url}/preview?token=… (docs/api.md, "Preview").
export const metadata: Metadata = {
  title: "Xem trước",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const STATUS: Record<string, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  scheduled: "Đã hẹn giờ",
  published: "Đã đăng",
};

export default function PreviewPage(props: PageProps<"/preview">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <PreviewContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function PreviewContent({ searchParams }: { searchParams: PageProps<"/preview">["searchParams"] }) {
  // A preview is private and per request: never part of a prerender.
  await connection();
  const token = firstParam((await searchParams).token);
  if (!token) return <Notice>Thiếu token xem trước.</Notice>;

  const entry = await getPreview(token);
  if (!entry) return <Notice>Link xem trước đã hết hạn hoặc không hợp lệ. Hãy tạo link mới trong trang quản trị.</Notice>;

  return (
    <Article
      entry={entry}
      unoptimized
      badge={
        <p className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          Xem trước · {STATUS[entry.preview.status] ?? entry.preview.status}
        </p>
      }
    />
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-line px-4 py-3 text-muted">{children}</p>;
}

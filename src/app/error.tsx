"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold tracking-tight">Có lỗi xảy ra</h1>
      <p className="mt-3 text-muted">Không tải được nội dung lúc này. Vui lòng thử lại sau ít phút.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
      >
        Thử lại
      </button>
    </div>
  );
}

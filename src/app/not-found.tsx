import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-10">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Không tìm thấy trang</h1>
      <p className="mt-3 text-muted">Trang này không tồn tại hoặc đã được gỡ xuống.</p>
      <div className="mt-6 flex gap-4 text-sm">
        <Link href="/" className="font-medium text-accent hover:underline">
          ← Về trang chủ
        </Link>
        <Link href="/search" className="text-muted hover:text-fg">
          Tìm kiếm
        </Link>
      </div>
    </div>
  );
}

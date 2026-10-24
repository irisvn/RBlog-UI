"use client";

// Shown when the root layout itself fails (RBlog unreachable and its settings not cached).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto", padding: "64px 16px", lineHeight: 1.6 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Blog tạm thời không truy cập được</h1>
        <p style={{ color: "#6b6a64" }}>Máy chủ nội dung đang gặp sự cố. Vui lòng thử lại sau ít phút.</p>
        <button type="button" onClick={reset} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e6e4de", background: "none", cursor: "pointer" }}>
          Thử lại
        </button>
      </body>
    </html>
  );
}

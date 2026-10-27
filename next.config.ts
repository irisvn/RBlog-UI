import type { NextConfig } from "next";

const rblog = new URL(process.env.RBLOG_URL ?? "http://localhost:8000");
const isLocalCms = ["localhost", "127.0.0.1", "::1"].includes(rblog.hostname);

const nextConfig: NextConfig = {
  // A self-contained server for the Docker image (Dockerfile).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: false,
  cacheLife: {
    // RBlog content: the webhook revalidates on change; the 10-minute revalidate is the
    // fallback when the webhook is unreachable (docs/api.md, "Webhook").
    rblog: { stale: 300, revalidate: 600, expire: 86400 },
    // Pages a build without a key prerendered empty (src/lib/rblog.ts): refreshed on first visit.
    offline: { stale: 300, revalidate: 1, expire: 86400 },
  },
  images: {
    remotePatterns: [
      {
        protocol: rblog.protocol.replace(":", "") as "http" | "https",
        hostname: rblog.hostname,
        port: rblog.port,
        pathname: "/api/v1/media/**",
      },
    ],
    // Only for a CMS on this machine (development).
    dangerouslyAllowLocalIP: isLocalCms,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
          },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

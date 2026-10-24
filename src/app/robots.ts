import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/rblog";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await siteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/preview", "/search", "/api/"] },
    sitemap: `${site}/sitemap.xml`,
  };
}

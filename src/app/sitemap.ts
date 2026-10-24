import type { MetadataRoute } from "next";
import { getSitemap, siteUrl } from "@/lib/rblog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await siteUrl();
  const entries: MetadataRoute.Sitemap = [{ url: site }];

  for (const type of ["post", "page", "category", "tag"]) {
    let after: string | undefined;
    do {
      const batch = await getSitemap(type, after);
      for (const row of batch.data) entries.push({ url: site + row.path, lastModified: row.lastmod });
      after = batch.next ?? undefined;
    } while (after);
  }
  return entries;
}

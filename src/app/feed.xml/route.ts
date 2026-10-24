import { getPosts, getSettings, siteUrl } from "@/lib/rblog";

// RBlog has no feed endpoint: the RSS feed is built from the 20 latest posts.

function escape(text: string): string {
  return text.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);
}

export async function GET() {
  const [settings, site, posts] = await Promise.all([getSettings(), siteUrl(), getPosts({ perPage: 20 })]);

  const items = posts.data
    .map((post) => {
      const link = `${site}/posts/${post.slug}`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>${post.excerpt ? `\n      <description>${escape(post.excerpt)}</description>` : ""}${post.category ? `\n      <category>${escape(post.category.name)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(settings.site_name)}</title>
    <link>${site}</link>
    <description>${escape(settings.description || settings.site_name)}</description>
    <language>${escape(settings.site_language || "vi")}</language>
    <atom:link href="${site}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

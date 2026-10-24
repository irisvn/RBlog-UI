// Shapes of RBlog's Content API (RBlog docs/api.md). Ids travel as strings.

export type Image = {
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
};

export type Ref = { slug: string; name: string };

export type Heading = { level: 2 | 3 | 4; text: string; id: string };

export type Seo = {
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
};

export type PageSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: Image | null;
  author: { slug: string | null; name: string };
  published_at: string;
  updated_at: string;
  reading_minutes: number;
  seo: Seo;
};

export type PostSummary = PageSummary & {
  category: Ref | null;
  tags: Ref[];
  featured: boolean;
};

export type Body = { html: string; outline: Heading[] };
export type Post = PostSummary & Body;
export type Page = PageSummary & Body;

/** A post or page whose `published_at` may be null (a draft in preview). */
export type Entry = (Omit<Post, "published_at"> | Omit<Page, "published_at">) & { published_at: string | null };

export type Preview = Entry & {
  preview: { type: "post" | "page"; status: "draft" | "pending" | "scheduled" | "published" };
};

export type Redirect = { redirect: string };

export type Meta = { page: number; perPage: number; total: number; lastPage: number };
export type List<T> = { data: T[]; meta: Meta };

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  post_count: number;
};

export type Tag = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  post_count: number;
};

export type Author = {
  slug: string;
  name: string;
  bio: string | null;
  website: string | null;
  avatar: Image | null;
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
  new_tab: boolean;
  children?: MenuItem[];
};

export type Menu = { key: string; name: string; items: MenuItem[] };

export type Settings = {
  site_name: string;
  description: string;
  site_language: string;
  frontend_url: string | null;
  posts_per_page: number;
  logo: Image | null;
  seo: {
    meta_title: string;
    meta_description: string;
    og_image: Image | null;
    social_links: Record<string, string>;
  };
  homepage: { shows: "latest_posts" | "page"; page_slug: string | null };
};

export type SitemapBatch = {
  data: { type: string; path: string; lastmod: string }[];
  next: string | null;
};

export type PostFilter = {
  page?: number;
  perPage?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  q?: string;
};

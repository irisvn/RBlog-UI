import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type {
  Author,
  Category,
  List,
  Menu,
  Page,
  PageSummary,
  Post,
  PostFilter,
  PostSummary,
  Preview,
  Redirect,
  Settings,
  SitemapBatch,
  Tag,
} from "./types";

const BASE = (process.env.RBLOG_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class RBlogError extends Error {
  constructor(
    public status: number,
    public path: string,
  ) {
    super(`RBlog ${status} on ${path}`);
  }
}

/**
 * A build without a Content API key (the Docker image built by CI, where RBlog is not reachable)
 * prerenders with empty content and the `offline` cache profile: the first request after the
 * deploy replaces it with RBlog's content.
 */
const OFFLINE = process.env.NEXT_PHASE === "phase-production-build" && !process.env.RBLOG_CONTENT_KEY;

/** The cache profile of a getter (`next.config.ts`). */
function life() {
  if (OFFLINE) cacheLife("offline");
  else cacheLife("rblog");
}

const EMPTY_LIST = { data: [], meta: { page: 1, perPage: 0, total: 0, lastPage: 1 } };

const DEFAULT_SETTINGS: Settings = {
  site_name: "RBlog",
  description: "",
  site_language: "vi",
  frontend_url: null,
  posts_per_page: 10,
  logo: null,
  seo: { meta_title: "", meta_description: "", og_image: null, social_links: {} },
  homepage: { shows: "latest_posts", page_slug: null },
};

/** GET {RBLOG_URL}/api/v1/content{path} with the server-side key. `null` on 404. */
async function get<T>(path: string): Promise<T | null> {
  if (OFFLINE) return null;
  const res = await fetch(`${BASE}/api/v1/content${path}`, {
    headers: {
      Authorization: `Bearer ${process.env.RBLOG_CONTENT_KEY ?? ""}`,
      Accept: "application/json",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new RBlogError(res.status, path);
  return res.json() as Promise<T>;
}

/** Like `get`, but a 404 is an error. `offline` is the answer of a build without a key. */
async function must<T>(path: string, offline: T): Promise<T> {
  if (OFFLINE) return offline;
  const value = await get<T>(path);
  if (value === null) throw new RBlogError(404, path);
  return value;
}

function query(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

const enc = encodeURIComponent;

/** Tag on every cached answer, to clear them all at once (/api/revalidate). */
export const ALL = "rblog";

/** Every page of a list (the API answers at most 100 per page). */
async function all<T>(path: string): Promise<List<T>> {
  const first = await must<List<T>>(`${path}?per_page=100`, EMPTY_LIST);
  const data = [...first.data];
  for (let page = 2; page <= first.meta.lastPage; page++) {
    data.push(...(await must<List<T>>(`${path}?per_page=100&page=${page}`, EMPTY_LIST)).data);
  }
  return { data, meta: { ...first.meta, page: 1, perPage: data.length, lastPage: 1 } };
}

// Every getter is cached under the tags RBlog's webhook sends (docs/api.md, "Webhook"),
// so /api/rblog-webhook revalidates exactly what changed.

export async function getSettings(): Promise<Settings> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("settings");
  return must<Settings>("/settings", DEFAULT_SETTINGS);
}

export async function getMenu(key: "primary" | "footer"): Promise<Menu | null> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag(`menu:${key}`);
  return get<Menu>(`/menus/${key}`);
}

export async function getPosts(filter: PostFilter = {}): Promise<List<PostSummary>> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("posts");
  if (filter.category) cacheTag(`category:${filter.category}`);
  if (filter.tag) cacheTag(`tag:${filter.tag}`);
  if (filter.author) cacheTag(`author:${filter.author}`);
  return must<List<PostSummary>>(
    `/posts${query({
      page: filter.page,
      per_page: filter.perPage,
      category: filter.category,
      tag: filter.tag,
      author: filter.author,
      featured: filter.featured,
      q: filter.q?.slice(0, 100),
    })}`,
    EMPTY_LIST,
  );
}

export async function getPost(slug: string): Promise<Post | Redirect | null> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("posts");
  const post = await get<Post | Redirect>(`/posts/${enc(slug)}`);
  if (post && "id" in post) cacheTag(`post:${post.id}`);
  return post;
}

export async function getPages(): Promise<List<PageSummary>> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("pages");
  return all<PageSummary>("/pages");
}

export async function getPage(slug: string): Promise<Page | Redirect | null> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("pages");
  const page = await get<Page | Redirect>(`/pages/${enc(slug)}`);
  if (page && "id" in page) cacheTag(`page:${page.id}`);
  return page;
}

export async function getCategories(): Promise<List<Category>> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("posts");
  return all<Category>("/categories");
}

export async function getCategory(slug: string): Promise<Category | Redirect | null> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("posts", `category:${slug}`);
  return get<Category | Redirect>(`/categories/${enc(slug)}`);
}

export async function getTags(): Promise<List<Tag>> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("posts");
  return all<Tag>("/tags");
}

export async function getTag(slug: string): Promise<Tag | Redirect | null> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("posts", `tag:${slug}`);
  return get<Tag | Redirect>(`/tags/${enc(slug)}`);
}

export async function getAuthor(slug: string): Promise<Author | null> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag(`author:${slug}`);
  return get<Author>(`/authors/${enc(slug)}`);
}

export async function getSitemap(type: string, after?: string): Promise<SitemapBatch> {
  "use cache";
  life();
  cacheTag(ALL);
  cacheTag("sitemap");
  return must<SitemapBatch>(`/sitemap${query({ type, after })}`, { data: [], next: null });
}

/** A draft for /preview. Never cached: the token is short-lived and the content private. */
export async function getPreview(token: string): Promise<Preview | null> {
  const res = await fetch(`${BASE}/api/v1/preview?token=${enc(token)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new RBlogError(res.status, "/preview");
  return res.json() as Promise<Preview>;
}

/** Public URL of this site, for canonical links, the sitemap and the feed. */
export async function siteUrl(): Promise<string> {
  const fromEnv = process.env.SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const settings = await getSettings();
  return (settings.frontend_url || "http://localhost:3000").replace(/\/$/, "");
}

export function isRedirect<T extends object>(value: T | Redirect): value is Redirect {
  return "redirect" in value;
}

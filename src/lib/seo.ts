import type { Metadata } from "next";
import { getSettings, siteUrl } from "./rblog";
import type { Image } from "./types";

type Share = { url: string; width?: number; height?: number; alt?: string };

function fromImage(image: Image | null | undefined): Share | undefined {
  if (!image) return undefined;
  return { url: image.url, width: image.width ?? undefined, height: image.height ?? undefined, alt: image.alt };
}

/** `?page=N` for N > 1: each page of a list is its own canonical URL. */
export function withPage(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path;
}

/**
 * Metadata for one page. Child metadata replaces the root's `openGraph` and `twitter` whole,
 * so every page builds them completely here.
 * Share image: the record's OG image, then its cover, then the site default (frontend guide §12).
 */
export async function pageMetadata({
  title,
  description,
  path,
  canonical,
  image,
  article,
}: {
  title?: string;
  description?: string | null;
  path: string;
  canonical?: string | null;
  image?: Share;
  article?: { publishedTime: string; modifiedTime: string; authors: string[]; tags: string[]; section?: string };
}): Promise<Metadata> {
  const settings = await getSettings();
  const desc = description || settings.seo.meta_description || settings.description || undefined;
  const share = image ?? fromImage(settings.seo.og_image);
  const ogTitle = title ?? (settings.seo.meta_title || settings.site_name);
  const url = canonical ?? path;

  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      siteName: settings.site_name,
      locale: settings.site_language === "vi" ? "vi_VN" : settings.site_language,
      url,
      title: ogTitle,
      description: desc,
      images: share ? [share] : undefined,
      ...(article ? { type: "article", ...article } : { type: "website" }),
    },
    twitter: {
      card: share ? "summary_large_image" : "summary",
      title: ogTitle,
      description: desc,
      images: share ? [share.url] : undefined,
    },
  };
}

export function shareImage(ogImage: string | null, cover: Image | null): Share | undefined {
  if (ogImage) return { url: ogImage };
  return fromImage(cover);
}

/** JSON-LD, with `<` escaped so the content cannot close the script element. */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function absolute(path: string): Promise<string> {
  return /^https?:\/\//.test(path) ? path : (await siteUrl()) + path;
}

// Formatting is done on the server in a fixed zone, so server and client never disagree.
const TIME_ZONE = "Asia/Ho_Chi_Minh";

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const shortFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TIME_ZONE,
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  return shortFormat.format(new Date(iso));
}

/** Page number from a `?page=` value: a positive integer, else 1. */
export function pageNumber(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n >= 1 && n <= 10_000 ? n : 1;
}

export function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/**
 * Params for `generateStaticParams`. With Cache Components an empty list fails the build, so a
 * site without content yet prerenders one slug that no record has (it renders the 404 page).
 */
export function staticSlugs(slugs: string[]): { slug: string }[] {
  return (slugs.length > 0 ? slugs : ["_"]).map((slug) => ({ slug }));
}

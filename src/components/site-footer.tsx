import { getMenu, getSettings } from "@/lib/rblog";
import { MenuLink } from "./menu-link";

const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  github: "GitHub",
  twitter: "X",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  threads: "Threads",
  mastodon: "Mastodon",
};

export async function SiteFooter() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu("footer")]);
  const social = Object.entries(settings.seo.social_links ?? {}).filter(([, url]) => url);

  return (
    <footer className="mx-auto mt-auto w-full max-w-3xl px-4 pb-10 pt-16 sm:px-6">
      <div className="flex flex-col gap-4 border-t border-line pt-6 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        <nav aria-label="Chân trang">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {menu?.items.flatMap((item) => [item, ...(item.children ?? [])]).map((item) => (
              <li key={item.id}>
                <MenuLink item={item} className="transition-colors hover:text-fg" />
              </li>
            ))}
            {social.map(([network, url]) => (
              <li key={network}>
                <a href={url} target="_blank" rel="noopener noreferrer me" className="transition-colors hover:text-fg">
                  {SOCIAL_LABELS[network.toLowerCase()] ?? network}
                </a>
              </li>
            ))}
            <li>
              <a href="/feed.xml" className="transition-colors hover:text-fg">
                RSS
              </a>
            </li>
          </ul>
        </nav>
        <p className="shrink-0">© {settings.site_name}</p>
      </div>
    </footer>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getMenu, getSettings } from "@/lib/rblog";
import { MenuLink } from "./menu-link";
import { ThemeToggle } from "./theme-toggle";

const linkClass = "block rounded-md px-2 py-1 text-muted transition-colors hover:text-fg";

export async function SiteHeader() {
  const [settings, menu] = await Promise.all([getSettings(), getMenu("primary")]);
  const items = menu?.items ?? [];

  return (
    <header className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 text-lg font-semibold tracking-tight">
          {settings.logo && (
            <Image
              src={settings.logo.url}
              alt=""
              width={28}
              height={28}
              className="size-7 rounded-md object-contain"
            />
          )}
          <span className="truncate">{settings.site_name}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/search"
            aria-label="Tìm kiếm"
            title="Tìm kiếm"
            className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {items.length > 0 && (
        <nav aria-label="Menu chính" className="-mx-2 mt-4">
          <ul className="flex flex-wrap gap-x-1 gap-y-0.5 whitespace-nowrap text-[0.9375rem]">
            {items.map((item) => (
              <li key={item.id} className="relative">
                {item.children?.length ? (
                  // One level deep (docs/api.md, "Menus"); <details> opens by touch and keyboard without JS.
                  <details className="group">
                    <summary className={`${linkClass} flex cursor-pointer list-none items-center gap-1 [&::-webkit-details-marker]:hidden`}>
                      {item.label}
                      <svg className="size-3.5 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <ul className="absolute left-0 z-20 mt-1 min-w-48 rounded-lg border border-line bg-bg p-1 shadow-lg shadow-black/5">
                      {[{ ...item, children: [] }, ...item.children].map((child) => (
                        <li key={child.id}>
                          <MenuLink item={child} className={linkClass} />
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <MenuLink item={item} className={linkClass} />
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

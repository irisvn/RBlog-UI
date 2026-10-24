import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSettings, siteUrl } from "@/lib/rblog";
import { themeScript } from "@/lib/theme";
import "./globals.css";

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin", "vietnamese"],
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, url] = await Promise.all([getSettings(), siteUrl()]);
  const title = settings.seo.meta_title || settings.site_name;
  const description = settings.seo.meta_description || settings.description || undefined;
  const og = settings.seo.og_image;

  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s · ${settings.site_name}` },
    description,
    // No canonical here: it would be inherited by every page that sets none (search, 404).
    alternates: {
      types: { "application/rss+xml": [{ url: "/feed.xml", title: settings.site_name }] },
    },
    openGraph: {
      type: "website",
      siteName: settings.site_name,
      title,
      description,
      locale: settings.site_language === "vi" ? "vi_VN" : settings.site_language,
      images: og ? [{ url: og.url, width: og.width ?? undefined, height: og.height ?? undefined, alt: og.alt }] : undefined,
    },
    twitter: { card: og ? "summary_large_image" : "summary" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html
      lang={settings.site_language || "vi"}
      className={`${body.variable} ${code.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#site_main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-fg focus:px-3 focus:py-2 focus:text-bg"
        >
          Bỏ qua đến nội dung
        </a>
        <SiteHeader />
        <main id="site_main" className="mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}

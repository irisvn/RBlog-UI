# RBlog UI: rules for working on this repository

RBlog UI is the **public blog site** of [RBlog](https://github.com/irisvn/RBlog): a Next.js 16 app
(App Router, Cache Components, React 19, Tailwind CSS 4) that reads published content from RBlog's
read-only Content API on the server and is told about changes by RBlog's webhook. RBlog itself (the
admin and the API) lives in `../RBlog` and is out of scope here.

The person who owns this project writes in Vietnamese. Answer in Vietnamese, plainly. Code,
comments, identifiers and `CLAUDE.md` are in English; text readers see, and `README.md`, are in
Vietnamese.

@AGENTS.md

## 0. Before you start

- Read this file, `README.md`, and the code near what you change. Match the surrounding code:
  naming, comment density, idioms.
- **Next.js 16 is not the Next.js you remember.** Before you use an API, read its page in
  `node_modules/next/dist/docs/`. In particular:
  - caching is `'use cache'` + `cacheLife` + `cacheTag`;
  - `revalidateTag(tag, profile)` takes two arguments;
  - `params` and `searchParams` are promises;
  - runtime data outside `<Suspense>` is reported as a blocking route.
- The contract is RBlog's, not ours:
  - `../RBlog/docs/api.md` (endpoints, JSON, rich text, preview, webhook);
  - `../RBlog/docs/frontend-integration.html` (integration guide and the pre-launch checklist, §14).
  
  Read the relevant section before you touch data, caching or the webhook. `../RBlog` is a
  read-only reference: never edit it from here. A change to the API goes to the RBlog session or
  the owner.

## 1. Data and secrets

- Every Content API call goes through `src/lib/rblog.ts` (`import "server-only"`). Never call
  RBlog from a Client Component or the browser: there is no CORS on purpose.
- `RBLOG_CONTENT_KEY` and `RBLOG_WEBHOOK_SECRET` are server-only. Never name them `NEXT_PUBLIC_*`,
  never log them, never commit `.env.local`. `.env.example` lists the variables without values.
- Each getter is `'use cache'` with `cacheLife("rblog")`, `cacheTag(ALL)`, and the tags RBlog's
  webhook sends for that data (`posts`, `post:{id}`, `pages`, `page:{id}`, `category:{slug}`,
  `tag:{slug}`, `author:{slug}`, `menu:{key}`, `settings`, `sitemap`).
  - A new getter follows the same pattern, or the webhook will not refresh it.
  - Inside a cached getter: return `null` for a 404, throw for anything else. Errors are not cached.
- A build without `RBLOG_CONTENT_KEY` (the CI image) is OFFLINE: getters answer empty content
  under the `offline` cache profile, without calling RBlog, and the first request after a deploy
  refreshes them. A new getter that must answer during the build takes an offline fallback in
  `must()`.
- The preview (`getPreview`) is never cached: `no-store`, `await connection()`, noindex, and its
  images are `unoptimized`.
- Types in `src/lib/types.ts` mirror the API exactly:
  - ids are strings;
  - `seo.og_image` of a post or page is a string;
  - cover, logo and avatar are `{url, width, height, alt}`, and width and height may be null.

## 2. Routes and status codes

- RBlog's paths are ours: `/posts/{slug}`, `/{slug}` (page), `/categories/{slug}`, `/tags/{slug}`,
  `/authors/{slug}`. Menus, the sitemap and webhook paths use them as given.
- Detail routes look the record up **before** any `<Suspense>`, call `notFound()` /
  `permanentRedirect()` there, and set `export const instant = false`. This is how a missing record
  answers a real 404 and an old slug (`{ "redirect": … }`) a real 301.
  - `partialPrefetching` is `false` for the same reason: with it on, the first visit to an unlisted
    URL answers 200.
  - Keep it off unless you have checked the first-visit status code, with `curl`, on a production
    build.
- Only request data (`?page`, `?q`, `?token`) is read inside `<Suspense>`.
- Detail routes have `generateStaticParams`.
- Don't add a top-level route whose name a page slug could need without telling the owner, and list
  it under "Slug dành riêng" in the README.

## 3. Rich text and SEO

- `html` from RBlog is escaped by RustCMS. `src/lib/rich-text.ts` only rewrites known elements:
  embeds into iframes (the id is matched per provider), tables into a scrolling frame, and lazy
  images. Do not inject anything else into it.
- Ids of layout elements use characters heading slugs never hold (`site_main`, `site_toc`,
  `_related`), so they cannot clash with heading ids.
- Metadata goes through `pageMetadata()` in `src/lib/seo.ts`. A page's `openGraph` replaces the
  root's whole, so build it completely there. Share image order: `seo.og_image` → cover →
  `settings.seo.og_image`.
- No canonical in the root layout: it would be inherited by search and 404 pages.

## 4. UI

- Minimal and readable:
  - a reading column of `max-w-3xl`;
  - colors only through the tokens in `globals.css` (`bg`, `surface`, `fg`, `muted`, `line`,
    `accent`), in light and dark;
  - Be Vietnam Pro.
- Dates are formatted on the server in `Asia/Ho_Chi_Minh` (`src/lib/format.ts`).
- Pages must work at 390 px without sideways scrolling, and with the keyboard.

## 5. Check before you hand over

```sh
npx tsc --noEmit && npm run lint && npm run build
PORT=3100 npm start   # then check status codes and pages
```

- With `curl` on the production build:
  - a missing post, page, category, tag or author answers 404 on the **first** visit;
  - known pages answer 200.
- Look at the pages you changed in a browser, light and dark, at 1280 and 390 px. RBlog's
  `resources/admin/node_modules/playwright-core` drives the installed Chrome for screenshots.
- A change to the webhook: send a request signed with `openssl dgst -sha256 -hmac` and check:
  - valid → 204;
  - replayed → 204;
  - bad signature → 401;
  - stale timestamp → 401.
- Say plainly what you could not check.

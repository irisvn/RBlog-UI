# RBlog UI

Trang blog công khai (phần người đọc thấy) cho [RBlog](https://github.com/irisvn/RBlog): Next.js 16
(App Router, Cache Components), React 19, Tailwind CSS 4. Giao diện tiếng Việt, tối giản, sáng/tối.

RBlog là trang quản trị và nguồn nội dung. RBlog UI đọc nội dung đã đăng qua **Content API chỉ đọc**
của RBlog, **từ phía server** (key không bao giờ xuống trình duyệt), và được RBlog báo qua **webhook**
mỗi khi nội dung thay đổi để làm mới cache.

```
Trình duyệt ──HTML──▶ RBlog UI (Next.js) ──Bearer key──▶ RBlog /api/v1/content
                           ▲                                   │
                           └──────── webhook (ký HMAC) ─────────┘
ảnh: RBlog /api/v1/media/… (công khai, không cần key)
```

## Chạy

Cần Node.js 20+ và một RBlog đang chạy (mặc định `http://localhost:8000`).

```sh
cp .env.example .env.local   # điền RBLOG_CONTENT_KEY và RBLOG_WEBHOOK_SECRET
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
npm run lint
```

| Biến (chỉ phía server) | |
|---|---|
| `RBLOG_URL` | `APP_URL` của RBlog, không có `/` cuối |
| `RBLOG_CONTENT_KEY` | Content API key: RBlog admin → Tích hợp → Content API → Tạo khoá. Không bao giờ đặt tên `NEXT_PUBLIC_*` |
| `RBLOG_WEBHOOK_SECRET` | Trùng secret ở RBlog Cài đặt → Tích hợp. Trống thì webhook trả 503 |
| `SITE_URL` | URL công khai của site (canonical, sitemap, RSS, JSON-LD). Trống thì lấy `frontend_url` trong settings của RBlog |

### Cấu hình phía RBlog

1. **Cài đặt → Chung:** URL công khai của site = `SITE_URL`.
2. **Cài đặt → Tích hợp:** Webhook URL = `{SITE_URL}/api/rblog-webhook`, secret = `RBLOG_WEBHOOK_SECRET`,
   đường dẫn preview = `/preview`.
3. Sau khi cấu hình webhook lần đầu, xoá toàn bộ cache một lần (RBlog không gửi lại sự kiện cũ):

   ```sh
   curl -X POST -H "Authorization: Bearer $RBLOG_WEBHOOK_SECRET" http://localhost:3000/api/revalidate
   ```

**Ở máy dev**, RBlog chỉ gửi webhook tới `http://localhost` khi chạy với
`RUSTCMS_WEBHOOK__ALLOW_INSECURE_LOCAL=true` (hoặc `allow_insecure_local = true` trong
`config/webhook.toml`, không bao giờ commit). Nút Xem trước của admin chỉ tạo link khi URL công khai
là `https://`.

## Trang

| Đường dẫn | |
|---|---|
| `/` | Bài mới nhất, phân trang `?page=`; hoặc một trang tĩnh nếu Cài đặt → Đọc chọn vậy |
| `/posts/{slug}` | Bài viết: mục lục (≥ 3 heading), video YouTube/Vimeo, bảng, callout, ảnh, thẻ, bài cùng chuyên mục |
| `/{slug}` | Trang tĩnh (Giới thiệu, Liên hệ…) |
| `/categories/{slug}`, `/tags/{slug}`, `/authors/{slug}` | Bài theo chuyên mục, thẻ, tác giả, có phân trang |
| `/search?q=` | Tìm kiếm không phân biệt dấu ("pho" ra "Phở"); không có từ khoá thì hiện chuyên mục và thẻ |
| `/preview?token=` | Xem trước bản nháp từ nút Xem trước của admin (không cache, noindex) |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt` | RSS 20 bài mới nhất, sitemap từ API, robots |
| `POST /api/rblog-webhook` | Webhook RBlog: kiểm tra chữ ký HMAC trên body thô, chặn timestamp lệch quá 5 phút, bỏ qua event trùng, làm mới mọi tag và đường dẫn |
| `POST /api/revalidate` | Xoá toàn bộ cache (`Authorization: Bearer $RBLOG_WEBHOOK_SECRET`) |

Đường dẫn trùng cách RBlog đặt tên (menu, sitemap, webhook): `/posts/{slug}`, `/{slug}`,
`/categories/{slug}`, `/tags/{slug}`, `/authors/{slug}`.

**Slug dành riêng:** trang tĩnh nằm ở `/{slug}`, nên đừng đặt slug trang là `search`, `preview`,
`posts`, `categories`, `tags`, `authors`, `api`, `feed.xml`, `sitemap.xml`, `robots.txt`.

## Cache

- Mọi hàm đọc trong `src/lib/rblog.ts` dùng `'use cache'`, gắn tag trùng tag mà webhook RBlog gửi
  (`posts`, `post:{id}`, `pages`, `page:{id}`, `category:{slug}`, `tag:{slug}`, `author:{slug}`,
  `menu:{key}`, `settings`, `sitemap`), cộng tag chung `rblog` để xoá tất cả.
- Profile `rblog` (`next.config.ts`): làm mới dự phòng mỗi 10 phút nếu webhook không tới được.
- Webhook làm mới bằng `revalidateTag(tag, { expire: 0 })`: người viết vừa đăng bài là thấy ngay.

## SEO

- Title, description, canonical (mỗi trang `?page=N` có canonical riêng), Open Graph và Twitter card
  đầy đủ trên mọi trang (`src/lib/seo.ts`).
- Ảnh chia sẻ: `seo.og_image` của bài → ảnh bìa → ảnh mặc định trong settings.
- JSON-LD `BlogPosting` cho bài viết, `WebSite` (kèm ô tìm kiếm) cho trang chủ.
- Nội dung không tồn tại trả **404**, slug cũ trả **301** sang slug mới; tìm kiếm, xem trước và 404
  có `noindex`.
- `lang` theo `site_language` của RBlog; sitemap có `lastmod`; RSS.

## Cấu trúc

| Đường dẫn | Chứa |
|---|---|
| `src/app/` | Các route (App Router), `layout.tsx`, `globals.css` (màu, kiểu chữ, kiểu thân bài) |
| `src/components/` | Header, footer, danh sách bài, phân trang, bài viết, nút sáng/tối |
| `src/lib/rblog.ts` | Gọi Content API, cache và tag (chỉ chạy phía server) |
| `src/lib/types.ts` | Kiểu dữ liệu của Content API |
| `src/lib/seo.ts` | Metadata, ảnh chia sẻ, JSON-LD |
| `src/lib/rich-text.ts` | Biến embed thành player, bảng cuộn ngang, ảnh lazy |

## Lưu ý

- `partialPrefetching` đang tắt, và các trang bài, trang tĩnh, chuyên mục, thẻ, tác giả đặt
  `instant = false`: dữ liệu được tra trước khi stream để trả đúng 404/301 ngay từ lần truy cập đầu.
  Dữ liệu đã cache và prerender nên không chậm.
- Bộ nhớ event id đã xử lý của webhook nằm trong RAM: chạy nhiều instance thì chuyển sang Redis/KV.
- Ảnh trong thân bài tải thẳng từ RBlog (`/api/v1/media`, giới hạn 600 request/phút/IP): khi chạy
  thật, đặt CDN trước RBlog.

## Tài liệu

- RBlog `docs/api.md`: hợp đồng Content API, preview, webhook.
- RBlog `docs/frontend-integration.html`: hướng dẫn tích hợp Next/Nuxt (tiếng Việt).
- Next.js 16: `node_modules/next/dist/docs/`.

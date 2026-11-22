# System Design Learning

Khoá học system design tiếng Việt, xây bằng **Astro thuần** (không Starlight, không
framework UI). Nội dung là MDX — mỗi chủ đề một file — nên sidebar, mục lục và
prev/next đều sinh ra từ chính nội dung, không có danh sách viết tay.

## Nội dung

**8 module · 66 chủ đề · 51 diagram · 115 khái niệm · 45 câu hỏi · 8 bài tập**

| # | Module | Chủ đề | Trọng tâm |
|---|---|---|---|
| 0 | Kiến thức nền tảng | 8 | OSI/TCP-IP, DNS/TLS, process/thread, ACID, index, CAP |
| 1 | Nền tảng System Design | 7 | Khung 4 bước, NFR, back-of-envelope, latency vs throughput |
| 2 | Building Blocks | 8 | LB, cache, rate limiter, queue, CDN, search, unique ID |
| 3 | Dữ liệu & Lưu trữ | 9 | B+ vs LSM tree, index, replication, quorum, sharding, CDC |
| 4 | Hệ thống phân tán | 10 | CAP/PACELC, Raft, 2PC vs Saga, idempotency, lock, observability |
| 5 | Bài toán kinh điển | 10 | URL shortener, rate limiter, KV, feed, chat, search, video, drive, payment, Uber |
| 6 | Cloud & Kiến trúc hiện đại | 8 | Microservices, K8s, service mesh, SRE, multi-region, cost, event-driven, deploy |
| 7 | Luyện phỏng vấn | 6 | Khung 45 phút, requirements, trade-off, deep dive, checklist |

## Cấu trúc

```
system-design-hub/
├── astro.config.mjs            # site + base cho GitHub Pages, MDX, markdown
├── package.json                # astro, @astrojs/mdx, @astrojs/markdown-satteri
├── scripts/
│   ├── check-stats.mjs         # đối chiếu số liệu trong src/data với nội dung thật
│   └── convert-content.mjs     # công cụ chuyển nội dung cũ sang MDX (một lần)
├── src/
│   ├── content.config.ts       # schema frontmatter — sai là build fail
│   ├── content/topics/
│   │   └── module-0..7/*.mdx   # 66 chủ đề, 1 file = 1 chủ đề
│   ├── data/
│   │   ├── modules.js          # metadata 8 module
│   │   ├── module-extras.js    # 115 từ khoá + 45 quiz
│   │   ├── stats.js            # con số dùng chung (build kiểm tra lại)
│   │   └── reference.js        # metadata ADR + bài tập
│   ├── layouts/
│   │   ├── BaseLayout.astro    # <head>, header, footer, theme
│   │   └── TopicLayout.astro   # hero + sidebar + lesson + TOC + pager
│   ├── components/             # Header, Footer, Sidebar, Icon, KeywordGrid, QuizSection…
│   ├── pages/
│   │   ├── index.astro
│   │   ├── modules/index.astro
│   │   ├── modules/[module]/index.astro
│   │   ├── modules/[module]/[slug].astro
│   │   ├── learning-path.astro
│   │   ├── curriculum.astro
│   │   ├── adr/index.astro
│   │   ├── adr/[id].astro
│   │   ├── exercises/index.astro
│   │   ├── exercises/[id].astro
│   │   └── search-index.json.js  # index tìm kiếm, sinh lúc build
│   ├── styles/app.css          # design system + components
│   ├── scripts/site.js         # theme, menu, quiz, copy, TOC, tiến độ, tìm kiếm
│   └── lib/                    # icons.js, content.js, wrap-tables.js
├── public/                     # tài nguyên tĩnh
│   ├── favicon.svg
│   └── learning-path.html      # redirect cho URL cũ
└── legacy/                     # site tĩnh cũ, giữ để tham chiếu/so sánh
```

ADR, bài tập và curriculum là **collection**, không nằm trong `public/`:
`src/content/adr/`, `src/content/exercises/`, `src/content/pages/curriculum.md`.
Nhờ vậy chúng render qua layout của site (header, mục lục, prev/next) thay vì
mở ra file Markdown thô.

## Cách chạy

```bash
cd system-design-hub
pnpm install
pnpm dev            # http://localhost:4321
```

Build và xem thử bản production:

```bash
pnpm build          # chạy check-stats trước, rồi astro build
pnpm preview
```

Nếu môi trường chặn registry qua proxy, bỏ biến proxy khi cài:

```bash
env -u http_proxy -u https_proxy -u all_proxy pnpm install
```

## Viết nội dung mới

Tạo file `src/content/topics/module-N/<slug>.mdx`:

```mdx
---
title: "Tên chủ đề"
description: "Một câu mô tả, dùng cho card và SEO."
module: 3
order: 4
num: "3.4"
sectionId: "replication"
---

<p>Nội dung, được phép dùng thẳng HTML của design system.</p>
```

Quy ước:

- `title`, `description`, `module`, `order`, `num`, `sectionId` là **bắt buộc**;
  thiếu `description` hoặc `module` ngoài 0–7 là build fail (có chủ đích).
- Thứ tự trong sidebar lấy từ `order`, không phải tên file.
- Từ khoá và quiz của module nằm trong `src/data/module-extras.js`, hiển thị ở
  chủ đề cuối của module.
- Muốn thêm module: thêm entry vào `src/data/modules.js`, tạo thư mục
  `src/content/topics/module-N/`, và cập nhật `SITE_STATS` (hoặc chạy
  `node scripts/check-stats.mjs --write`).

Đánh dấu trong nội dung:

- `<span class="kw">` khái niệm chính · `.kw-y` lưu ý · `.kw-g` nên làm · `.kw-r` cái bẫy
- `<div class="callout callout-tip|info|warn|danger|note">` cho hộp ghi chú
- `<div class="diagram"><svg role="img" aria-label="...">` cho diagram (bắt buộc có
  `role` và `aria-label`)
- `<div class="table-wrap">`, `<div class="codeblock">`, `<ul class="list-check">`

### Ba cạm bẫy của MDX

MDX coi nội dung là JSX, nên ba ký tự phải escape trong phần thân:

| Gặp phải | Triệu chứng | Cách viết |
|---|---|---|
| `{` `}` | `Could not parse expression with oxc` | `&#123;` / `&#125;` |
| Dòng trống trong `<pre>` | `Expected a closing tag for <code>` | dồn `<pre>` thành một dòng, xuống dòng bằng `&#10;` |
| `<` trong code | `Unexpected character after '<'` | `&lt;` (chỉ trong `<pre>`) |

`markdown.processor` đặt `smartPunctuation: false` để dấu `"` trong ví dụ code
không bị đổi thành `“ ”`.

## Kiểm tra

```bash
node scripts/check-stats.mjs   # số liệu trong src/data có khớp nội dung thật
pnpm build                     # chạy check-stats rồi build; fail nếu lệch
```

`check-stats.mjs` đếm lại 66 chủ đề, 51 diagram, 115 từ khoá, 45 quiz, 6 ADR,
8 bài tập từ file thật rồi so với `src/data/stats.js`. Đây là lý do trang chủ
không thể quảng cáo một con số mà nội dung không có.

## Deploy

GitHub Pages, base path `/system-design-hub/`. Workflow `.github/workflows/pages.yml`
chạy `pnpm build` rồi upload `dist/`. URL dạng thư mục
(`/modules/3/sharding/`), khớp với site tĩnh trước đây; URL cũ dạng
`/modules/0/index.html#network` được chuyển tự động sang trang chủ đề tương ứng.

## Nguồn nội dung

Trang `/references` liệt kê đầy đủ nguồn kèm link xem/tải; dữ liệu nằm ở
`src/data/references.js` (một chỗ duy nhất cho cả trang lẫn footer).

- *System Design Interview* — Alex Xu (Vol. 1 & 2) — PDF: `public/references/system-design-interview-alex-xu.pdf`
- *60 Days of System Design Questions* — Joud Awad — PDF: `public/references/60-days-of-system-design.pdf`
- *System Design 101* — ByteByteGo — https://github.com/ByteByteGoHq/system-design-101
- *The System Design Primer* — Donne Martin — https://github.com/donnemartin/system-design-primer
- *Designing Data-Intensive Applications* — Martin Kleppmann
- *Site Reliability Engineering* — Google
- Ghi chú và ADR có sẵn trong thư mục này

Hai file PDF có bản quyền (~43 MB) được copy vào `public/references/` để nút
"Xem PDF"/"Tải xuống" hoạt động trên GitHub Pages. Chúng nằm ngoài `.gitignore`
(`*.pdf` chỉ áp cho thư mục gốc), nên repo tăng đúng bằng dung lượng hai file này.

Các con số ước lượng (QPS, dung lượng, latency) giữ theo nguồn gốc để đối chiếu;
khi dùng cho hệ thống thật cần tính lại theo bối cảnh cụ thể.

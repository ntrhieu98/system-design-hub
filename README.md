# System Design Learning

Khoá học system design tiếng Việt, dạng web app tĩnh. Không cần build, không cần
cài đặt — mở `index.html` là dùng được.

## Nội dung

**8 module · 64 chủ đề · 49 diagram · 115 khái niệm · 45 câu hỏi**

| # | Module | Chủ đề | Trọng tâm |
|---|---|---|---|
| 0 | Kiến thức nền tảng | 8 | OSI/TCP-IP, DNS/TLS, process/thread, ACID, index, CAP |
| 1 | Nền tảng System Design | 7 | Khung 4 bước, NFR, back-of-envelope, latency vs throughput |
| 2 | Building Blocks | 8 | LB, cache, rate limiter, queue, CDN, search, unique ID |
| 3 | Dữ liệu & Lưu trữ | 8 | B+ vs LSM tree, index, replication, quorum, sharding, CDC |
| 4 | Hệ thống phân tán | 9 | CAP/PACELC, Raft, 2PC vs Saga, idempotency, lock, observability |
| 5 | Bài toán kinh điển | 10 | URL shortener, rate limiter, KV, feed, chat, search, video, drive, payment, Uber |
| 6 | Cloud & Kiến trúc hiện đại | 8 | Microservices, K8s, service mesh, SRE, multi-region, cost, event-driven, deploy |
| 7 | Luyện phỏng vấn | 6 | Khung 45 phút, requirements, trade-off, deep dive, checklist |

## Cấu trúc file

```
system-design-hub/
├── index.html                  # Trang chủ
├── learning-path.html          # Lộ trình 12 tuần
├── modules/
│   ├── index.html              # Danh sách + tìm kiếm/lọc
│   └── 0..7/index.html         # Vỏ mỗi module (nội dung do JS render)
├── adr/index.html              # 6 Architecture Decision Records
├── exercises/index.html        # Bài tập thiết kế
├── assets/
│   ├── css/app.css             # Design system + components
│   └── js/
│       ├── app.js              # Shell: header, footer, render, search, quiz, tiến độ
│       └── content/0..7.js     # Nội dung từng module
├── curriculum.md               # Giáo trình gốc (markdown)
├── notes/                      # Ghi chú
├── diagrams/                   # Sơ đồ draw.io
├── adr/0*.md                   # ADR gốc + bản dịch vi/
└── exercises/0*.md             # Đề bài gốc
```

## Cách chạy

Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy server tĩnh:

```bash
cd system-design-hub
python3 -m http.server 8899
# mở http://127.0.0.1:8899
```

Dùng server tĩnh sẽ tránh được giới hạn `file://` của một số trình duyệt.

## Tính năng

- **Tìm kiếm & lọc** module theo từ khoá kỹ thuật (kafka, raft, sharding, canary…)
  hoặc theo cấp độ.
- **Tiến độ** lưu trong `localStorage` (`sd:done`), không cần đăng nhập.
- **Sáng/tối** lưu trong `sd:theme`.
- **Quiz** có nút xem đáp án, đáp án giải thích chi tiết chứ không chỉ đúng/sai.
- **TOC sidebar** tự highlight mục đang đọc, có thanh tiến độ đọc ở đầu trang.
- **Responsive** từ 360px; bảng và code block cuộn ngang trong khung thay vì
  đẩy cả trang rộng ra.
- **Print** đã tối ưu: ẩn header/footer/TOC, tránh ngắt trang giữa diagram.

## Quy ước nội dung

Mỗi module là một file `assets/js/content/N.js` gán vào `window.SD_CONTENT[N]`:

```js
window.SD_CONTENT[N] = {
  title: 'Module N — Tên',
  lead: 'Đoạn mở đầu (cho phép HTML)',
  keywords: [ { term: '...', def: '...' } ],      // 10–16 mục
  sections: [ { id, num, title, html } ],         // 6–10 mục, mỗi mục ≥1 SVG
  quiz:     [ { q: '...', a: '...' } ]            // 4–6 câu
};
```

Quy ước đánh dấu trong nội dung:

- `<span class="kw">` khái niệm chính · `.kw-y` lưu ý · `.kw-g` nên làm · `.kw-r` cái bẫy
- `<div class="callout callout-tip|info|warn|danger|note">` cho hộp ghi chú
- `<div class="diagram"><svg role="img" aria-label="...">` cho diagram (bắt buộc có
  `role` và `aria-label`)
- `<div class="table-wrap">`, `<div class="codeblock">`, `<ul class="list-check">`

## Chạy kiểm tra

```bash
# Syntax từng file nội dung
for f in assets/js/content/*.js; do node --check "$f"; done

# Kiểm tra số lượng section/keyword/quiz/diagram
node -e '
  global.window = {};
  [0,1,2,3,4,5,6,7].forEach(i => require("./assets/js/content/" + i + ".js"));
  Object.entries(window.SD_CONTENT).forEach(([i, d]) => {
    console.log("M" + i,
      "kw=" + d.keywords.length,
      "sec=" + d.sections.length,
      "quiz=" + d.quiz.length,
      "svg=" + d.sections.filter(s => s.html.includes("<svg")).length);
  });
'
```

## Nguồn nội dung

Nội dung được biên soạn dựa trên:

- *System Design Interview* — Alex Xu (Vol. 1 & 2)
- *60 Days of System Design Questions* — Joud Awad
- *Designing Data-Intensive Applications* — Martin Kleppmann
- *Site Reliability Engineering* — Google
- Ghi chú và ADR có sẵn trong thư mục này

Các con số ước lượng (QPS, dung lượng, latency) được giữ theo nguồn gốc để có thể
đối chiếu; khi dùng cho hệ thống thật cần tính lại theo bối cảnh cụ thể.

## Ghi chú

- Không có build step, không dependency — chỉ HTML + CSS + JS thuần.
- Font tải từ Google Fonts (Plus Jakarta Sans, JetBrains Mono); nếu offline sẽ
  fallback về font hệ thống, layout vẫn giữ nguyên.
- Toàn bộ diagram là SVG inline, không có file ảnh — in ra vẫn nét, tìm kiếm
  trong trang vẫn thấy chữ trong hình.

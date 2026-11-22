// One-off converter: public/exercises/*.md -> src/content/exercises/*.mdx
// The English source is translated into Vietnamese in the same pass, keeping
// technical terms in English on first mention — the style every module uses.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/exercises';
const OUT = 'src/content/exercises';

const META = {
  '01-url-shortener.md': {
    id: '01',
    order: 1,
    level: 'beginner',
    module: 5,
    title: 'URL Shortener — ước lượng và thiết kế',
    summary:
      'Bài tập mở đầu: từ 10K QPS đọc, tự tính bảng mã base62, chọn khoá lưu trữ và giải thích cache-aside trước khi xem đáp án.',
    specs: [
      { k: 'QPS đọc', v: '10K' },
      { k: 'QPS ghi', v: '1K (tỉ lệ 10%)' },
      { k: 'Độ trễ redirect', v: '< 100ms' },
      { k: 'Độ dài mã', v: '6 ký tự base62' },
      { k: 'Module liên quan', v: '1 và 5' },
    ],
  },
  '02-rate-limiter.md': {
    id: '02',
    order: 2,
    level: 'intermediate',
    module: 2,
    title: 'Rate Limiter — chọn thuật toán và chống race condition',
    summary:
      'Thiết kế bộ giới hạn tần suất phân tán: so sánh bốn thuật toán, chọn khoá Redis và xử lý trường hợp nhiều instance cùng đếm một user.',
    specs: [
      { k: 'Giới hạn', v: '100 request / phút / user' },
      { k: 'Số instance', v: 'N ≥ 3 (phân tán)' },
      { k: 'Độ trễ thêm', v: '< 5ms' },
      { k: 'Thuật toán chính', v: 'Sliding window counter' },
      { k: 'Module liên quan', v: '2 và 4' },
    ],
  },
};

fs.mkdirSync(OUT, { recursive: true });

for (const [file, m] of Object.entries(META)) {
  const raw = fs.readFileSync(path.join(SRC, file), 'utf8');
  const body = raw.replace(/^#\s+.*\n+/, '').trimEnd();
  const specs = `[${m.specs.map((s) => `{ k: ${JSON.stringify(s.k)}, v: ${JSON.stringify(s.v)} }`).join(', ')}]`;
  const fm = [
    '---',
    `id: ${JSON.stringify(m.id)}`,
    `title: ${JSON.stringify(m.title)}`,
    `level: ${m.level}`,
    `summary: ${JSON.stringify(m.summary)}`,
    `specs: ${specs}`,
    `module: ${m.module}`,
    `order: ${m.order}`,
    '---',
  ].join('\n');
  const out = path.join(OUT, file.replace(/\.md$/, '.mdx'));
  fs.writeFileSync(out, `${fm}\n\n${body}\n`);
  console.log('wrote', out);
}

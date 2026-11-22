// One-off converter: public/adr/vi/*.md -> src/content/adr/*.mdx
// The Vietnamese source becomes body text under a frontmatter block. The H1 is
// dropped because the page hero renders the title itself.
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/adr/vi';
const OUT = 'src/content/adr';

const META = [
  { file: '001-url-shortener-design.md', id: '001', order: 1, status: 'proposed', date: '2025-01-01',
    title: 'Thiết kế URL Shortener (TinyURL/Pastebin)', module: 5, tags: ['api', 'hash', 'caching', 'sharding'],
    summary: 'Vì sao chọn REST + hash base62 thay vì UUID, và cách chống collision khi hai URL dài cho ra cùng một mã ngắn.' },
  { file: '002-rate-limiter-design.md', id: '002', order: 2, status: 'proposed', date: '2025-01-01',
    title: 'Thiết kế Rate Limiter', module: 2, tags: ['rate-limiting', 'redis', 'token-bucket'],
    summary: 'So sánh token bucket, leaky bucket và sliding window; chọn Redis + Lua để giữ tính nguyên tử khi nhiều instance cùng đếm.' },
  { file: '003-cache-aside-pattern.md', id: '003', order: 3, status: 'accepted', date: '2025-01-01',
    title: 'Cache-aside và ba lỗi cache kinh điển', module: 2, tags: ['caching', 'redis', 'consistency'],
    summary: 'Vì sao cache-aside là mặc định, và ba lỗi phải xử lý trước khi lên production: stampede, penetration, avalanche.' },
  { file: '004-message-queue-design.md', id: '004', order: 4, status: 'proposed', date: '2025-01-01',
    title: 'Chọn message queue hay event log', module: 2, tags: ['kafka', 'queue', 'idempotency'],
    summary: 'Hai mô hình khác nhau về bản chất: queue xoá message khi đã xử lý, log giữ lại và cho phép đọc lại — chọn sai thì sửa rất đắt.' },
  { file: '005-database-scaling-design.md', id: '005', order: 5, status: 'proposed', date: '2025-01-01',
    title: 'Nhân bản trước, sharding sau', module: 3, tags: ['replication', 'sharding', 'hotspot'],
    summary: 'Thứ tự mở rộng database: đọc trước ghi, replication trước sharding — và vì sao chọn khoá shard lại quan trọng hơn chọn database.' },
  { file: '006-microservices-architecture.md', id: '006', order: 6, status: 'proposed', date: '2025-01-01',
    title: 'Tách microservices: khi nào nên và khi nào không', module: 6, tags: ['microservices', 'saga', 'monolith'],
    summary: 'Microservices giải quyết vấn đề tổ chức nhiều hơn là vấn đề kỹ thuật; tách sai thì cái giá là transaction phân tán và vận hành phức tạp.' },
];

const yamlStr = (s) => JSON.stringify(s);

fs.mkdirSync(OUT, { recursive: true });

for (const m of META) {
  const raw = fs.readFileSync(path.join(SRC, m.file), 'utf8');
  // Drop the leading H1: the page hero owns the title.
  const body = raw.replace(/^#\s+.*\n+/, '').trimEnd();
  const tags = `[${m.tags.map(yamlStr).join(', ')}]`;
  const fm = [
    '---',
    `id: ${yamlStr(m.id)}`,
    `title: ${yamlStr(m.title)}`,
    `status: ${m.status}`,
    `date: ${yamlStr(m.date)}`,
    `summary: ${yamlStr(m.summary)}`,
    `tags: ${tags}`,
    `module: ${m.module}`,
    `order: ${m.order}`,
    '---',
  ].join('\n');
  const outPath = path.join(OUT, `${m.id}-${path.basename(m.file, '.md').replace(/^\d+-/, '')}.mdx`);
  fs.writeFileSync(outPath, `${fm}\n\n${body}\n`);
  console.log('wrote', outPath);
}

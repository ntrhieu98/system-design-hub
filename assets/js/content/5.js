/* ============================================================
   Module 5 — Classic Design Problems
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[5] = {
  title: 'Module 5 — Bài toán kinh điển',
  lead: 'Mười bài toán này chiếm phần lớn đề thi system design. Chúng không khó vì thuật toán — chúng khó vì phải chọn đúng <span class="kw">điểm cân bằng</span> giữa nhất quán, độ trễ và chi phí, rồi bảo vệ lựa chọn đó bằng số liệu. Với mỗi bài, hãy học theo khung: <span class="kw-y">yêu cầu → ước lượng → API → dữ liệu → luồng → điểm nghẽn → mở rộng</span>.',

  keywords: [
    { term: 'Snowflake ID', def: '64 bit = 1 bit sign + 41 bit timestamp (ms, đủ 69 năm) + 10 bit machine (1024 node) + 12 bit sequence (4096 id/ms/node). Sinh 4,1 triệu ID/s/node, sắp theo thời gian, không cần coordination.' },
    { term: 'Base62 encoding', def: 'Bảng chữ [0-9a-zA-Z] = 62 ký tự. 7 ký tự cho 62⁷ ≈ 3,52×10¹² tổ hợp. Dùng để rút gọn ID số thành short code; giải mã ngược được nếu biết thuật toán.' },
    { term: 'Consistent hashing', def: 'Vòng hash 0…2³²; node và key cùng ánh xạ lên vòng; key thuộc node gần nhất theo chiều kim đồng hồ. Thêm node chỉ di chuyển ~1/N key. Virtual node (150–200/node) để phân bố đều.' },
    { term: 'Token bucket', def: 'Xô chứa token, nạp đều theo rate (ví dụ 100/s), capacity cho phép burst. Mỗi request lấy 1 token, không đủ thì 429. Cho phép burst có kiểm soát — khác fixed window.' },
    { term: 'Sliding window counter', def: 'Xấp xỉ: đếm của window trước × (phần còn lại) + đếm window hiện tại. Sai số &lt; 0,003% (Cloudflare, 400M request), rẻ hơn sliding window log (O(1) thay vì O(requests)).' },
    { term: 'Fan-out on write', def: 'Khi đăng bài, đẩy vào feed của mọi follower ngay. Đọc nhanh (1 query), ghi đắt. Với celebrity 50M follower → 50M write cho 1 post, phải xử lý riêng.' },
    { term: 'Fan-out on read', def: 'Khi mở feed, gom post của những người mình follow. Ghi rẻ, đọc đắt (N query). Kết hợp hybrid: user thường fan-out on write, celebrity fan-out on read.' },
    { term: 'Push vs Pull (chat)', def: 'Push: sender đẩy tới receiver qua WebSocket nếu online. Pull: receiver sync khi mở app/có kết nối. Cần cả hai cho reliability — push cho realtime, pull cho offline.' },
    { term: 'Presence service', def: 'Theo dõi ai đang online. Heartbeat mỗi 5–30s vào KV/TTL store; không có heartbeat → offline. Cần pub/sub để fan-out trạng thái tới bạn bè.' },
    { term: 'Trie / prefix index', def: 'Cây theo ký tự. Node lưu top-K kết quả phổ biến nhất của prefix đó. Tra prefix O(len) thay vì scan toàn bộ; cần cập nhật định kỳ từ query log.' },
    { term: 'Segment / DAG (video)', def: 'Video được cắt thành segment 2–10s, encode nhiều bitrate (HLS/DASH), manifest mô tả. Client chọn bitrate theo băng thông. Cho phép CDN cache từng segment, adaptive streaming.' },
    { term: 'Chunking & dedup (drive)', def: 'File chia block 4MB, hash mỗi block, block trùng chỉ lưu 1 lần. Upload lại file đã có gần như tức thời. Đây là nền tảng của Google Drive/Dropbox.' },
    { term: 'Idempotency key', def: 'Bắt buộc cho mọi API ghi tiền. Client sinh một lần cho mỗi ý định; server lưu key + response, gặp lại thì trả response cũ.' },
    { term: 'Double-entry ledger', def: 'Mỗi giao dịch ghi 2 bút toán (nợ/có), tổng luôn = 0. Không bao giờ UPDATE số dư trực tiếp; số dư = tổng các bút toán. Cho phép đối soát và phát hiện sai lệch.' },
    { term: 'Write-ahead log (WAL)', def: 'Ghi ý định thay đổi tuần tự trước khi áp dụng. Phục hồi sau crash bằng replay. Nền tảng của mọi DB bền vững và của CDC.' },
    { term: 'Cursor pagination', def: 'Phân trang bằng con trỏ (id/timestamp của item cuối) thay vì OFFSET. OFFSET 1.000.000 phải scan 1 triệu dòng; cursor chỉ cần WHERE id &lt; last_id LIMIT 20.' }
  ],

  sections: [
    {
      id: 'url-shortener', num: '5.1', title: 'URL Shortener — bài toán khởi động hoàn hảo',
      html: `
        <p>Đây là bài đầu tiên trong hầu hết mọi khoá system design vì nó nhỏ nhưng chứa đủ mọi thành phần: ước lượng, sinh ID, lưu trữ, cache, đọc nhiều hơn ghi. Đừng xem nhẹ — người phỏng vấn dùng nó để kiểm tra bạn có <span class="kw">tư duy số liệu</span> hay không.</p>

        <h3>Yêu cầu & ước lượng</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Thông số</th><th>Giá trị</th><th>Cách tính</th></tr></thead>
            <tbody>
              <tr><td>Ghi</td><td>100 triệu URL/ngày</td><td>Đề bài cho</td></tr>
              <tr><td>QPS ghi</td><td>~1.160/s</td><td>100M / 86.400 ≈ 1.157</td></tr>
              <tr><td>Tỉ lệ đọc/ghi</td><td>10:1</td><td>Đề bài cho</td></tr>
              <tr><td>QPS đọc</td><td>~11.600/s</td><td>1.157 × 10</td></tr>
              <tr><td>Dung lượng 10 năm</td><td>~36,5 TB</td><td>100M × 365 × 10 × 100 byte ≈ 36,5 TB</td></tr>
              <tr><td>Số tổ hợp 7 ký tự</td><td>3,52×10¹²</td><td>62⁷ — đủ cho ~96 năm ở mức 100M/ngày</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Chọn độ dài short code</div>
            <p>62⁶ ≈ 5,68×10¹⁰ → hết sau <strong>568 ngày</strong> ở 100M/ngày. 62⁷ ≈ 3,52×10¹² → ~96 năm. 62⁸ ≈ 2,18×10¹⁴ → ~5.900 năm. Chọn <strong>7 ký tự</strong>: vừa đủ dài, URL không quá xấu, có dư địa. Đây là kiểu tính toán mà người phỏng vấn muốn nghe — không phải "chọn 7 vì nó đẹp".</p>
          </div>
        </div>

        <h3>Ba cách sinh short code</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách</th><th>Cơ chế</th><th>Ưu</th><th>Nhược</th></tr></thead>
            <tbody>
              <tr><td><strong>Hash + base62</strong></td><td>MD5/SHA256(longURL) → lấy 7 byte → base62</td><td>Không cần coordination, cùng URL → cùng code</td><td><span class="kw-r">Va chạm</span>: 2 URL khác nhau ra cùng code; phải kiểm tra DB và thử salt</td></tr>
              <tr><td><strong>Snowflake ID</strong></td><td>ID 64 bit tăng dần → base62</td><td>Không va chạm, không coordination, sort theo thời gian</td><td>Code dài dần theo thời gian (7→8 ký tự); lộ thông tin thời điểm tạo</td></tr>
              <tr><td><strong>Counter (KGS)</strong></td><td>Key Generation Service cấp dải ID trước, mỗi app server giữ 1.000 ID trong RAM</td><td>Đơn giản, không va chạm, không coordination mỗi request</td><td>Phải xử lý khi server chết (mất dải ID — chỉ lãng phí, không sai)</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 380" role="img" aria-label="Luồng ghi và đọc của URL shortener với key generation service cache Redis và database">
            <defs>
              <marker id="m5a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#8b95a3">WRITE PATH — 1.160 QPS</text>

            <rect x="16" y="36" width="110" height="52" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="71" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Client</text>
            <text x="71" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">POST /urls</text>

            <rect x="152" y="36" width="120" height="52" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="212" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">API Server</text>
            <text x="212" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">validate URL</text>

            <rect x="298" y="36" width="140" height="52" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="368" y="54" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">KGS</text>
            <text x="368" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">cấp dải 1.000 ID</text>
            <text x="368" y="82" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">base62 → 7 ký tự</text>

            <rect x="464" y="36" width="130" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="529" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Postgres</text>
            <text x="529" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">code → long_url</text>

            <rect x="620" y="36" width="126" height="52" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="683" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Redis</text>
            <text x="683" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">cache hot URLs</text>

            <path d="M126,62 L150,62" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>
            <path d="M272,62 L296,62" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>
            <path d="M438,62 L462,62" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>
            <path d="M594,62 L618,62" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>

            <text x="16" y="126" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#8b95a3">READ PATH — 11.600 QPS, 301 redirect</text>

            <rect x="16" y="140" width="110" height="52" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="71" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Browser</text>
            <text x="71" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">GET /aB3xK9z</text>

            <rect x="152" y="140" width="120" height="52" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="212" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">API / CDN</text>
            <text x="212" y="178" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">cache 301</text>

            <rect x="298" y="140" width="140" height="52" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="368" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Redis hit 90%</text>
            <text x="368" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">&lt; 1ms</text>

            <rect x="464" y="140" width="130" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="529" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">DB fallback</text>
            <text x="529" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">1.160 QPS</text>

            <rect x="620" y="140" width="126" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="683" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Đọc replica</text>
            <text x="683" y="178" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">3 replica</text>

            <path d="M126,166 L150,166" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>
            <path d="M272,166 L296,166" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>
            <path d="M438,166 L462,166" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>
            <path d="M594,166 L618,166" stroke="#505a68" stroke-width="2" marker-end="url(#m5a)"/>

            <rect x="16" y="216" width="352" height="150" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">301 vs 302 — quyết định quan trọng</text>
            <text x="34" y="262" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>301 Permanent:</strong> browser cache, giảm tải</text>
            <text x="34" y="278" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">server, nhưng KHÔNG đổi được đích và</text>
            <text x="34" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">không đếm được click.</text>
            <text x="34" y="318" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>302 Temporary:</strong> mọi click về server →</text>
            <text x="34" y="334" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">đếm được analytics, đổi đích được.</text>
            <text x="34" y="356" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">Chọn 302 nếu cần analytics (bit.ly dùng 302).</text>

            <rect x="384" y="216" width="362" height="150" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="402" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Bảng dữ liệu tối giản</text>
            <text x="402" y="262" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">urls (</text>
            <text x="402" y="278" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">  code    CHAR(7) PRIMARY KEY,</text>
            <text x="402" y="294" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">  long_url TEXT NOT NULL,</text>
            <text x="402" y="310" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">  user_id BIGINT, created_at TIMESTAMPTZ</text>
            <text x="402" y="326" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">)</text>
            <text x="402" y="348" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Shard theo code (hash) — đọc/ghi đều point lookup.</text>
          </svg>
          <div class="diagram-cap">Hình 5.1 — URL shortener: 90% request đọc được phục vụ bởi cache, DB chỉ chịu 10%</div>
        </div>

        <h3>Chi tiết ghi điểm</h3>
        <ul class="list-check">
          <li><strong>Custom alias:</strong> user muốn <code>/my-brand</code>. Cần check trùng atomically — dùng <code>INSERT ... ON CONFLICT DO NOTHING</code> với unique index trên <code>code</code>.</li>
          <li><strong>Expiration:</strong> cột <code>expires_at</code> + job xoá định kỳ, hoặc kiểm tra lazy khi đọc. Đừng xoá đồng bộ trong request đọc (chậm).</li>
          <li><strong>Analytics:</strong> ghi click vào Kafka (không ghi đồng bộ vào DB), aggregate bằng batch job. Một redirect 10ms không thể chờ ghi 1 dòng analytics.</li>
          <li><strong>Chống abuse:</strong> rate limit theo user/IP (Module 2), blocklist domain malware, và giới hạn số URL/giờ cho tài khoản free.</li>
          <li><strong>Hot URL:</strong> một link viral nhận 1 triệu request/phút → cache nhiều tầng (CDN → Redis → DB), và nếu là <code>301</code> thì browser tự cache, gần như bằng 0 tải.</li>
        </ul>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Hash + base62 — tại sao lại nguy hiểm</div>
            <p>Với 100M URL/ngày trong 10 năm = 365 tỷ URL. Không gian mã 7 ký tự = 3,52×10¹². Xác suất va chạm theo <em>birthday paradox</em>: khi bạn có <code>n</code> item trong <code>d</code> ô, kỳ vọng số va chạm ≈ n²/(2d) = (3,65×10¹¹)²/(2×3,52×10¹²) ≈ <strong>1,9×10¹⁰ va chạm</strong>. Con số này khổng lồ vì bạn dùng gần hết không gian mã. Vì vậy nếu dùng hash, phải <strong>kiểm tra DB mỗi lần</strong> và retry với salt — nghĩa là mỗi lần ghi cần 1 read + có thể nhiều lần thử. Counter/Snowflake tránh hoàn toàn vấn đề này. Đây là câu trả lời đầy đủ cho "vì sao không dùng MD5".</p>
          </div>
        </div>
      `
    },

    {
      id: 'rate-limiter', num: '5.2', title: 'Rate Limiter — thiết kế chi tiết với Redis',
      html: `
        <p>Rate limiter xuất hiện ở mọi hệ thống thật nhưng bị làm sai rất thường xuyên. Câu hỏi trung tâm: <span class="kw">làm sao để đếm chính xác khi có nhiều server, và làm sao để không tự tạo ra bottleneck?</span></p>

        <h3>Năm thuật toán — chọn theo yêu cầu</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Thuật toán</th><th>Bộ nhớ</th><th>Cho burst?</th><th>Sai số</th><th>Dùng khi</th></tr></thead>
            <tbody>
              <tr><td><strong>Token bucket</strong></td><td>O(1)/user</td><td>Có (tới capacity)</td><td>Không</td><td>Cần cho phép burst ngắn — mặc định tốt nhất</td></tr>
              <tr><td><strong>Leaky bucket</strong></td><td>O(1)/user hoặc O(queue)</td><td>Không — làm phẳng</td><td>Không</td><td>Cần đầu ra đều tuyệt đối (mạng, API bên thứ ba)</td></tr>
              <tr><td><strong>Fixed window</strong></td><td>O(1)/user</td><td>Có (gấp đôi ở biên)</td><td>Lớn ở biên</td><td>Đơn giản, chấp nhận được cho quota hiển thị</td></tr>
              <tr><td><strong>Sliding window log</strong></td><td>O(requests)</td><td>Không</td><td>Không</td><td>Cần chính xác tuyệt đối, volume thấp</td></tr>
              <tr><td><strong>Sliding window counter</strong></td><td>O(1)/user</td><td>Gần đúng</td><td>&lt; 0,003%</td><td>Cân bằng tốt nhất — Cloudflare dùng</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Fixed window: lỗi 2× ở biên</div>
            <p>Limit 100 request/phút theo fixed window. User gửi 100 request lúc <code>12:00:59</code> và 100 request lúc <code>12:01:00</code> → trong khoảng 1 giây user gửi <strong>200 request</strong> mà không vi phạm gì. Nếu mục đích của limiter là bảo vệ DB, bạn đã thất bại. Sliding window counter giải quyết bằng nội suy: <code>count = prev_window × (1 - elapsed/window) + current_window</code>.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 320" role="img" aria-label="So sánh fixed window bị lỗi gấp đôi ở biên với sliding window counter nội suy">
            <defs>
              <marker id="m5b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#ef4444">✗ FIXED WINDOW — lỗi 2× ở biên</text>

            <rect x="16" y="36" width="240" height="60" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="136" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">window 12:00:00–12:00:59</text>
            <text x="136" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">100 request (limit)</text>
            <text x="136" y="90" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">tất cả dồn vào giây 59</text>

            <rect x="264" y="36" width="240" height="60" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="384" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">window 12:01:00–12:01:59</text>
            <text x="384" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">100 request (limit)</text>
            <text x="384" y="90" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">tất cả dồn vào giây 00</text>

            <rect x="512" y="36" width="234" height="60" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="629" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">200 request / 2 giây</text>
            <text x="629" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">= 2× limit thật trong 1s</text>
            <text x="629" y="90" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">limiter "không thấy" vi phạm</text>

            <path d="M256,66 L262,66" stroke="#505a68" stroke-width="2" marker-end="url(#m5b)"/>
            <path d="M504,66 L510,66" stroke="#505a68" stroke-width="2" marker-end="url(#m5b)"/>

            <text x="16" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#10b981">✓ SLIDING WINDOW COUNTER — nội suy</text>

            <rect x="16" y="148" width="728" height="90" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="172" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">estimated = prev_count × (1 − elapsed/window) + curr_count</text>
            <text x="34" y="194" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Tại 12:01:00 (elapsed = 0):  estimated = 100 × 1 + 0 = 100  → chỉ cho 0 request nữa</text>
            <text x="34" y="212" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Tại 12:01:30 (elapsed = 30): estimated = 100 × 0,5 + 0 = 50  → cho thêm 50</text>
            <text x="34" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Tại 12:01:59 (elapsed = 59): estimated = 100 × 0,02 + 0 = 2 → cho thêm 98</text>

            <rect x="16" y="252" width="352" height="56" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Chi phí: 2 số/user (không phải log)</text>
            <text x="34" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">1 triệu user = 16 MB Redis. Không cần TTL dài.</text>

            <rect x="384" y="252" width="360" height="56" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="402" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Sai số: giả định phân bố đều</text>
            <text x="402" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Cloudflare đo 400M request: sai số 0,003%.</text>
          </svg>
          <div class="diagram-cap">Hình 5.2 — Fixed window có lỗ hổng kinh điển; sliding counter vá nó với chi phí O(1)</div>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">LUA</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Sliding window counter, atomic trong Redis</span>
<span class="c-com">-- KEYS[1] = rl:{user_id}   ; 2 field: curr_window, prev_window</span>
<span class="c-com">-- ARGV = limit, window_seconds, now_ms</span>

<span class="c-key">local</span> limit   = tonumber(ARGV[<span class="c-num">1</span>])
<span class="c-key">local</span> window  = tonumber(ARGV[<span class="c-num">2</span>]) * <span class="c-num">1000</span>
<span class="c-key">local</span> now_ms  = tonumber(ARGV[<span class="c-num">3</span>])

<span class="c-key">local</span> curr_key = math.floor(now_ms / window)
<span class="c-key">local</span> elapsed  = (now_ms % window) / window

<span class="c-key">local</span> data = redis.call(<span class="c-str">'HMGET'</span>, KEYS[<span class="c-num">1</span>], <span class="c-str">'w'</span>, <span class="c-str">'c'</span>, <span class="c-str">'p'</span>)
<span class="c-key">local</span> saved_w = tonumber(data[<span class="c-num">1</span>]) <span class="c-key">or</span> <span class="c-num">0</span>
<span class="c-key">local</span> curr    = tonumber(data[<span class="c-num">2</span>]) <span class="c-key">or</span> <span class="c-num">0</span>
<span class="c-key">local</span> prev    = tonumber(data[<span class="c-num">3</span>]) <span class="c-key">or</span> <span class="c-num">0</span>

<span class="c-com">-- sang window mới: dịch curr → prev</span>
<span class="c-key">if</span> saved_w ~= curr_key <span class="c-key">then</span>
  <span class="c-key">if</span> saved_w == curr_key - <span class="c-num">1</span> <span class="c-key">then</span> prev = curr <span class="c-key">else</span> prev = <span class="c-num">0</span> <span class="c-key">end</span>
  curr = <span class="c-num">0</span>
<span class="c-key">end</span>

<span class="c-key">local</span> estimated = prev * (<span class="c-num">1</span> - elapsed) + curr
<span class="c-key">if</span> estimated &gt;= limit <span class="c-key">then</span>
  <span class="c-key">return</span> {<span class="c-num">0</span>, math.floor(limit - estimated)}   <span class="c-com">-- bị chặn</span>
<span class="c-key">end</span>

curr = curr + <span class="c-num">1</span>
redis.call(<span class="c-str">'HMSET'</span>, KEYS[<span class="c-num">1</span>], <span class="c-str">'w'</span>, curr_key, <span class="c-str">'c'</span>, curr, <span class="c-str">'p'</span>, prev)
redis.call(<span class="c-str">'PEXPIRE'</span>, KEYS[<span class="c-num">1</span>], window * <span class="c-num">2</span>)
<span class="c-key">return</span> {<span class="c-num">1</span>, math.floor(limit - estimated - <span class="c-num">1</span>)}</code></pre>
        </div>

        <h3>Rate limit ở đâu trong kiến trúc</h3>
        <ul class="list-bullet">
          <li><strong>Ở edge/CDN:</strong> chặn DDoS theo IP, rẻ nhất, không chạm hệ thống. Nhưng không biết user_id nên không limit theo tài khoản.</li>
          <li><strong>Ở API gateway:</strong> nơi tốt nhất — đã có auth, biết user_id, tập trung một chỗ, dễ thay đổi rule. Đây là lựa chọn mặc định.</li>
          <li><strong>Ở từng service:</strong> chỉ khi service có tài nguyên riêng cần bảo vệ (ví dụ endpoint tìm kiếm đắt). Tránh nhân bản logic khắp nơi.</li>
          <li><strong>Client-side:</strong> chỉ để hiển thị "còn X request", không bao giờ để bảo vệ — client có thể bị sửa.</li>
        </ul>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Khi Redis chết thì sao?</div>
            <p>Đây là câu hỏi phân biệt người đã vận hành thật. Ba lựa chọn: <strong>(1) Fail-open</strong> — cho qua hết, ưu tiên availability. Rủi ro: bị abuse trong lúc Redis down. <strong>(2) Fail-closed</strong> — chặn hết, ưu tiên bảo vệ. Rủi ro: tự mình gây sự cố toàn hệ thống vì một Redis chết. <strong>(3) Fallback local</strong> — mỗi instance chuyển sang token bucket in-memory với limit = global_limit / số_instance. Đây là lựa chọn tốt nhất: vẫn bảo vệ được (dù lỏng hơn) mà không sập. Trong phỏng vấn, nên nêu: "Với endpoint thanh toán tôi fail-closed; với endpoint đọc tôi fail-open kèm alert."</p>
          </div>
        </div>
      `
    },

    {
      id: 'kv-store', num: '5.3', title: 'Key-Value Store — bài toán của consistent hashing',
      html: `
        <p>Đây là bài toán nơi <span class="kw">consistent hashing</span> thực sự toả sáng. Mục tiêu: lưu một cặp key→value với N node, thêm/bớt node mà không xáo toàn bộ dữ liệu, và vẫn đảm bảo được tính nhất quán khi có node chết.</p>

        <h3>Vấn đề với <code>hash % N</code></h3>
        <p>Với N=4 và 1 triệu key, mỗi node giữ 250.000 key. Tăng N lên 5: <code>hash(key) % 5</code> khác <code>% 4</code> với <strong>~80% key</strong>. Nghĩa là 800.000 key phải di chuyển — mất hàng giờ, và trong lúc di chuyển cache hit ratio sụp về 0, DB bị đánh sập. Đây là lý do consistent hashing ra đời.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="Vòng consistent hashing với các node và virtual node, chỉ phần cung giữa hai node bị di chuyển khi thêm node">
            <defs>
              <marker id="m5c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <circle cx="250" cy="200" r="150" fill="none" stroke="#e7ebf1" stroke-width="10"/>
            <circle cx="250" cy="200" r="150" fill="none" stroke="#5294ff" stroke-width="3" stroke-dasharray="4 6"/>

            <text x="250" y="30" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#8b95a3">0 / 2³²</text>
            <text x="250" y="378" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#8b95a3">2³¹</text>
            <text x="86" y="204" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#8b95a3">2³⁰</text>
            <text x="414" y="204" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#8b95a3">3·2³⁰</text>

            <circle cx="250" cy="50" r="21" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="250" y="56" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">A</text>

            <circle cx="394" cy="146" r="21" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="394" y="152" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">B</text>

            <circle cx="340" cy="310" r="21" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="340" y="316" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">C</text>

            <circle cx="160" cy="310" r="21" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="160" y="316" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">D</text>

            <circle cx="106" cy="146" r="21" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="106" y="152" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">E</text>

            <circle cx="500" cy="250" r="19" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="500" y="256" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#ef4444">F</text>
            <text x="500" y="290" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">node mới</text>

            <circle cx="424" cy="212" r="7" fill="#151515"/>
            <text x="440" y="216" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">k1</text>
            <circle cx="330" cy="76" r="7" fill="#151515"/>
            <text x="346" y="80" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">k2</text>
            <circle cx="196" cy="146" r="7" fill="#151515"/>
            <text x="176" y="140" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">k3</text>

            <path d="M424,212 C460,220 480,232 492,242" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#m5c)"/>
            <text x="466" y="200" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">k1 chuyển sang F</text>

            <path d="M340,289 C400,280 460,268 486,258" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 3"/>

            <rect x="536" y="34" width="212" height="332" rx="10" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="552" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Vì sao chỉ 1/N di chuyển</text>
            <text x="552" y="80" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Thêm F vào vòng: chỉ những key</text>
            <text x="552" y="96" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">nằm giữa E và F (theo chiều kim</text>
            <text x="552" y="112" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">đồng hồ) đổi chủ.</text>
            <text x="552" y="136" font-family="JetBrains Mono, monospace" font-size="9" fill="#10b981">hash % N   → di chuyển ~80%</text>
            <text x="552" y="154" font-family="JetBrains Mono, monospace" font-size="9" fill="#10b981">consistent → di chuyển ~1/N</text>

            <text x="552" y="182" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Vấn đề: phân bố không đều</text>
            <text x="552" y="202" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">5 node trên vòng có thể chia</text>
            <text x="552" y="218" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">thành các cung rất khác nhau →</text>
            <text x="552" y="234" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">một node chịu 40% tải.</text>

            <text x="552" y="262" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Giải: virtual node</text>
            <text x="552" y="282" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Mỗi node vật lý có 150–200 điểm</text>
            <text x="552" y="298" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">ảo: hash("A#1"), hash("A#2")…</text>
            <text x="552" y="314" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Cung nhỏ lại, phân bố gần đều</text>
            <text x="552" y="330" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">(sai lệch &lt; 5% với 200 vnode).</text>
            <text x="552" y="352" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Còn giúp node mạnh nhận nhiều hơn.</text>
          </svg>
          <div class="diagram-cap">Hình 5.3 — Consistent hashing: thêm node chỉ ảnh hưởng một cung, virtual node làm đều phân bố</div>
        </div>

        <h3>Kiến trúc KV store hoàn chỉnh</h3>
        <ul class="list-bullet">
          <li><strong>Client library:</strong> biết vòng hash, tính node đích trực tiếp — không qua proxy (giảm 1 hop, giảm SPOF). Nhưng phải xử lý khi vòng thay đổi.</li>
          <li><strong>Coordinator node:</strong> nhận request, xác định replica set (thường N=3 node liền kề trên vòng), gửi write tới W node, đọc từ R node.</li>
          <li><strong>Vector clock:</strong> mỗi value kèm vector để phát hiện xung đột giữa các replica. Khi đọc thấy 2 version không so sánh được → trả cả hai cho client merge (hoặc dùng CRDT).</li>
          <li><strong>Hinted handoff:</strong> node đích down → coordinator ghi tạm vào node khác kèm "hint", gửi lại khi node kia sống.</li>
          <li><strong>Merkle tree anti-entropy:</strong> so sánh cây hash giữa các replica để tìm khác biệt mà không cần so từng key.</li>
        </ul>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">PYTHON</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-key">import</span> bisect, hashlib

<span class="c-key">class</span> ConsistentHashRing:
    <span class="c-key">def</span> __init__(self, nodes, vnodes=<span class="c-num">200</span>):
        self.ring, self.sorted_keys, self.owner = [], [], {}
        <span class="c-key">for</span> node <span class="c-key">in</span> nodes:
            self.add_node(node, vnodes)

    <span class="c-key">def</span> _hash(self, s):
        <span class="c-key">return</span> int(hashlib.md5(s.encode()).hexdigest()[:<span class="c-num">8</span>], <span class="c-num">16</span>)

    <span class="c-key">def</span> add_node(self, node, vnodes):
        <span class="c-key">for</span> i <span class="c-key">in</span> range(vnodes):
            h = self._hash(f<span class="c-str">"{node}#{i}"</span>)
            self.ring.append(h)
            self.owner[h] = node
        self.sorted_keys = sorted(self.ring)

    <span class="c-key">def</span> get_node(self, key):
        <span class="c-com"># node đầu tiên theo chiều kim đồng hồ, wraparound về 0</span>
        h = self._hash(key)
        idx = bisect.bisect_right(self.sorted_keys, h)
        <span class="c-key">if</span> idx == len(self.sorted_keys):
            idx = <span class="c-num">0</span>
        <span class="c-key">return</span> self.owner[self.sorted_keys[idx]]

    <span class="c-key">def</span> get_replicas(self, key, n=<span class="c-num">3</span>):
        h = self._hash(key)
        idx = bisect.bisect_right(self.sorted_keys, h) % len(self.sorted_keys)
        seen, out = set(), []
        <span class="c-key">for</span> i <span class="c-key">in</span> range(len(self.sorted_keys)):
            node = self.owner[self.sorted_keys[(idx + i) % len(self.sorted_keys)]]
            <span class="c-key">if</span> node <span class="c-key">not in</span> seen:
                seen.add(node); out.append(node)
                <span class="c-key">if</span> len(out) == n:
                    <span class="c-key">break</span>
        <span class="c-key">return</span> out</code></pre>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Bốn câu phải nói về KV store</div>
            <p><strong>1.</strong> "Consistent hashing với 200 virtual node mỗi node vật lý, N=3 replica." <strong>2.</strong> "W=2, R=2 để R+W &gt; N — strong-ish consistency; nếu read-heavy thì R=1 và chấp nhận cũ." <strong>3.</strong> "Vector clock phát hiện xung đột, client merge hoặc dùng CRDT cho counter/set." <strong>4.</strong> "Hinted handoff + Merkle tree repair để hội tụ sau khi node chết." Bốn câu này là toàn bộ bài thi.</p>
          </div>
        </div>
      `
    },

    {
      id: 'news-feed', num: '5.4', title: 'News Feed — fan-out và nghịch lý celebrity',
      html: `
        <p>Đây là bài toán được hỏi nhiều nhất ở các công ty mạng xã hội, và câu trả lời đúng <span class="kw">không phải</span> "chọn fan-out on write hay fan-out on read" mà là <span class="kw-y">hybrid với ngưỡng cụ thể</span>.</p>

        <h3>Yêu cầu & ước lượng (Twitter-like)</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Thông số</th><th>Giá trị</th><th>Hệ quả</th></tr></thead>
            <tbody>
              <tr><td>DAU</td><td>150 triệu</td><td>—</td></tr>
              <tr><td>Tweet/ngày</td><td>500 triệu</td><td>~5.800 tweet/s trung bình</td></tr>
              <tr><td>Peak QPS</td><td>~7.000/s</td><td>Tính bằng 2× trung bình + dư địa</td></tr>
              <tr><td>Feed load</td><td>~300.000/s</td><td>Mỗi user mở app 5–10 lần/ngày</td></tr>
              <tr><td>Follower trung bình</td><td>~200</td><td>Fan-out on write = 200 write/tweet</td></tr>
              <tr><td>Celebrity</td><td>50 triệu follower</td><td><span class="kw-r">Fan-out on write = 50M write cho 1 tweet</span></td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Tính toán quyết định</div>
            <p>Fan-out on write thuần: 5.800 tweet/s × 200 follower = <strong>1,16 triệu write/s</strong>. Với Redis, mỗi write là 1 <code>ZADD</code> — khả thi về mặt kỹ thuật nhưng tốn. Nhưng nếu một celebrity tweet, một tweet tạo ra 50 triệu write. Ở 7.000 QPS tweet, nếu 1% là celebrity (70 tweet/s), riêng phần này là <strong>3,5 tỷ write/s</strong> — bất khả thi. Đó chính là lý do phải hybrid.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 420" role="img" aria-label="Kiến trúc news feed hybrid với fan-out on write cho user thường và fan-out on read cho celebrity">
            <defs>
              <marker id="m5d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m5dg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#10b981"/>
              </marker>
            </defs>
            <rect x="16" y="24" width="130" height="56" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="81" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Post service</text>
            <text x="81" y="66" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">POST /tweets</text>

            <rect x="172" y="24" width="140" height="56" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="242" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Phân loại</text>
            <text x="242" y="62" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">followers &gt; 10k?</text>
            <text x="242" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">(ngưỡng cấu hình)</text>

            <rect x="338" y="24" width="150" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="413" y="44" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">User thường →</text>
            <text x="413" y="60" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">fan-out on write</text>
            <text x="413" y="72" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#10b981">≈ 1,16M write/s</text>

            <rect x="514" y="24" width="130" height="56" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="579" y="44" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Chỉ ghi post</text>
            <text x="579" y="60" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">vào timeline của</text>
            <text x="579" y="72" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">chính tác giả</text>

            <rect x="670" y="24" width="78" height="56" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="709" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Celebrity</text>
            <text x="709" y="64" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">fan-out</text>
            <text x="709" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">on read</text>

            <path d="M146,52 L170,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5d)"/>
            <path d="M312,52 L336,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5d)"/>
            <path d="M488,52 L512,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5d)"/>
            <path d="M644,52 L668,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5d)"/>

            <rect x="16" y="112" width="360" height="120" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">WRITE PATH (user thường)</text>
            <text x="34" y="156" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">tweet → Kafka → fanout worker</text>
            <text x="34" y="174" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">  → lấy follower list (cache)</text>
            <text x="34" y="192" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">  → ZADD feed:{user_id} score=ts</text>
            <text x="34" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Bảng feeds shard theo user_id (người nhận)</text>
            <text x="34" y="226" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Giới hạn 800 entry/user (ZREMRANGEBYRANK)</text>

            <rect x="396" y="112" width="352" height="120" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="414" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">READ PATH (hybrid merge)</text>
            <text x="414" y="156" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">1. Đọc feed đã push sẵn: ZREVRANGE (1 query)</text>
            <text x="414" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">2. Lấy danh sách celebrity đã follow (cache)</text>
            <text x="414" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">3. Query timeline của họ (thường 10–50 người)</text>
            <text x="414" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">4. Merge theo timestamp, cắt top 20</text>
            <text x="414" y="226" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Bước 4 làm ở service, không ở client</text>

            <rect x="16" y="252" width="728" height="72" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Vì sao merge ở read không quá tệ</text>
            <text x="34" y="296" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Một user follow ~200 người, trong đó chỉ ~10–50 là celebrity (vượt ngưỡng). Đọc 50 timeline riêng lẻ song song mất ~50ms; phần lớn feed đã có sẵn trong 1 query. Nếu user follow 5.000 người và 1.000 là celebrity → hạ ngưỡng hoặc pre-compute feed nền cho user đó.</text>
            <text x="34" y="314" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#8b95a3">Ngưỡng thực tế Twitter dùng: ~10.000 follower. Dưới ngưỡng = push, trên = pull.</text>

            <rect x="16" y="340" width="728" height="66" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="34" y="364" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Ba chi tiết hay bị bỏ sót</text>
            <text x="34" y="384" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>1.</strong> User mới follow → phải backfill feed (hoặc chấp nhận feed trống, đọc on read cho tới khi worker chạy). <strong>2.</strong> Unfollow → phải xoá entry (hoặc lọc khi đọc).</text>
            <text x="34" y="400" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>3.</strong> Ranking (không phải chỉ thời gian) → cần ML scoring, không thể pre-compute hoàn toàn.</text>
          </svg>
          <div class="diagram-cap">Hình 5.4 — Hybrid fan-out: 99% user đi đường nhanh, 1% celebrity đi đường riêng</div>
        </div>

        <h3>Bảng dữ liệu</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Bảng</th><th>Shard key</th><th>Nội dung</th><th>Truy cập</th></tr></thead>
            <tbody>
              <tr><td><code>tweets</code></td><td><code>tweet_id</code></td><td>id, author_id, text, media, ts</td><td>Point lookup khi render</td></tr>
              <tr><td><code>timeline</code></td><td><code>author_id</code></td><td>Tweet của một tác giả (cho celebrity path)</td><td>Range query theo ts</td></tr>
              <tr><td><code>feeds</code></td><td><code>user_id</code> (người nhận)</td><td>ZSET tweet_id → score</td><td>1 query, đọc top 800</td></tr>
              <tr><td><code>follows</code></td><td><code>follower_id</code></td><td>Danh sách người mình follow + phân loại</td><td>Cache trong Redis</td></tr>
              <tr><td><code>followers</code></td><td><code>followee_id</code></td><td>Để fan-out worker biết đẩy cho ai</td><td>Batch đọc khi có tweet</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Feed không phải "SELECT * ORDER BY ts"</div>
            <p>Nếu bạn trả lời "query tweets của 200 người mình follow rồi sort", bạn đang thiết kế fan-out on read thuần cho <em>mọi</em> user: 200 shard query mỗi lần load feed, 300.000 feed load/s → 60 triệu query/s. Không khả thi. Điểm mấu chốt là <strong>pre-compute cho số đông, compute on read cho số ít</strong>. Và luôn nêu: "Feed được giới hạn 800 entry, cắt bằng ZREMRANGEBYRANK — không giữ vô hạn vì user không bao giờ cuộn quá 800 bài."</p>
          </div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Nếu được hỏi thêm về ranking</div>
            <p>"Với feed theo trình tự thời gian, pre-compute hoạt động tốt. Với feed có ranking (ML score), tôi vẫn pre-compute <em>tập ứng viên</em> (top 500 theo thời gian + engagement signal), rồi chấm điểm ở read-time bằng một model nhẹ. Không chấm điểm 800 bài cho mỗi request — quá đắt ở 300k QPS. Cách thực tế hơn: pre-compute score theo batch mỗi 5 phút cho các user active, và read-time chỉ re-rank top 50."</p>
          </div>
        </div>
      `
    },

    {
      id: 'chat', num: '5.5', title: 'Chat System — WebSocket, presence và thứ tự message',
      html: `
        <p>Chat khó hơn vẻ ngoài: cần <span class="kw">realtime hai chiều</span>, phải <span class="kw">không mất message</span> khi user offline, phải giữ <span class="kw-y">đúng thứ tự</span>, và phải biết ai đang online mà không đánh sập hệ thống bằng heartbeat.</p>

        <h3>Chọn giao thức</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Giao thức</th><th>Ưu</th><th>Nhược</th><th>Dùng khi</th></tr></thead>
            <tbody>
              <tr><td><strong>WebSocket</strong></td><td>Hai chiều, overhead thấp, latency &lt; 50ms</td><td>Stateful — khó scale, cần sticky, tốn connection</td><td>Chat realtime (mặc định)</td></tr>
              <tr><td><strong>SSE</strong></td><td>Một chiều server→client, qua HTTP/2, đơn giản</td><td>Client gửi qua HTTP riêng</td><td>Notification, feed update</td></tr>
              <tr><td><strong>Long polling</strong></td><td>Hoạt động mọi nơi, không cần hạ tầng đặc biệt</td><td>Tốn connection, latency cao hơn</td><td>Fallback khi WS bị chặn</td></tr>
              <tr><td><strong>MQTT</strong></td><td>Rất nhẹ, tốt cho mobile/IoT</td><td>Cần broker riêng</td><td>Mobile app, thiết bị yếu</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 420" role="img" aria-label="Kiến trúc chat với WebSocket gateway, presence service, message service và luồng gửi nhận offline">
            <defs>
              <marker id="m5e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m5ep" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#8c4fff"/>
              </marker>
            </defs>
            <rect x="16" y="30" width="96" height="56" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="64" y="54" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Sender</text>
            <text x="64" y="72" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">WS</text>

            <rect x="16" y="196" width="96" height="56" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="64" y="220" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Receiver</text>
            <text x="64" y="238" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">WS / HTTP</text>

            <rect x="138" y="30" width="130" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="203" y="52" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">WS Gateway 1</text>
            <text x="203" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">giữ 50k conn</text>
            <text x="203" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">epoll/epoll</text>

            <rect x="138" y="196" width="130" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="203" y="218" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">WS Gateway N</text>
            <text x="203" y="234" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">user có thể ở đây</text>
            <text x="203" y="246" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">registry theo user_id</text>

            <rect x="296" y="30" width="126" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="359" y="52" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Message svc</text>
            <text x="359" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">gán msg_id</text>
            <text x="359" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">Snowflake</text>

            <rect x="296" y="196" width="126" height="56" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="359" y="218" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Presence</text>
            <text x="359" y="234" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Redis TTL 30s</text>
            <text x="359" y="246" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">heartbeat mỗi 10s</text>

            <rect x="450" y="30" width="120" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="510" y="52" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Kafka</text>
            <text x="510" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">partition by</text>
            <text x="510" y="80" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">conversation_id</text>

            <rect x="450" y="196" width="120" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="510" y="218" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Cassandra</text>
            <text x="510" y="234" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">messages</text>
            <text x="510" y="246" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">(conv_id, msg_id)</text>

            <rect x="596" y="112" width="152" height="108" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="614" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Receiver offline?</text>
            <text x="614" y="158" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ push notification</text>
            <text x="614" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ lưu inbox/queue</text>
            <text x="614" y="190" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ client sync khi mở app</text>
            <text x="614" y="210" font-family="JetBrains Mono, monospace" font-size="8" fill="#8b95a3">last_seen_msg_id cursor</text>

            <path d="M112,58 L136,58" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M268,58 L294,58" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M422,58 L448,58" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M510,86 L510,194" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M450,224 L424,224" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M294,224 L268,224" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M138,224 L112,224" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M406,224 L448,224" stroke="#8c4fff" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#m5ep)"/>
            <path d="M203,86 L203,194" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>
            <path d="M570,196 L618,222" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m5e)"/>

            <rect x="16" y="284" width="360" height="122" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="308" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Thứ tự message — không dùng timestamp</text>
            <text x="34" y="330" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Hai client ở hai múi giờ, đồng hồ lệch 40ms →</text>
            <text x="34" y="346" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">message hiển thị sai thứ tự, không sửa được.</text>
            <text x="34" y="368" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">Giải: msg_id = Snowflake (đơn điệu, tăng dần)</text>
            <text x="34" y="386" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">hoặc server-assigned sequence theo conversation.</text>

            <rect x="396" y="284" width="352" height="122" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="414" y="308" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Scale 50 triệu connection</text>
            <text x="414" y="330" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">1 node giữ ~50k–100k WS conn (tuỳ RAM/fd).</text>
            <text x="414" y="346" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">→ 500–1.000 gateway node.</text>
            <text x="414" y="368" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Registry: user_id → gateway_id (Redis). Khi gửi,</text>
            <text x="414" y="386" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">tra registry rồi forward tới đúng gateway.</text>
          </svg>
          <div class="diagram-cap">Hình 5.5 — Chat: gateway là stateful, nên registry user→gateway là thành phần sống còn</div>
        </div>

        <h3>Gửi message đi qua những đâu</h3>
        <ol class="list-num">
          <li>Sender gửi qua WebSocket tới gateway đang giữ connection của mình.</li>
          <li>Gateway chuyển cho Message service (gRPC nội bộ). Message service sinh <code>msg_id</code> (Snowflake), lưu vào Cassandra, publish vào Kafka topic <code>messages</code> partition theo <code>conversation_id</code>.</li>
          <li>Một fan-out worker đọc Kafka: tra registry, tìm gateway của receiver. Nếu online → đẩy qua WS. Nếu offline → lưu vào inbox queue + gửi push notification.</li>
          <li>Receiver nhận, gửi ACK. Nếu sender không nhận được ACK sau timeout → hiển thị "đang gửi" và retry với cùng <code>msg_id</code> (idempotent).</li>
          <li>Message đã đọc: ghi <code>read_receipt</code> vào bảng riêng, publish event để sender thấy tick.</li>
        </ol>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Group chat — fan-out ở đâu</div>
            <p>Group 500 người: khi có message, worker đẩy tới 500 gateway lookup. Với group 100.000 (Discord-style), fan-out trực tiếp quá đắt → dùng <strong>read path</strong>: client subscribe vào một channel, gateway giữ subscription list, message publish tới channel thay vì từng user. Nghĩa là: <em>small group → fan-out per user; large channel → pub/sub theo channel</em>. Ngưỡng thực tế vài trăm đến vài nghìn thành viên. Và luôn có câu hỏi: lưu message một lần (Cassandra) rồi mọi người đọc chung, <strong>không</strong> copy message vào inbox từng người — đó là sai lầm tốn kém nhất trong thiết kế chat.</p>
          </div>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Presence ở quy mô lớn — đừng fan-out mọi thay đổi</div>
            <p>Nếu user có 500 bạn và mỗi lần ai đó online/offline bạn đều nhận event, với 50 triệu user online trung bình, số event = 50M × 500 / (thời gian session) — hàng tỷ event/giờ. Cách làm thực tế: <strong>presence theo nhu cầu</strong> — chỉ subscribe trạng thái của người đang mở conversation với họ. Client gửi "tôi đang xem chat với X, Y, Z" và gateway subscribe 3 người đó. Khi đóng app, huỷ subscribe. Giảm từ 500× xuống còn 3–10× — đây là con số quyết định tính khả thi.</p>
          </div>
        </div>
      `
    },

    {
      id: 'search-autocomplete', num: '5.6', title: 'Search & Autocomplete — trie, inverted index và ranking',
      html: `
        <p>Hai bài toán khác nhau nhưng hay đi cùng: <span class="kw">autocomplete</span> (gõ tới đâu gợi ý tới đó, &lt; 100ms, top 10) và <span class="kw">full-text search</span> (tìm trong hàng triệu document, có ranking). Cả hai đều dựa trên index — câu hỏi là index nào.</p>

        <h3>Autocomplete: trie với top-K tại mỗi node</h3>
        <p>Ý tưởng cốt lõi: mỗi node trong trie lưu sẵn <strong>top-K truy vấn phổ biến nhất</strong> có prefix đó. Tra cứu chỉ là đi xuống theo ký tự (O(len)), rồi đọc top-K tại node — không cần duyệt cây con.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="Trie autocomplete với top-K gợi ý lưu tại mỗi node cho các prefix">
            <defs>
              <marker id="m5f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="24" width="180" height="52" rx="8" fill="#151515" stroke="#151515" stroke-width="2"/>
            <text x="106" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#f4d77c">root ("" )</text>
            <text x="106" y="64" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">top: system design, s3, sql…</text>

            <rect x="40" y="108" width="150" height="46" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="115" y="128" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">s</text>
            <text x="115" y="144" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">top: system, sql, s3</text>

            <rect x="40" y="190" width="150" height="46" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="115" y="210" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">sy</text>
            <text x="115" y="226" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">top: system, syscall</text>

            <rect x="40" y="272" width="150" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="115" y="292" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">sys</text>
            <text x="115" y="308" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">top: system, syscall</text>

            <rect x="40" y="336" width="150" height="46" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="115" y="356" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">syst</text>
            <text x="115" y="372" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">top: system design, system</text>

            <path d="M106,76 L110,106" stroke="#505a68" stroke-width="2" marker-end="url(#m5f)"/>
            <path d="M115,154 L115,188" stroke="#505a68" stroke-width="2" marker-end="url(#m5f)"/>
            <path d="M115,236 L115,270" stroke="#505a68" stroke-width="2" marker-end="url(#m5f)"/>
            <path d="M115,318 L115,334" stroke="#505a68" stroke-width="2" marker-end="url(#m5f)"/>

            <rect x="228" y="108" width="150" height="46" rx="7" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="303" y="130" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">sq</text>
            <text x="303" y="146" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">top: sql, sqs</text>

            <rect x="228" y="190" width="150" height="46" rx="7" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="303" y="212" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">s3</text>
            <text x="303" y="228" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">top: s3, s3 glacier</text>

            <path d="M190,131 L226,131" stroke="#505a68" stroke-width="2" marker-end="url(#m5f)"/>
            <path d="M190,131 C210,131 210,213 226,213" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m5f)"/>

            <rect x="412" y="34" width="336" height="160" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="430" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Ba con số quyết định thiết kế</text>
            <text x="430" y="82" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>Latency budget:</strong> &lt; 100ms end-to-end</text>
            <text x="430" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">(mỗi keystroke gửi 1 request → 5 keystroke = 5 request)</text>
            <text x="430" y="124" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>Kích thước trie:</strong> 100M query × ~30 byte prefix</text>
            <text x="430" y="142" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">≈ 3GB — vừa RAM một node lớn, hoặc shard theo</text>
            <text x="430" y="158" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">ký tự đầu (a–m / n–z → 2 shard).</text>
            <text x="430" y="182" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68"><strong>Debounce:</strong> client chờ 50–100ms sau keystroke</text>

            <rect x="412" y="212" width="336" height="80" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="430" y="236" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Không dùng được</text>
            <text x="430" y="258" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">SELECT ... WHERE term LIKE 'sys%' ORDER BY count</text>
            <text x="430" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">Không có index cho prefix + count; 5.000 QPS sẽ sập.</text>

            <rect x="412" y="308" width="336" height="74" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="430" y="332" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Cập nhật top-K thế nào?</text>
            <text x="430" y="352" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Query log → Kafka → job tổng hợp mỗi 1–5 phút</text>
            <text x="430" y="370" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">→ rebuild trie → swap atomic (double buffer).</text>
          </svg>
          <div class="diagram-cap">Hình 5.6 — Top-K tại mỗi node biến truy vấn prefix thành O(len) thay vì duyệt cây con</div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Ba chi tiết ăn điểm về autocomplete</div>
            <p><strong>1. Cá nhân hoá:</strong> top-K toàn cục không đúng cho mọi người. Giải: kết hợp (a) top-K toàn cục từ trie, (b) lịch sử tìm kiếm của user (Redis list 50 entry), (c) trending trong 1 giờ. Merge và re-rank ở read-time — chỉ trên ~40 ứng viên nên rẻ. <strong>2. Xử lý typo:</strong> dùng edit distance ≤ 2 trên trie (tìm kiếm mờ bằng cách duyệt nhiều nhánh) hoặc BK-tree. Chỉ bật khi không có kết quả, để không làm chậm đường nhanh. <strong>3. Ngôn ngữ:</strong> tiếng Việt có dấu — phải normalize (bỏ dấu để match, giữ dấu để hiển thị), và "ngân hàng" gõ không dấu "ngan hang" phải ra kết quả. Đây là chi tiết rất thực tế cho app Việt Nam.</p>
          </div>
        </div>

        <h3>Full-text search: inverted index & BM25</h3>
        <p>Với 10 triệu sản phẩm, bạn cần tìm theo nhiều từ khoá, xếp hạng theo độ liên quan. <span class="kw">Inverted index</span> map <code>term → posting list</code> (danh sách doc_id chứa term, kèm vị trí và tần suất).</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Thành phần</th><th>Vai trò</th><th>Ví dụ</th></tr></thead>
            <tbody>
              <tr><td><strong>Tokenizer</strong></td><td>Tách text thành term</td><td>"Áo thun nam" → ["áo", "thun", "nam"]</td></tr>
              <tr><td><strong>Analyzer</strong></td><td>Lowercase, bỏ dấu, stemming, stopword</td><td>"Running" → "run"; "và" bị bỏ</td></tr>
              <tr><td><strong>Posting list</strong></td><td>doc_id + term frequency + positions</td><td><code>["áo"] → [(doc1, tf=3), (doc7, tf=1)]</code></td></tr>
              <tr><td><strong>BM25</strong></td><td>Công thức ranking: TF × IDF × chuẩn hoá độ dài</td><td>Từ hiếm (IDF cao) quan trọng hơn từ phổ biến</td></tr>
              <tr><td><strong>Sharding</strong></td><td>Chia index theo document hoặc theo term</td><td>10M doc / 5 shard = 2M doc/shard</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Search index không phải source of truth</div>
            <p>Elasticsearch không có transaction, không đảm bảo bền vững như DB, và có thể mất dữ liệu khi split-brain (đây là lý do ES 7+ có "split brain protection" với <code>discovery.zen.minimum_master_nodes</code> → nay là voting config). Luôn coi ES là <strong>bản sao dẫn xuất</strong>: source of truth ở Postgres, đồng bộ qua CDC (Module 3). Khi ES hỏng, bạn rebuild từ DB — mất vài giờ nhưng không mất dữ liệu. Nếu ai đó thiết kế ghi trực tiếp vào ES và coi nó là DB chính, đó là lỗi kiến trúc nghiêm trọng.</p>
          </div>
        </div>

        <h3>Ranking — vì sao kết quả đầu tiên quan trọng</h3>
        <ul class="list-bullet">
          <li><strong>BM25 (text relevance):</strong> kết hợp term frequency (từ xuất hiện nhiều trong doc), inverse document frequency (từ hiếm có trọng số cao), và chuẩn hoá theo độ dài doc (doc ngắn không bị ưu tiên quá mức).</li>
          <li><strong>Business signals:</strong> độ mới, lượt bán, rating, tồn kho, biên lợi nhuận. Không thể học hết từ text — phải cộng vào score có trọng số.</li>
          <li><strong>Personalization:</strong> lịch sử click của user, category hay xem. Cần feature store và model nhẹ ở re-rank stage.</li>
          <li><strong>Kiến trúc 2 tầng:</strong> retrieval (lấy 1.000 ứng viên bằng BM25/filter, phải &lt; 20ms) → re-rank (chấm điểm 1.000 ứng viên bằng model, &lt; 50ms) → trả 20. Không bao giờ chấm điểm toàn bộ 10 triệu doc.</li>
        </ul>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">JSON</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Elasticsearch: tách filter (cache được) khỏi query (tính điểm)</span>
{
  <span class="c-str">"query"</span>: {
    <span class="c-str">"bool"</span>: {
      <span class="c-str">"must"</span>: [
        { <span class="c-str">"multi_match"</span>: {
            <span class="c-str">"query"</span>: <span class="c-str">"áo thun nam"</span>,
            <span class="c-str">"fields"</span>: [<span class="c-str">"name^3"</span>, <span class="c-str">"desc"</span>, <span class="c-str">"brand^2"</span>],
            <span class="c-str">"type"</span>: <span class="c-str">"best_fields"</span>,
            <span class="c-str">"fuzziness"</span>: <span class="c-str">"AUTO"</span>
        }}
      ],
      <span class="c-str">"filter"</span>: [
        { <span class="c-str">"term"</span>:  { <span class="c-str">"status"</span>: <span class="c-str">"active"</span> } },
        { <span class="c-str">"range"</span>: { <span class="c-str">"price"</span>: { <span class="c-str">"gte"</span>: <span class="c-num">100000</span>, <span class="c-str">"lte"</span>: <span class="c-num">500000</span> } } },
        { <span class="c-str">"range"</span>: { <span class="c-str">"stock"</span>: { <span class="c-str">"gt"</span>: <span class="c-num">0</span> } } }
      ],
      <span class="c-str">"should"</span>: [
        { <span class="c-str">"function_score"</span>: { <span class="c-str">"field_value_factor"</span>: {
            <span class="c-str">"field"</span>: <span class="c-str">"sales_30d"</span>, <span class="c-str">"factor"</span>: <span class="c-num">0.1</span>, <span class="c-str">"modifier"</span>: <span class="c-str">"log1p"</span>
        }}}
      ]
    }
  },
  <span class="c-str">"sort"</span>: [<span class="c-str">"_score"</span>, { <span class="c-str">"created_at"</span>: <span class="c-str">"desc"</span> }],
  <span class="c-str">"size"</span>: <span class="c-num">20</span>,
  <span class="c-str">"track_total_hits"</span>: <span class="c-num">false</span>
}</code></pre>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Filter context vs query context — khác biệt về hiệu năng</div>
            <p><strong>Query context</strong> (<code>must</code>): tính điểm BM25, không cache được, đắt. <strong>Filter context</strong> (<code>filter</code>): chỉ kiểm tra có/không, kết quả được cache trong filter cache, rẻ hơn nhiều. Vì vậy mọi điều kiện kiểu "status = active", "price &lt; X" phải đặt trong <code>filter</code>, chỉ phần text search đặt trong <code>must</code>. Với 50.000 QPS, đây là khác biệt giữa chạy được và không. Kèm theo: <code>track_total_hits: false</code> tránh đếm toàn bộ (ES mặc định đếm tới 10.000 với độ chính xác — nhưng vẫn tốn), và dùng <code>search_after</code> với cursor thay vì <code>from/size</code> khi phân trang sâu.</p>
          </div>
        </div>
      `
    },

    {
      id: 'video', num: '5.7', title: 'Video Streaming — pipeline encode và segment',
      html: `
        <p>Video là bài toán <span class="kw">băng thông</span> nhiều hơn là bài toán dữ liệu. Một file 1GB phục vụ 1 triệu lượt xem là 1PB egress. Thiết kế đúng phải giải quyết: encode nhiều bitrate, chia segment, cache ở CDN, và chọn bitrate theo mạng của client.</p>

        <h3>Pipeline từ upload tới phát</h3>
        <div class="diagram">
          <svg viewBox="0 0 760 440" role="img" aria-label="Pipeline video từ upload qua transcode thành các segment HLS nhiều bitrate rồi phục vụ qua CDN với adaptive bitrate">
            <defs>
              <marker id="m5g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="26" width="112" height="56" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="72" y="50" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Upload</text>
            <text x="72" y="68" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">multipart / S3</text>

            <rect x="154" y="26" width="120" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="214" y="50" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">S3 raw</text>
            <text x="214" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">file gốc</text>

            <rect x="300" y="26" width="130" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="365" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Kafka</text>
            <text x="365" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">video.uploaded</text>
            <text x="365" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#8b95a3">1 message/video</text>

            <rect x="456" y="26" width="140" height="56" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="526" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Transcode workers</text>
            <text x="526" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">FFmpeg, GPU/CPU</text>
            <text x="526" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#ef4444">tốn nhất về compute</text>

            <rect x="622" y="26" width="126" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="685" y="50" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">S3 processed</text>
            <text x="685" y="68" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">segments + manifest</text>

            <path d="M128,54 L152,54" stroke="#505a68" stroke-width="2" marker-end="url(#m5g)"/>
            <path d="M274,54 L298,54" stroke="#505a68" stroke-width="2" marker-end="url(#m5g)"/>
            <path d="M430,54 L454,54" stroke="#505a68" stroke-width="2" marker-end="url(#m5g)"/>
            <path d="M596,54 L620,54" stroke="#505a68" stroke-width="2" marker-end="url(#m5g)"/>

            <rect x="16" y="112" width="732" height="96" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Output: 1 video → nhiều rendition, mỗi rendition chia thành segment 4–10 giây</text>
            <text x="34" y="160" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">240p (400kbps) · 360p (800k) · 480p (1.4M) · 720p (2.5M) · 1080p (5M) · 1440p (9M) · 4K (18M)</text>
            <text x="34" y="180" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Ví dụ video 60 phút, segment 6s: 600 segment × 7 rendition = <strong>4.200 file</strong> cho một video.</text>
            <text x="34" y="198" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Segment 6s vì: đủ dài để overhead thấp (1 request/6s), đủ ngắn để chuyển bitrate nhanh khi mạng đổi.</text>

            <rect x="16" y="228" width="360" height="96" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="252" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Manifest (m3u8 / MPD)</text>
            <text x="34" y="274" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">#EXT-X-STREAM-INF:BANDWIDTH=800000</text>
            <text x="34" y="290" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">360p/index.m3u8</text>
            <text x="34" y="306" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">#EXT-X-STREAM-INF:BANDWIDTH=2500000</text>
            <text x="34" y="318" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">720p/index.m3u8</text>

            <rect x="392" y="228" width="356" height="96" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="410" y="252" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Adaptive Bitrate (ABR) ở client</text>
            <text x="410" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Client đo throughput + buffer level, tự chọn</text>
            <text x="410" y="290" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">rendition cho segment tiếp theo.</text>
            <text x="410" y="310" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">Server không quyết định — client quyết định.</text>
            <text x="410" y="318" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Đây là lý do HLS/DASH thắng RTMP cho VOD.</text>

            <rect x="16" y="344" width="732" height="80" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="368" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Phục vụ: CDN là toàn bộ câu chuyện</text>
            <text x="34" y="390" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Segment là file bất biến (immutable) → cache vĩnh viễn tại CDN, hit ratio &gt; 95%. Chỉ manifest cần TTL ngắn (live) hoặc cũng immutable (VOD).</text>
            <text x="34" y="408" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Egress CDN rẻ hơn origin 5–10×. Với 1 triệu view/video, CDN là bắt buộc, không phải tối ưu.</text>
          </svg>
          <div class="diagram-cap">Hình 5.7 — Video: compute đắt ở transcode, băng thông đắt ở egress, cả hai đều giải bằng segment + CDN</div>
        </div>

        <h3>Ước lượng cho một nền tảng video</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Thông số</th><th>Cách tính</th><th>Kết quả</th></tr></thead>
            <tbody>
              <tr><td>Upload</td><td>500 giờ video/phút (YouTube-scale)</td><td>720.000 giờ/ngày</td></tr>
              <tr><td>Storage gốc</td><td>720.000 giờ × 3600s × 5 Mbps / 8</td><td>≈ 1,6 PB/ngày (gốc)</td></tr>
              <tr><td>Storage sau transcode</td><td>× ~2× (nhiều rendition)</td><td>≈ 3,2 PB/ngày — cần tiering ngay</td></tr>
              <tr><td>Egress</td><td>1 tỷ giờ xem/ngày × 3 Mbps / 8</td><td>≈ 1,35 PB/ngày → 125 Gbps trung bình</td></tr>
              <tr><td>Peak egress</td><td>× 3 (giờ cao điểm)</td><td>~375 Gbps — cần nhiều CDN provider</td></tr>
              <tr><td>Transcode compute</td><td>720.000 giờ video, mỗi giờ cần ~1 giờ CPU để encode 1 rendition</td><td>Hàng trăm nghìn core-giờ/ngày → phải queue + spot instance</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Chi tiết thực tế: transcode không làm ngay</div>
            <p>Với 500 giờ upload/phút, không thể transcode đồng bộ. Kiến trúc đúng: upload → S3 raw → Kafka → <strong>priority queue</strong>. Video của creator lớn hoặc video mới có SLA thấp (xử lý trong 5 phút, chỉ 360p/720p); video cũ hoặc ít quan trọng xử lý sau vài giờ, đủ rendition. Dùng <strong>spot instance</strong> cho transcode (giảm 70% chi phí, chấp nhận bị thu hồi giữa chừng vì có thể retry). Chunk công việc theo segment để một instance bị thu hồi chỉ mất 1 segment, không mất cả video. Đây là ví dụ điển hình của "thiết kế cho lỗi" thay vì "tránh lỗi".</p>
          </div>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Live streaming khác VOD ở ba điểm</div>
            <p><strong>1. Latency:</strong> HLS chuẩn có độ trễ 15–30s (3 segment buffer). Low-latency HLS giảm xuống 2–5s bằng partial segment + blocking playlist reload. WebRTC cho &lt; 500ms nhưng không scale được cho hàng triệu viewer. <strong>2. Không có transcode trước:</strong> phải transcode realtime, chia làm 2 tầng (ingest server → ladder transcode → packager), và không thể dùng spot instance dễ dàng. <strong>3. Manifest thay đổi liên tục:</strong> không cache được lâu, cần TTL 1–2s; segment mới xuất hiện liên tục nên phải purge/push chủ động thay vì chờ hết hạn. Với live, CDN cần cơ chế "origin shield" để tránh hàng nghìn edge cùng kéo một segment từ origin.</p>
          </div>
        </div>
      `
    },

    {
      id: 'file-storage', num: '5.8', title: 'File Storage (Drive) — chunking, dedup và đồng bộ',
      html: `
        <p>Bài toán: lưu file của người dùng, đồng bộ nhiều thiết bị, cho phép chia sẻ, và không lưu cùng một file 10.000 lần. Điểm khác biệt so với video: file <span class="kw">có thể sửa</span>, nên cần versioning và block-level sync.</p>

        <h3>Chunking — tại sao không upload cả file</h3>
        <ul class="list-bullet">
          <li><strong>Resume:</strong> upload 5GB bị đứt ở 4,9GB không phải làm lại từ đầu — chỉ gửi lại chunk thiếu.</li>
          <li><strong>Delta sync:</strong> sửa 1 trang trong file Word 50MB → chỉ upload chunk chứa trang đó (nếu chunking theo content-defined boundary).</li>
          <li><strong>Dedup:</strong> chunk trùng giữa các file/version chỉ lưu một lần. Tiết kiệm 30–60% ở môi trường doanh nghiệp.</li>
          <li><strong>Parallel:</strong> upload 8 chunk song song, dùng hết băng thông.</li>
        </ul>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="Chunking file thành các block với hash riêng, dedup khi trùng hash và lưu metadata ánh xạ file tới block">
            <defs>
              <marker id="m5h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="26" width="180" height="52" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="106" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">File 50MB</text>
            <text x="106" y="66" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">báo cáo Q3.docx</text>

            <rect x="230" y="26" width="150" height="52" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="305" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Chunker</text>
            <text x="305" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">CDC 4MB ± window</text>

            <rect x="414" y="26" width="140" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="484" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">SHA-256</text>
            <text x="484" y="66" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">hash mỗi chunk</text>

            <rect x="588" y="26" width="160" height="52" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="668" y="48" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Check exists?</text>
            <text x="668" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">1 query hàng loạt</text>

            <path d="M196,52 L228,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5h)"/>
            <path d="M380,52 L412,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5h)"/>
            <path d="M554,52 L586,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5h)"/>

            <text x="16" y="112" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Bốn chunk của file này (hash rút gọn)</text>

            <rect x="16" y="126" width="170" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="101" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">a3f9…c21</text>
            <text x="101" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">chưa có → upload</text>

            <rect x="204" y="126" width="170" height="46" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="289" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">7b2e…9d4</text>
            <text x="289" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#b45309">đã tồn tại → bỏ qua</text>

            <rect x="392" y="126" width="170" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="477" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">c8a1…45f</text>
            <text x="477" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">chưa có → upload</text>

            <rect x="580" y="126" width="168" height="46" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="664" y="146" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">2d77…be0</text>
            <text x="664" y="162" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#b45309">đã tồn tại → bỏ qua</text>

            <rect x="16" y="192" width="366" height="96" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="216" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Metadata: file → danh sách chunk</text>
            <text x="34" y="238" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">files (file_id, name, size, version, owner)</text>
            <text x="34" y="254" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">file_chunks (file_id, version, idx, chunk_hash)</text>
            <text x="34" y="270" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">chunks (hash PK, s3_key, size, refcount)</text>

            <rect x="398" y="192" width="350" height="96" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="416" y="216" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Vì sao lưu theo "content-defined"</text>
            <text x="416" y="238" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Fixed-size chunking: chèn 1 byte ở đầu file →</text>
            <text x="416" y="254" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">mọi chunk sau đó lệch, dedup = 0.</text>
            <text x="416" y="272" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">CDC cắt theo nội dung (rolling hash) → chèn byte</text>
            <text x="416" y="282" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">chỉ ảnh hưởng 1 chunk, dedup vẫn hoạt động.</text>

            <rect x="16" y="306" width="732" height="80" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="330" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Refcount và xoá an toàn</text>
            <text x="34" y="352" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Mỗi chunk có refcount = số file/version đang dùng. Xoá file → giảm refcount, chỉ xoá S3 object khi về 0. Job GC dọn chunk mồ côi.</text>
            <text x="34" y="372" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">Nếu không có refcount: xoá file A làm hỏng file B dùng chung chunk. Đây là bug kinh điển của dedup.</text>
          </svg>
          <div class="diagram-cap">Hình 5.8 — Dedup: chỉ upload chunk chưa tồn tại, và phải có refcount để xoá an toàn</div>
        </div>

        <h3>Đồng bộ nhiều thiết bị — bài toán khó nhất</h3>
        <p>Bạn sửa file trên laptop, thêm ảnh trên điện thoại, cùng lúc. Server phải hợp nhất mà không mất dữ liệu.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cơ chế</th><th>Cách hoạt động</th><th>Hạn chế</th></tr></thead>
            <tbody>
              <tr><td><strong>Version vector per device</strong></td><td>Mỗi thiết bị đánh số version riêng; server so sánh để biết ai mới hơn</td><td>Xung đột thật → phải tạo "conflicted copy"</td></tr>
              <tr><td><strong>Last-write-wins</strong></td><td>Ai ghi sau thắng</td><td>Mất dữ liệu — không chấp nhận được cho file người dùng</td></tr>
              <tr><td><strong>Conflicted copy</strong></td><td>Tạo bản "file (conflict của An 2026-11-20).docx"</td><td>Rác, nhưng <span class="kw-g">không mất dữ liệu</span> — Dropbox/Drive dùng</td></tr>
              <tr><td><strong>CRDT / OT</strong></td><td>Merge tự động mức ký tự (docs cộng tác)</td><td>Chỉ cho document dạng text; file nhị phân không áp dụng được</td></tr>
              <tr><td><strong>Lock file (check-out)</strong></td><td>Một người giữ quyền sửa</td><td>Giảm usability, nhưng cần cho CAD/binary</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Ba con số cho file storage</div>
            <p><strong>1. Metadata DB:</strong> 500 triệu user × 1.000 file = 500 tỷ dòng metadata — đây mới là thứ cần shard (theo <code>user_id</code>), không phải blob. Blob đi thẳng S3. <strong>2. S3 không cần shard:</strong> nó đã là hệ phân tán; bạn chỉ cần đặt key hợp lý. Tuyệt đối không dùng key tuần tự (<code>file_0001</code>, <code>file_0002</code>) trên S3 cũ (giờ đã hash partition tự động, nhưng thói quen tốt là dùng UUID prefix). <strong>3. Upload lớn:</strong> dùng <strong>presigned URL</strong> để client upload trực tiếp lên S3, không qua app server. App server chỉ cấp URL và nhận callback — tránh app server thành bottleneck băng thông. Đây là chi tiết mà người phỏng vấn rất thích.</p>
          </div>
        </div>
      `
    },

    {
      id: 'payment', num: '5.9', title: 'Payment & Ledger — nơi sai một đồng là mất niềm tin',
      html: `
        <p>Hệ thống thanh toán có yêu cầu khắc nghiệt hơn mọi hệ thống khác: <span class="kw-r">không được mất tiền, không được tạo tiền, và phải giải thích được từng đồng</span>. Các kỹ thuật ở đây là bài học chung cho mọi hệ thống cần tính đúng đắn cao.</p>

        <h3>Double-entry ledger — nền tảng không thể bỏ qua</h3>
        <p>Nguyên tắc: mỗi giao dịch ghi <strong>ít nhất hai bút toán</strong>, tổng bằng 0. Không bao giờ <code>UPDATE balance = balance - 100</code>; chỉ <code>INSERT</code> bút toán, và số dư được tính từ tổng.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Sổ cái: chỉ INSERT, không bao giờ UPDATE/DELETE</span>
<span class="c-key">CREATE TABLE</span> ledger_entries (
  id           <span class="c-key">BIGSERIAL</span>,
  txn_id       <span class="c-key">UUID</span>        <span class="c-key">NOT NULL</span>,   <span class="c-com">-- cùng 1 giao dịch</span>
  account_id   <span class="c-key">BIGINT</span>      <span class="c-key">NOT NULL</span>,
  amount       <span class="c-key">NUMERIC</span>(<span class="c-num">20</span>,<span class="c-num">4</span>) <span class="c-key">NOT NULL</span>, <span class="c-com">-- dương = có, âm = nợ</span>
  currency     <span class="c-key">CHAR</span>(<span class="c-num">3</span>)     <span class="c-key">NOT NULL</span>,
  created_at   <span class="c-key">TIMESTAMPTZ</span> <span class="c-key">DEFAULT</span> now(),
  <span class="c-key">CONSTRAINT</span> amount_nonzero <span class="c-key">CHECK</span> (amount &lt;&gt; <span class="c-num">0</span>)
);
<span class="c-key">CREATE INDEX</span> idx_ledger_txn <span class="c-key">ON</span> ledger_entries(txn_id);
<span class="c-key">CREATE INDEX</span> idx_ledger_acc <span class="c-key">ON</span> ledger_entries(account_id, created_at <span class="c-key">DESC</span>);

<span class="c-com">-- Chuyển 100.000đ từ A sang B: hai bút toán trong CÙNG transaction</span>
<span class="c-key">BEGIN</span>;
  <span class="c-key">INSERT INTO</span> ledger_entries (txn_id, account_id, amount, currency)
  <span class="c-key">VALUES</span>
    (<span class="c-str">'txn-8f2a'</span>, <span class="c-num">1001</span>, -<span class="c-num">100000.0000</span>, <span class="c-str">'VND'</span>),  <span class="c-com">-- nợ A</span>
    (<span class="c-str">'txn-8f2a'</span>, <span class="c-num">1002</span>,  <span class="c-num">100000.0000</span>, <span class="c-str">'VND'</span>);  <span class="c-com">-- có B</span>
<span class="c-key">COMMIT</span>;
<span class="c-com">-- Tổng amount của mọi txn_id phải = 0. Job reconcile kiểm tra liên tục.</span>

<span class="c-com">-- Số dư = tổng bút toán (cache ở bảng riêng để không phải SUM mỗi lần)</span>
<span class="c-key">SELECT</span> <span class="c-key">COALESCE</span>(<span class="c-key">SUM</span>(amount), <span class="c-num">0</span>) <span class="c-key">FROM</span> ledger_entries
<span class="c-key">WHERE</span> account_id = <span class="c-num">1001</span> <span class="c-key">AND</span> currency = <span class="c-str">'VND'</span>;</code></pre>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Vì sao không dùng NUMERIC(float)</div>
            <p><code>0.1 + 0.2</code> trong float = <code>0.30000000000000004</code>. Với 10 triệu giao dịch mỗi ngày, sai số tích luỹ thành tiền thật. Luôn dùng <strong>integer (đơn vị nhỏ nhất — đồng, xu)</strong> hoặc <strong>NUMERIC/DECIMAL chính xác</strong>. Không bao giờ dùng <code>FLOAT</code>/<code>DOUBLE</code> cho tiền. Và khi tính phí, làm tròn phải có quy tắc rõ ràng và ghi lại — "làm tròn xuống" và "làm tròn lên" tạo ra chênh lệch vài nghìn đồng/ngày có thể phát hiện được trong đối soát.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 420" role="img" aria-label="Luồng thanh toán qua payment gateway với authorize capture và ba lớp chống trùng lặp">
            <defs>
              <marker id="m5i" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m5ig" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#10b981"/>
              </marker>
            </defs>
            <rect x="16" y="24" width="120" height="56" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="76" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Checkout</text>
            <text x="76" y="62" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">idem_key</text>
            <text x="76" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">sinh 1 lần</text>

            <rect x="162" y="24" width="130" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="227" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Payment svc</text>
            <text x="227" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">dedupe + state machine</text>
            <text x="227" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">PENDING→AUTH→CAP</text>

            <rect x="318" y="24" width="130" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="383" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">PSP gateway</text>
            <text x="383" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Stripe / VNPay</text>
            <text x="383" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">idempotent API</text>

            <rect x="474" y="24" width="126" height="56" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="537" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Webhook</text>
            <text x="537" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">có thể đến 2 lần</text>
            <text x="537" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">có thể đến sai thứ tự</text>

            <rect x="626" y="24" width="122" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="687" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Ledger</text>
            <text x="687" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">double-entry</text>
            <text x="687" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">append-only</text>

            <path d="M136,52 L160,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5i)"/>
            <path d="M292,52 L316,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5i)"/>
            <path d="M448,52 L472,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5i)"/>
            <path d="M600,52 L624,52" stroke="#505a68" stroke-width="2" marker-end="url(#m5i)"/>

            <rect x="16" y="112" width="360" height="112" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Authorize → Capture (không charge ngay)</text>
            <text x="34" y="158" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">1. AUTHORIZE: giữ tiền trên thẻ, chưa trừ.</text>
            <text x="34" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">   Hết hạn sau 7 ngày → tự huỷ.</text>
            <text x="34" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">2. Làm mọi bước khác (kho, ship, fraud check).</text>
            <text x="34" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">3. CAPTURE: chỉ khi mọi thứ xong. Không cần refund.</text>

            <rect x="392" y="112" width="356" height="112" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="410" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Webhook phải được coi là không tin cậy</text>
            <text x="410" y="158" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">• Verify signature (HMAC với secret)</text>
            <text x="410" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">• Idempotent theo event_id (lưu đã xử lý)</text>
            <text x="410" y="190" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">• Không tin thứ tự — kiểm tra state machine</text>
            <text x="410" y="208" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">• Luôn có job hỏi lại PSP (poll) làm lưới an toàn</text>

            <rect x="16" y="240" width="732" height="76" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="264" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Ba lớp chống trùng lặp — phải có cả ba</text>
            <text x="34" y="286" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">1. idempotency_key có UNIQUE trong DB   2. PSP nhận idempotency-key header   3. UNIQUE (order_id, kind) trên ledger</text>
            <text x="34" y="306" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Lớp 1 chống retry từ client. Lớp 2 chống retry tới PSP. Lớp 3 là lưới cuối: DB từ chối bút toán thứ hai cho cùng order.</text>

            <rect x="16" y="332" width="732" height="76" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="356" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Đối soát (reconciliation) — phần không ai muốn làm nhưng bắt buộc</text>
            <text x="34" y="378" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Mỗi ngày: tải settlement report từ PSP → so với ledger nội bộ → tìm 4 loại lệch:</text>
            <text x="34" y="396" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">(a) ta có, PSP không có (b) PSP có, ta không có (c) số tiền lệch (d) trạng thái lệch. Mọi lệch phải có owner và SLA xử lý.</text>
          </svg>
          <div class="diagram-cap">Hình 5.9 — Thanh toán: ba lớp idempotency + đối soát hằng ngày, không có lớp nào thay thế được lớp khác</div>
        </div>

        <h3>State machine — không cho phép chuyển trạng thái sai</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Từ</th><th>Được chuyển tới</th><th>Không được</th></tr></thead>
            <tbody>
              <tr><td><code>PENDING</code></td><td><code>AUTHORIZED</code>, <code>FAILED</code>, <code>CANCELLED</code></td><td><code>CAPTURED</code> (chưa authorize)</td></tr>
              <tr><td><code>AUTHORIZED</code></td><td><code>CAPTURED</code>, <code>VOIDED</code>, <code>EXPIRED</code></td><td><code>FAILED</code> (đã giữ tiền rồi)</td></tr>
              <tr><td><code>CAPTURED</code></td><td><code>REFUNDED</code>, <code>PARTIALLY_REFUNDED</code></td><td><code>CANCELLED</code> (đã trừ tiền, chỉ refund được)</td></tr>
              <tr><td><code>REFUNDED</code></td><td>— (trạng thái cuối)</td><td>Mọi thứ</td></tr>
            </tbody>
          </table>
        </div>
        <p>Implement bằng <code>UPDATE payments SET status='CAPTURED' WHERE id=? AND status='AUTHORIZED'</code> — kiểm tra <code>rowsAffected == 1</code>. Nếu 0, nghĩa là đã có ai chuyển trạng thái khác, không thực hiện capture. Đây là <span class="kw">optimistic concurrency control</span> — đơn giản và đúng, không cần lock.</p>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Ba câu hỏi phỏng vấn về payment mà nhiều người trượt</div>
            <p><strong>1. "Nếu webhook không đến thì sao?"</strong> — Luôn có job polling đối chiếu với PSP. Webhook là tối ưu, poll là bảo đảm. Không có job đó thì đơn treo vĩnh viễn. <strong>2. "Refund một phần thì ledger ghi thế nào?"</strong> — Ghi bút toán mới, không sửa bút toán cũ. <code>REFUNDED</code> là trạng thái dẫn xuất từ tổng số tiền đã hoàn, không phải một cột bị UPDATE. <strong>3. "Làm sao biết hệ thống không tạo ra tiền?"</strong> — Job kiểm tra: với mỗi <code>txn_id</code>, <code>SUM(amount) = 0</code>; và tổng số dư mọi account = 0 (vì tiền luôn chuyển từ đâu đó). Nếu khác 0, có bug hoặc gian lận. Đây là invariant có thể kiểm tra liên tục, và chính là giá trị lớn nhất của double-entry ledger.</p>
          </div>
        </div>
      `
    },

    {
      id: 'uber', num: '5.10', title: 'Geo & Ride-hailing — bài toán không gian',
      html: `
        <p>Bài toán: với 10 triệu tài xế và 5 triệu request/ngày, tìm tài xế gần nhất trong bán kính 2km, và cập nhật vị trí mỗi 4 giây. Điểm khó không phải "tìm gần nhất" mà là <span class="kw">ghi vị trí với tần suất cực cao</span>.</p>

        <h3>Ước lượng trước</h3>
        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Con số quyết định kiến trúc</div>
            <p>1 triệu tài xế online × cập nhật mỗi 4 giây = <strong>250.000 write/s</strong> liên tục. Nếu mỗi vị trí là một <code>UPDATE</code> vào DB quan hệ (kèm index địa lý), DB sẽ chết. Và một bản ghi vị trí chỉ sống 4 giây — đây là <em>ephemeral data</em>, không cần lưu bền. Đây là nhận định quyết định toàn bộ thiết kế.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 420" role="img" aria-label="Kiến trúc ride-hailing với lưới geohash, cập nhật vị trí vào Redis và tìm kiếm tài xế theo ô lân cận">
            <defs>
              <marker id="m5j" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#8b95a3">LƯỚI GEOHASH — ô khoảng 1,2km × 0,6km (precision 6)</text>

            <rect x="16" y="34" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="112" y="34" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="208" y="34" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="16" y="104" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="112" y="104" width="96" height="70" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <rect x="208" y="104" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="16" y="174" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="112" y="174" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>
            <rect x="208" y="174" width="96" height="70" rx="6" fill="#f8fafc" stroke="#e7ebf1" stroke-width="2"/>

            <circle cx="140" cy="122" r="6" fill="#10b981"/>
            <circle cx="168" cy="140" r="6" fill="#10b981"/>
            <circle cx="128" cy="152" r="6" fill="#10b981"/>
            <circle cx="40" cy="60" r="6" fill="#8b95a3"/>
            <circle cx="250" cy="190" r="6" fill="#8b95a3"/>
            <circle cx="60" cy="200" r="6" fill="#8b95a3"/>

            <circle cx="160" cy="139" r="30" fill="none" stroke="#5294ff" stroke-width="2" stroke-dasharray="4 3"/>
            <circle cx="160" cy="139" r="5" fill="#5294ff" stroke="#151515" stroke-width="2"/>
            <text x="160" y="200" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#5294ff">user, bán kính 2km</text>

            <text x="16" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">● tài xế rảnh trong ô này</text>
            <text x="180" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">● tài xế ở ô khác</text>

            <rect x="330" y="34" width="200" height="210" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="348" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Bước tìm tài xế</text>
            <text x="348" y="80" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">1. Tính geohash của user</text>
            <text x="348" y="98" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">2. Lấy 8 ô lân cận (3×3)</text>
            <text x="348" y="116" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">3. Với mỗi ô: ZRANGE geohash</text>
            <text x="348" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">4. Tính khoảng cách chính xác</text>
            <text x="348" y="152" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">5. Sắp xếp, chọn top-K</text>
            <text x="348" y="174" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">GEOSEARCH key FROMLONLAT lng lat</text>
            <text x="348" y="188" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">  BYRADIUS 2 km ASC COUNT 10</text>
            <text x="348" y="212" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">Redis GEOSEARCH làm hết bước 1–4.</text>
            <text x="348" y="228" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">Nhưng cần filter "chỉ tài xế rảnh".</text>

            <rect x="548" y="34" width="200" height="210" rx="9" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="566" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">250.000 write/s</text>
            <text x="566" y="80" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Không thể ghi vào Postgres.</text>
            <text x="566" y="98" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Giải:</text>
            <text x="566" y="118" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">• Redis GEOADD (in-memory)</text>
            <text x="566" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">• shard theo geohash prefix</text>
            <text x="566" y="154" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">• batch update (gom 4s → 1 write)</text>
            <text x="566" y="172" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">• chỉ giữ vị trí mới nhất</text>
            <text x="566" y="194" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Không lưu lịch sử ở đây —</text>
            <text x="566" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">lịch sử đi vào Kafka → data lake.</text>
            <text x="566" y="232" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Redis mất dữ liệu khi restart là OK.</text>

            <rect x="16" y="292" width="360" height="112" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Vấn đề biên ô (boundary problem)</text>
            <text x="34" y="338" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">User ở mép ô, tài xế cách 100m nhưng ở ô</text>
            <text x="34" y="354" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">bên cạnh → nếu chỉ query 1 ô sẽ bỏ sót.</text>
            <text x="34" y="376" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">Giải: luôn query 3×3 = 9 ô, hoặc dùng</text>
            <text x="34" y="394" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">GEORADIUS (Redis tự xử lý) / S2 / H3.</text>

            <rect x="392" y="292" width="356" height="112" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="410" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Vì sao H3/S2 tốt hơn geohash</text>
            <text x="410" y="338" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Geohash dùng hình chữ nhật, gần cực thì méo;</text>
            <text x="410" y="354" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">H3 (Uber) dùng lục giác → mọi ô có 6 hàng xóm</text>
            <text x="410" y="370" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">đều nhau, khoảng cách tâm đều hơn, và phân</text>
            <text x="410" y="386" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">cấp (res 0–15) cho phép zoom mượt.</text>
            <text x="410" y="402" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">S2 (Google) dùng hình chiếu Hilbert trên mặt cầu.</text>
          </svg>
          <div class="diagram-cap">Hình 5.10 — Geo: lưới chia không gian, luôn query 9 ô để tránh bỏ sót ở biên</div>
        </div>

        <h3>Matching — phần thực sự khó</h3>
        <p>Tìm 10 tài xế gần nhất là bài toán dễ. <strong>Chọn ai trong 10 người đó</strong> mới là bài toán kinh doanh:</p>
        <ul class="list-bullet">
          <li><strong>ETA</strong> (thời gian đến, không phải khoảng cách) — cần graph routing trên đường thật, không phải đường chim bay. Đây là service riêng (OSRM, Valhalla) với dữ liệu bản đồ.</li>
          <li><strong>Cân bằng cung cầu:</strong> nếu cùng một tài xế nhận 5 request, hệ thống phải "giữ" tài xế đó (assignment lock có TTL 15s) để 4 request kia chuyển sang người khác.</li>
          <li><strong>Fairness:</strong> tài xế rating cao không nên nhận hết; cần round-robin hoặc scoring có trọng số.</li>
          <li><strong>Surge pricing:</strong> khi cầu &gt; cung trong một ô, tăng giá để điều tiết. Cần aggregate realtime theo ô (cửa sổ 5 phút).</li>
          <li><strong>Dispatch loop:</strong> không phải "tìm 1 lần rồi thôi" mà là vòng lặp: đề nghị → chờ 15s → không nhận → đề nghị người tiếp theo.</li>
        </ul>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Assignment phải atomic</div>
            <p>Hai request cùng lúc thấy cùng một tài xế rảnh → cả hai gán. Kết quả: tài xế nhận 2 chuyến, một khách bị bỏ. Giải: dùng <strong>conditional claim</strong> — <code>SET driver:{id}:assigned {trip_id} NX EX 15</code>. Chỉ request nào <code>SETNX</code> thành công mới được gán. Hoặc dùng Redis Lua để kiểm tra "rảnh" và "gán" trong một bước atomic. Không bao giờ "đọc danh sách rảnh → chọn → ghi" mà không có điều kiện — đó là check-then-act race condition cổ điển.</p>
          </div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Ba câu chốt cho bài toán geo</div>
            <p><strong>1.</strong> "Vị trí tài xế là ephemeral — 250k write/s vào Redis GEO, không vào DB; lịch sử đi Kafka sang data lake." <strong>2.</strong> "Tìm kiếm dùng lưới (geohash/H3) và luôn query 9 ô để tránh lỗi biên." <strong>3.</strong> "Assignment dùng SETNX với TTL, không dùng check-then-act." Ba câu này cộng với con số 250k/s là phần lớn điểm của bài.</p>
          </div>
        </div>
      `
    }
  ],

  quiz: [
    {
      q: 'Bạn thiết kế URL shortener và chọn MD5 + lấy 7 ký tự base62. Sau 2 năm, bạn phát hiện tỉ lệ va chạm tăng. Giải thích nguyên nhân bằng số và đề xuất hai cách sửa.',
      a: 'Nguyên nhân là <strong>birthday paradox</strong>. Với <code>d = 62⁷ ≈ 3,52×10¹²</code> không gian mã và <code>n</code> URL đã tạo, kỳ vọng số cặp va chạm ≈ n²/(2d). Sau 2 năm ở 100M/ngày: n = 7,3×10¹⁰ → kỳ vọng ≈ (7,3×10¹⁰)²/(2×3,52×10¹²) ≈ <strong>757 triệu va chạm</strong>. Tỉ lệ mỗi lần ghi gặp va chạm ≈ 757M/7,3×10¹⁰ ≈ 1,04% — nghĩa là khoảng 1 trong 100 lần ghi phải thử lại. Tệ hơn, khi số URL tiến gần không gian mã, tỉ lệ này tăng phi tuyến. Hai cách sửa: <strong>(1) Chuyển sang ID tuần tự/Snowflake → base62.</strong> Không bao giờ va chạm vì mỗi ID là duy nhất theo cấu trúc; nhược điểm là code dài dần (7→8 ký tự khi vượt 3,52×10¹²). <strong>(2) Tăng độ dài lên 8 ký tự</strong> — 62⁸ ≈ 2,18×10¹⁴, gấp 62 lần dư địa, kỳ vọng va chạm giảm xuống còn ~12 nghìn. Cách này giữ nguyên logic hash. Ngoài ra, cách đang chạy phải có <strong>retry với salt</strong>: khi phát hiện trùng, hash lại với <code>longURL + salt</code>, thử tối đa 3–5 lần rồi báo lỗi. Điểm quan trọng trong phỏng vấn: nêu được công thức birthday paradox và con số cụ thể, không chỉ nói "hash có thể trùng".'
    },
    {
      q: 'Rate limiter của bạn dùng fixed window 1.000 request/giờ. Một client bị chặn liên tục dù chỉ gửi 600 request/giờ. Nguyên nhân có thể là gì?',
      a: 'Ba nguyên nhân khả dĩ, theo thứ tự phổ biến: <strong>(1) Nhiều instance đếm riêng không phải vấn đề ở đây</strong> (nếu in-memory thì client bị chặn <em>ít</em> hơn, không phải nhiều hơn) — nhưng nếu dùng Redis với key không thống nhất (ví dụ key chứa instance_id hoặc timestamp khác nhau), tổng limit bị chia nhỏ. <strong>(2) Window không khớp với kỳ vọng của user:</strong> fixed window tính từ mốc cố định (00:00, 01:00). Nếu user gửi 600 request trong 30 phút cuối giờ trước và 600 trong 30 phút đầu giờ sau, họ thấy "600/giờ" nhưng thực tế đã dùng 1.200 trong 60 phút → bị chặn. Đây là <em>biên window</em> — chính là nhược điểm của fixed window. <strong>(3) Đếm cả request bị từ chối:</strong> nếu code tăng counter trước khi kiểm tra, mỗi lần bị 429 lại cộng thêm 1 → client càng retry càng bị khoá chặt. Đây là bug rất phổ biến. Sửa: chuyển sang <strong>sliding window counter</strong> (giải quyết cả (2)), chỉ tăng counter khi request được chấp nhận (giải quyết (3)), và trả header <code>X-RateLimit-Remaining</code> + <code>Retry-After</code> để client biết khi nào thử lại. Nếu vẫn còn lệch, kiểm tra xem có proxy/CDN nào đếm thêm không.'
    },
    {
      q: 'Bạn thiết kế news feed cho 150 triệu DAU. Celebrity có 50 triệu follower đăng 10 tweet/ngày. Tính xem fan-out on write thuần có khả thi không.',
      a: 'Tính cụ thể: 1 celebrity × 10 tweet/ngày × 50M follower = <strong>500 triệu write/ngày chỉ cho một celebrity</strong>. Giả sử có 1.000 celebrity ở mức đó → 500 tỷ write/ngày = <strong>5,8 triệu write/s</strong> trung bình, và peak có thể 15–20 triệu/s. Một cluster Redis lớn (100 node) chịu được khoảng 1–2 triệu op/s. Vậy fan-out on write thuần <strong>không khả thi</strong> — cần gấp 5–10 lần hạ tầng lớn nhất có thể, và mỗi tweet của celebrity tạo ra "write storm" làm chậm toàn bộ hàng đợi (head-of-line blocking). Thêm vấn đề: 90% follower không online trong 10 phút tới — bạn đang pre-compute cho người không đọc. Giải pháp hybrid: <strong>ngưỡng follower = 10.000</strong>. Dưới ngưỡng: fan-out on write (chiếm ~99,9% số user nhưng chỉ vài % tổng write). Trên ngưỡng: chỉ ghi vào timeline của tác giả, và khi user mở feed thì merge timeline của những celebrity họ follow. Với user follow 200 người, thường chỉ 5–20 là celebrity → 5–20 query song song, ~50ms. Con số cần nêu: ngưỡng 10k, và "99,9% user đi đường push, 0,1% đi đường pull, nhưng 0,1% đó chiếm 95% khối lượng fan-out".'
    },
    {
      q: 'Trong chat system, bạn lưu mỗi message một lần trong Cassandra hay copy vào inbox của từng người nhận? Giải thích bằng con số.',
      a: 'Lưu <strong>một lần</strong>, tuyệt đối không copy. Con số: 500 triệu message/ngày, group trung bình 5 người. Nếu copy vào inbox từng người: 2,5 tỷ write/ngày = 29.000 write/s, nhân với dung lượng (kể cả message nhỏ 200 byte + metadata) ≈ 500GB/ngày chỉ riêng phần nhân bản. Với group 500 người (cộng đồng), một message thành 500 write → 500× phóng đại. Và khi user rời group, bạn phải xoá hàng nghìn bản copy. Cách đúng: message lưu một lần với partition key <code>(conversation_id, bucket)</code>, clustering key là <code>msg_id</code> giảm dần. Người nhận đọc bằng <code>WHERE conversation_id = ? AND msg_id &lt; last_seen ORDER BY msg_id DESC LIMIT 50</code>. Trạng thái "đã đọc" lưu riêng trong bảng <code>read_state (user_id, conversation_id, last_read_msg_id)</code> — một dòng/user/conversation, không phải một dòng/message/user. Điều này giảm từ 2,5 tỷ write/ngày xuống còn 500 triệu, và cho phép sync hiệu quả: client chỉ cần biết <code>last_read_msg_id</code> của mình để lấy phần còn thiếu. Ngoại lệ duy nhất: nếu cần "inbox" hiển thị conversation gần nhất kèm preview, lưu một dòng/user/conversation (không phải /message) — đó là materialized view, cập nhật khi có message mới.'
    },
    {
      q: 'Với 10 triệu sản phẩm và 50.000 query/giây, tại sao không dùng Postgres với LIKE? Thiết kế thay thế và giải thích từng tầng.',
      a: 'Postgres <code>LIKE \'%áo thun%\'</code> không dùng được B-tree index (vì bắt đầu bằng <code>%</code>) → full table scan 10 triệu dòng cho <em>mỗi</em> query. Ở 50.000 QPS, mỗi scan 10 triệu dòng dù chỉ 20ms thì cần 1.000 core chỉ để scan, và không thể cache vì mỗi query khác nhau. Thêm nữa LIKE không có relevance ranking — không biết kết quả nào liên quan hơn. Thay thế 3 tầng: <strong>Tầng 1 — Retrieval (Elasticsearch)</strong>: inverted index + BM25, 10 triệu document với ~1KB text ≈ 10–20GB index, chia 5 shard × 2 replica = 10 node. Query đặt text trong <code>must</code> (tính điểm) và mọi filter (category, price, stock) trong <code>filter</code> (cache được). 50.000 QPS đọc cần ~20–30 replica shard. <strong>Tầng 2 — Cache (Redis)</strong>: top 1.000–10.000 search term phổ biến chiếm phần lớn traffic (phân bố Zipf). Cache kết quả 60s → giảm 60–70% tải ES. <strong>Tầng 3 — Đồng bộ (CDC)</strong>: Postgres là source of truth; Debezium đọc WAL → Kafka → consumer index vào ES với upsert (idempotent). Độ trễ 1–3s, chấp nhận được cho search. Chi tiết quan trọng: <code>track_total_hits: false</code>, <code>search_after</code> thay vì <code>from/size</code> khi phân trang sâu, và job rebuild index định kỳ (blue/green alias swap) để sửa drift. Con số chốt: 10M doc → 5 shard × 2 replica; ES không phải source of truth.'
    },
    {
      q: 'Hệ thống thanh toán của bạn nhận webhook từ PSP. Bạn phát hiện có đơn bị capture hai lần. Trình bày cách điều tra và ba lớp phòng ngừa.',
      a: 'Điều tra: (1) kiểm tra <strong>webhook trùng</strong> — PSP thường gửi lại nếu không nhận 200 trong 5s; nếu handler của bạn không idempotent theo <code>event_id</code>, hai lần gửi = hai lần capture. (2) kiểm tra <strong>retry từ phía bạn</strong> — nếu gọi PSP API capture và bị timeout, bạn retry mà không gửi <code>Idempotency-Key</code> → PSP tạo giao dịch mới. (3) kiểm tra <strong>state machine</strong> — có path nào cho phép capture từ trạng thái không phải AUTHORIZED? Ví dụ webhook <code>payment_intent.succeeded</code> và <code>charge.succeeded</code> cùng đến, cả hai đều trigger capture. (4) kiểm tra <strong>đa instance</strong> — hai worker cùng xử lý một event (Kafka rebalance, hoặc hai consumer group) mà không có lock/dedupe. Ba lớp phòng ngừa: <strong>(1) Idempotency key ở tầng client/nội bộ</strong> — bảng <code>idempotency_keys</code> với <code>PRIMARY KEY (user_id, key)</code>, <code>INSERT ... ON CONFLICT DO NOTHING</code>, lưu cả response. <strong>(2) Idempotency key tới PSP</strong> — mọi call capture gửi header <code>Idempotency-Key: {order_id}:{attempt_purpose}</code>, PSP sẽ trả cùng kết quả cho key trùng. <strong>(3) UNIQUE constraint ở ledger</strong> — <code>UNIQUE (order_id, entry_kind)</code> trên bảng bút toán; bút toán thứ hai bị DB từ chối bằng lỗi duplicate thay vì ghi âm thầm. Đây là lưới cuối cùng và không thể bypass. Thêm: job đối soát hằng ngày so ledger với settlement report của PSP, alert khi số dư tổng ≠ 0 hoặc khi có 2 capture cho cùng order — phát hiện trong 24h thay vì khi khách phàn nàn.'
    }
  ]
};

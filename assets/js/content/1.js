/* ============================================================
   Module 1 — System Design Foundations (Foundations)
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[1] = {
  title: 'Module 1 — Nền tảng System Design',
  lead: 'Module này dạy bạn cách <em>tiếp cận</em> một bài toán thiết kế trước khi động đến công nghệ. Thứ tự luôn là: làm rõ yêu cầu → ước lượng quy mô → phác thảo kiến trúc → đào sâu điểm nghẽn → trình bày trade-off. Ai bỏ qua bước 1 và 2 sẽ thiết kế sai hệ thống.',

  keywords: [
    { term: 'Functional requirements', def: 'Hệ thống phải LÀM ĐƯỢC gì — các tính năng người dùng thấy: đăng bài, follow, tìm kiếm.' },
    { term: 'Non-functional requirements', def: 'Hệ thống phải TỐT đến mức nào — availability, latency, consistency, scalability, durability.' },
    { term: 'Back-of-envelope', def: 'Ước lượng nhanh QPS, storage, bandwidth bằng số tròn và phép chia đơn giản, để kiểm tra thiết kế có khả thi không.' },
    { term: 'DAU / MAU', def: 'Daily / Monthly Active Users. DAU là nền tảng để tính QPS; MAU dùng cho quy mô dữ liệu dài hạn.' },
    { term: 'QPS', def: 'Queries Per Second = (DAU × số thao tác/ngày) / 86.400. Luôn tính thêm peak QPS = 2–3× trung bình.' },
    { term: 'Peak QPS', def: 'Lưu lượng đỉnh. Thiết kế theo peak, không theo trung bình, nếu không hệ thống sẽ sập giờ cao điểm.' },
    { term: 'Read/write ratio', def: 'Tỉ lệ đọc/ghi. 100:1 nghĩa là tối ưu cho đọc (cache, replica); 1:1 cần tối ưu ghi (LSM, batching).' },
    { term: 'Availability nines', def: '99,9% = 8,76 giờ downtime/năm; 99,99% = 52,6 phút; 99,999% = 5,26 phút. Mỗi "nine" tốn chi phí gấp nhiều lần.' },
    { term: 'Latency vs Throughput', def: 'Latency = thời gian 1 request; Throughput = số request/giây. Tăng batching tăng throughput nhưng tăng latency.' },
    { term: 'P50/P95/P99', def: 'Percentile độ trễ. P99 = 1% request chậm nhất. Người dùng thường xuyên gặp tail latency nên tối ưu P99 quan trọng hơn average.' },
    { term: 'Little\u2019s Law', def: 'L = λ × W. Số request đồng thời = tốc độ đến × thời gian xử lý. Dùng để tính pool size, số worker cần.' },
    { term: 'Trade-off', def: 'Mọi quyết định thiết kế đều đánh đổi. Không có "tốt nhất", chỉ có "phù hợp với ràng buộc nào".' }
  ],

  sections: [
    {
      id: 'framework', num: '1.1', title: 'Khung 4 bước trả lời mọi bài toán thiết kế',
      html: `
        <p>Alex Xu mô tả khung 4 bước trong <em>System Design Interview</em>. Điều quan trọng nhất không phải là thiết kế cuối cùng mà là <span class="kw">quá trình</span> bạn đi đến đó — người phỏng vấn chấm cách bạn suy nghĩ.</p>

        <div class="diagram">
          <svg viewBox="0 0 720 300" role="img" aria-label="Khung 4 bước thiết kế hệ thống">
            <defs><marker id="m1a" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#151515"/></marker></defs>
            <g font-size="11.5" font-weight="800">
              <rect x="20" y="40" width="150" height="86" rx="10" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="95" y="64" text-anchor="middle" fill="#151515">BƯỚC 1</text>
              <text x="95" y="84" text-anchor="middle" fill="#151515" font-size="11">Hiểu bài toán</text>
              <text x="95" y="100" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">clarify + scope</text>
              <text x="95" y="116" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">5–10 phút</text>

              <rect x="196" y="40" width="150" height="86" rx="10" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="271" y="64" text-anchor="middle" fill="#151515">BƯỚC 2</text>
              <text x="271" y="84" text-anchor="middle" fill="#151515" font-size="11">Thiết kế tổng thể</text>
              <text x="271" y="100" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">components + data flow</text>
              <text x="271" y="116" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">10–15 phút</text>

              <rect x="372" y="40" width="150" height="86" rx="10" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="447" y="64" text-anchor="middle" fill="#151515">BƯỚC 3</text>
              <text x="447" y="84" text-anchor="middle" fill="#151515" font-size="11">Đào sâu</text>
              <text x="447" y="100" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">bottleneck, scaling</text>
              <text x="447" y="116" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">10–15 phút</text>

              <rect x="548" y="40" width="150" height="86" rx="10" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="623" y="64" text-anchor="middle" fill="#151515">BƯỚC 4</text>
              <text x="623" y="84" text-anchor="middle" fill="#151515" font-size="11">Kết thúc</text>
              <text x="623" y="100" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">trade-off + mở rộng</text>
              <text x="623" y="116" text-anchor="middle" fill="#505a68" font-size="9.5" font-weight="600">5 phút</text>
            </g>
            <g stroke="#151515" stroke-width="2" marker-end="url(#m1a)">
              <line x1="172" y1="83" x2="190" y2="83"/>
              <line x1="348" y1="83" x2="366" y2="83"/>
              <line x1="524" y1="83" x2="542" y2="83"/>
            </g>

            <rect x="20" y="160" width="678" height="112" rx="10" fill="#f8fafc" stroke="#151515" stroke-width="2" stroke-dasharray="5 4"/>
            <text x="36" y="184" font-size="11" font-weight="800" fill="#151515">Hai vòng lặp chạy xuyên suốt:</text>
            <text x="36" y="208" font-size="10.5" font-weight="600" fill="#505a68">① Hỏi &amp; xác nhận — mỗi bước đều phải "chốt" với interviewer trước khi đi tiếp (get buy-in)</text>
            <text x="36" y="230" font-size="10.5" font-weight="600" fill="#505a68">② Ước lượng — dùng back-of-envelope để kiểm tra thiết kế có chịu được quy mô không</text>
            <text x="36" y="252" font-size="10.5" font-weight="600" fill="#505a68">Sai lầm phổ biến: nhảy ngay vào vẽ kiến trúc mà chưa biết cần phục vụ bao nhiêu user</text>
          </svg>
          <div class="diagram-cap">Hình 1.1 — Khung 4 bước. Tổng 30–45 phút cho một buổi phỏng vấn.</div>
        </div>

        <h3>Bước 1 — Hiểu bài toán (đừng đoán)</h3>
        <p>Bài toán phỏng vấn luôn mơ hồ có chủ đích. Bạn phải hỏi để thu hẹp phạm vi. Danh sách câu hỏi Alex Xu gợi ý:</p>
        <ul class="list-bullet">
          <li>Tính năng <strong>cụ thể</strong> nào cần xây? (không phải "một mạng xã hội" mà là "đăng bài + xem feed")</li>
          <li>Bao nhiêu user? Quy mô tăng thế nào sau 3 / 6 / 12 tháng?</li>
          <li>Nền tảng nào: mobile, web, hay cả hai?</li>
          <li>Có thể dùng hạ tầng/ dịch vụ có sẵn để đơn giản hoá không?</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Nếu interviewer nói "cứ giả định đi"</div>
            <p>Hãy <strong>viết giả định ra giấy/whiteboard</strong>. Ví dụ: "Giả định 10 triệu DAU, tỉ lệ đọc/ghi 100:1, dữ liệu lưu 5 năm." Điều này cho phép bạn quay lại kiểm tra sau, và cho interviewer thấy bạn có kỷ luật.</p>
          </div>
        </div>

        <h3>Bước 2 — Thiết kế tổng thể và lấy đồng thuận</h3>
        <p>Vẽ sơ đồ khối: client (mobile/web) → API → web servers → data stores → cache → CDN → message queue. Đừng đi vào chi tiết implementation. <strong>Hỏi ý kiến interviewer</strong>: "Phần này em định dùng cache-aside, anh/chị thấy hợp lý không?" — đây là điểm cộng, không phải điểm trừ.</p>

        <h3>Bước 3 — Đào sâu</h3>
        <p>Chọn 1–2 thành phần quan trọng nhất và đi sâu: thiết kế schema, chọn shard key, xử lý race condition, tính toán capacity. Người phỏng vấn thường gợi ý: "Hãy nói kỹ hơn về phần X".</p>

        <h3>Bước 4 — Kết thúc</h3>
        <p>Không phải "xong rồi". Đây là lúc nói về: điểm nghẽn còn lại, single point of failure, cách monitor, và nếu có thêm thời gian sẽ làm gì. Đây là phần nhiều người bỏ qua và mất điểm.</p>`
    },

    {
      id: 'nfr', num: '1.2', title: 'Non-functional requirements — phần quyết định kiến trúc',
      html: `
        <p>Functional requirements quyết định <em>tính năng</em>. Non-functional requirements (NFR) quyết định <em>kiến trúc</em>. Hai hệ thống cùng tính năng nhưng NFR khác nhau sẽ có kiến trúc hoàn toàn khác.</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>NFR</th><th>Câu hỏi cần trả lời</th><th>Ảnh hưởng kiến trúc</th></tr></thead>
            <tbody>
              <tr><td><span class="kw">Availability</span></td><td>Chịu được bao nhiêu downtime/năm?</td><td>Số replica, multi-AZ, failover, health check</td></tr>
              <tr><td><span class="kw">Latency</span></td><td>P99 phải dưới bao nhiêu ms?</td><td>Cache, CDN, edge compute, denormalization</td></tr>
              <tr><td><span class="kw">Consistency</span></td><td>Đọc có được phép stale không?</td><td>Replica read, quorum, consensus, versioning</td></tr>
              <tr><td><span class="kw">Durability</span></td><td>Mất dữ liệu được không?</td><td>WAL, replication 3×, backup, cross-region</td></tr>
              <tr><td><span class="kw">Scalability</span></td><td>Scale theo chiều nào?</td><td>Stateless service, sharding, partition</td></tr>
              <tr><td><span class="kw">Cost</span></td><td>Ngân sách hạ tầng?</td><td>Chọn managed service, spot instance, tiering</td></tr>
              <tr><td><span class="kw">Security</span></td><td>Dữ liệu nhạy cảm cỡ nào?</td><td>Encryption, zero-trust, audit log, PII tách riêng</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Bảng availability — học thuộc</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code>Availability   Downtime/năm       Downtime/tháng     Ghi chú
─────────────────────────────────────────────────────────────────
99%            3,65 ngày          7,2 giờ            Không chấp nhận được cho prod
99,9%          8,77 giờ           43,8 phút          "three nines" — mức tối thiểu
99,99%         52,6 phút          4,38 phút          "four nines" — cần multi-AZ
99,999%        5,26 phút          26,3 giây          "five nines" — cần multi-region
99,9999%       31,6 giây          2,63 giây          Gần như chỉ hệ thống viễn thông

<span class="c-com"># Công thức: downtime = (1 - availability) × 365 × 24 × 60 phút</span>
<span class="c-com"># 99,9% → 0,001 × 525600 = 525,6 phút/năm = 8,76 giờ</span>

<span class="c-com"># Availability của chuỗi phụ thuộc (nối tiếp)</span>
A_total = A1 × A2 × A3
<span class="c-out"># 3 service, mỗi cái 99,9% → 0,999³ = 99,7% (tệ hơn từng cái!)</span>

<span class="c-com"># Availability khi có redundancy song song</span>
A_total = 1 - (1 - A)^n
<span class="c-out"># 2 instance, mỗi cái 99,9% → 1 - 0,001² = 99,9999%</span></code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Sự thật phũ phàng về "five nines"</div>
            <p>Nếu hệ thống của bạn gọi 3 service khác nhau, mỗi service 99,99%, thì availability tổng chỉ còn <strong>99,97%</strong> — thấp hơn cả "four nines". Đây là lý do hệ thống microservices cần <span class="kw">graceful degradation</span>: khi một service chết, ứng dụng vẫn phải chạy được ở chế độ giảm chức năng.</p>
          </div>
        </div>

        <h3>SLA vs SLO vs SLI</h3>
        <ul class="list-bullet">
          <li><span class="kw">SLI</span> (Indicator) — con số đo được: 99,95% request thành công trong 28 ngày.</li>
          <li><span class="kw">SLO</span> (Objective) — mục tiêu nội bộ: đạt 99,95% availability. Đặt cao hơn SLA.</li>
          <li><span class="kw">SLA</span> (Agreement) — cam kết với khách hàng, có phạt tiền: 99,9%. Đặt thấp hơn SLO một chút để có buffer.</li>
        </ul>
        <p>Thứ tự đúng: <strong>SLI &lt; SLO &lt; SLA</strong> (về độ nghiêm ngặt: SLO nghiêm hơn SLA). Nếu SLA = 99,9% thì SLO nên là 99,95% để có "error budget" đệm và không vi phạm hợp đồng.</p>`
    },

    {
      id: 'estimation', num: '1.3', title: 'Back-of-envelope estimation — kỹ năng bắt buộc',
      html: `
        <p>Ước lượng là kỹ năng phân biệt người biết thiết kế với người chỉ đọc blog. Bạn không cần kết quả đúng — bạn cần <span class="kw">quá trình hợp lý</span> và các con số không điên rồ.</p>

        <h3>Bộ số phải thuộc</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># --- Đơn vị ---</span>
1 KB = 10³ bytes    1 MB = 10⁶    1 GB = 10⁹    1 TB = 10¹²    1 PB = 10¹⁵
1 ngày = 86.400 giây ≈ 10⁵ giây   <span class="c-com">← số này dùng nhiều nhất</span>
1 tháng ≈ 2,5 triệu giây          1 năm ≈ 31,5 triệu giây

<span class="c-com"># --- Latency numbers (Jeff Dean, cập nhật 2020) ---</span>
L1 cache                  0,5 ns
Branch mispredict           5 ns
L2 cache                    7 ns
Mutex lock/unlock          25 ns
Main memory (RAM)         100 ns      <span class="c-com">← 100ns là mốc quan trọng</span>
Compress 1KB (Zippy)       3 µs
Send 1KB qua 1 Gbps       10 µs
Read 4KB random từ SSD   150 µs
Read 1MB tuần tự từ RAM  250 µs
Round trip trong 1 DC    500 µs       <span class="c-com">← 0,5ms, rất quan trọng</span>
Read 1MB tuần tự từ SSD    1 ms
Disk seek                   10 ms      <span class="c-com">← đắt gấp 20 lần SSD</span>
Read 1MB tuần tự từ đĩa    20 ms
Send packet CA→EU→CA     150 ms      <span class="c-com">← datacenter khác châu lục</span>

<span class="c-com"># --- Quy tắc ghi nhớ ---</span>
• RAM nhanh hơn SSD ~150×, SSD nhanh hơn HDD ~100×
• Trong cùng DC: 0,5ms. Khác region: 50–150ms. <span class="c-com">→ chênh 100–300×</span>
• Một server commodity: ~10K QPS cho read đơn giản, ~1–2K QPS cho write có transaction
• MySQL/Postgres 1 node: ~5K QPS read, ~2K QPS write (có index tốt)
• Redis 1 node: ~100K QPS
• Kafka 1 partition: ~10MB/s
• 1 core CPU: ~10⁹ phép tính đơn giản/giây</code></pre>
        </div>

        <h3>Công thức ước lượng</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Đại lượng</th><th>Công thức</th><th>Ghi chú</th></tr></thead>
            <tbody>
              <tr><td>QPS trung bình</td><td><code>(DAU × actions/day) / 86400</code></td><td>Luôn làm tròn 86400 → 10⁵</td></tr>
              <tr><td>QPS đỉnh</td><td><code>QPS × 2..3</code></td><td>Thiết kế theo con số này</td></tr>
              <tr><td>Storage</td><td><code>records/day × size × retention_days</code></td><td>Cộng thêm index ~30%</td></tr>
              <tr><td>Bandwidth</td><td><code>QPS × avg_payload_size × 8</code></td><td>bit/s, chia 10⁹ ra Gbps</td></tr>
              <tr><td>Cache size</td><td><code>hot_data × 20%</code> (Pareto)</td><td>80% traffic vào 20% data</td></tr>
              <tr><td>Số server</td><td><code>peak_QPS / QPS_per_server</code></td><td>Cộng 30–50% headroom</td></tr>
              <tr><td>Concurrent connections</td><td><code>QPS × avg_latency_s</code> (Little's Law)</td><td>Ví dụ 10K QPS × 0,1s = 1000</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Ví dụ đầy đủ: Twitter</h3>
        <p>Alex Xu dùng bài này trong Chương 2. Giả định: 300 triệu MAU, 50% dùng hằng ngày, 2 tweet/ngày, 10% tweet có media, lưu 5 năm.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">### Bước 1: QPS</span>
DAU            = 300M × 50% = 150M
Tweet QPS      = 150M × 2 / 86.400 ≈ 3.500 QPS    <span class="c-com">(write)</span>
Peak QPS       = 3.500 × 2 = 7.000 QPS
<span class="c-out">→ Cần ~10 server cho write tier (mỗi server 1K QPS)</span>

<span class="c-com">### Bước 2: Storage media</span>
Media/ngày     = 150M × 2 × 10% × 1MB = 30 TB/ngày
5 năm          = 30 TB × 365 × 5 ≈ 55 PB
<span class="c-out">→ Phải dùng object storage (S3) + CDN, KHÔNG dùng DB</span>

<span class="c-com">### Bước 3: Text storage</span>
Text/tweet     = 64 (id) + 140 (text) ≈ 300 bytes
Text/ngày      = 300M tweets × 300B ≈ 90 GB/ngày
5 năm          = 90 GB × 365 × 5 ≈ 164 TB
<span class="c-out">→ Vừa với cluster DB có sharding</span>

<span class="c-com">### Bước 4: Cache</span>
Hot tweets     = 20% × 300M/ngày × 300B ≈ 18 GB
<span class="c-out">→ 1–2 Redis node 32GB là đủ cho hot cache</span>

<span class="c-com">### Bước 5: Kết luận thiết kế</span>
• Feed read: hàng chục nghìn QPS → CDN + cache là bắt buộc
• Media: S3 + CloudFront, signed URL
• Tweet metadata: sharded MySQL/Cassandra theo user_id
• Fanout: hybrid push/pull cho user có nhiều follower</code></pre>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Kỹ thuật ước lượng nhanh</div>
            <p>Dùng <strong>lũy thừa 10</strong> thay vì số chính xác. 86.400 ≈ 10⁵. 300 triệu ≈ 3×10⁸. Nhân chia lũy thừa dễ hơn nhiều và sai số chỉ 15% — hoàn toàn chấp nhận được. Nếu bạn ra "10⁹ QPS" thay vì "10⁴ QPS" thì thiết kế sẽ sai hoàn toàn, còn 10⁴ vs 1,2×10⁴ thì không sao.</p>
          </div>
        </div>`
    },

    {
      id: 'scale', num: '1.4', title: 'Từ 1 server đến hàng triệu user (Alex Xu Ch.1)',
      html: `
        <p>Đây là lộ trình mở rộng kinh điển. Mỗi bước giải quyết một giới hạn cụ thể — hiểu <em>tại sao</em> cần bước đó quan trọng hơn thuộc tên.</p>

        <div class="diagram">
          <svg viewBox="0 0 720 420" role="img" aria-label="Lộ trình mở rộng hệ thống từ một server đến nhiều datacenter">
            <defs>
              <marker id="m1b" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#505a68"/></marker>
            </defs>
            <g font-size="10" font-weight="700">
              <!-- Row 1 -->
              <rect x="16" y="30" width="150" height="56" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
              <text x="91" y="52" text-anchor="middle" fill="#151515">① 1 Server</text>
              <text x="91" y="70" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">web+db+cache chung</text>

              <rect x="196" y="30" width="150" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="271" y="52" text-anchor="middle" fill="#151515">② Tách DB</text>
              <text x="271" y="70" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">web tier / data tier</text>

              <rect x="376" y="30" width="150" height="56" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
              <text x="451" y="52" text-anchor="middle" fill="#151515">③ Load Balancer</text>
              <text x="451" y="70" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">2+ web server</text>

              <rect x="556" y="30" width="150" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="631" y="52" text-anchor="middle" fill="#151515">④ DB Replication</text>
              <text x="631" y="70" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">master + slaves</text>

              <!-- Row 2 -->
              <rect x="556" y="130" width="150" height="56" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="631" y="152" text-anchor="middle" fill="#151515">⑤ Cache tier</text>
              <text x="631" y="170" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">Redis/Memcached</text>

              <rect x="376" y="130" width="150" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="451" y="152" text-anchor="middle" fill="#151515">⑥ CDN</text>
              <text x="451" y="170" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">static content</text>

              <rect x="196" y="130" width="150" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="271" y="152" text-anchor="middle" fill="#151515">⑦ Stateless web</text>
              <text x="271" y="170" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">session → Redis</text>

              <rect x="16" y="130" width="150" height="56" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
              <text x="91" y="152" text-anchor="middle" fill="#151515">⑧ Multi-DC</text>
              <text x="91" y="170" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">GeoDNS</text>

              <!-- Row 3 -->
              <rect x="16" y="230" width="150" height="56" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
              <text x="91" y="252" text-anchor="middle" fill="#151515">⑨ Message Queue</text>
              <text x="91" y="270" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">decouple + async</text>

              <rect x="196" y="230" width="150" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="271" y="252" text-anchor="middle" fill="#151515">⑩ Logging/Metrics</text>
              <text x="271" y="270" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">observability</text>

              <rect x="376" y="230" width="150" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="451" y="252" text-anchor="middle" fill="#151515">⑪ Automation</text>
              <text x="451" y="270" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">CI/CD, autoscale</text>

              <rect x="556" y="230" width="150" height="56" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
              <text x="631" y="252" text-anchor="middle" fill="#151515">⑫ Sharding</text>
              <text x="631" y="270" text-anchor="middle" fill="#505a68" font-size="9" font-weight="600">split data</text>
            </g>
            <g stroke="#505a68" stroke-width="1.6" marker-end="url(#m1b)" fill="none">
              <line x1="168" y1="58" x2="192" y2="58"/>
              <line x1="348" y1="58" x2="372" y2="58"/>
              <line x1="528" y1="58" x2="552" y2="58"/>
              <path d="M631 88 L631 126"/>
              <line x1="552" y1="158" x2="530" y2="158"/>
              <line x1="372" y1="158" x2="350" y2="158"/>
              <line x1="192" y1="158" x2="170" y2="158"/>
              <path d="M91 188 L91 226"/>
              <line x1="170" y1="258" x2="192" y2="258"/>
              <line x1="350" y1="258" x2="372" y2="258"/>
              <line x1="530" y1="258" x2="552" y2="258"/>
            </g>
            <text x="360" y="330" text-anchor="middle" font-size="10.5" font-weight="700" fill="#505a68">Mỗi bước giải quyết một giới hạn — không phải "cứ thêm cho đủ bộ"</text>
            <rect x="16" y="348" width="690" height="58" rx="8" fill="#f8fafc" stroke="#151515" stroke-width="2" stroke-dasharray="5 4"/>
            <text x="32" y="370" font-size="10" font-weight="700" fill="#151515">Thứ tự thực tế: ② → ③ → ④ → ⑤ → ⑥ → ⑦ là bắt buộc. ⑧ → ⑫ chỉ làm khi thật sự cần.</text>
            <text x="32" y="390" font-size="10" font-weight="600" fill="#505a68">Vẽ hết 12 bước trong phỏng vấn mà không giải thích lý do = điểm trừ (over-engineering).</text>
          </svg>
          <div class="diagram-cap">Hình 1.2 — 12 bước mở rộng của Alex Xu. Đây cũng là "bộ khung" để trả lời hầu hết bài toán thiết kế.</div>
        </div>

        <h3>Chi tiết từng bước — khi nào cần và tại sao</h3>
        <ol class="list-num">
          <li><strong>Single server</strong> — web app, DB, cache chung 1 máy. Đủ cho vài nghìn user. Giới hạn: không failover, không scale riêng phần nào.</li>
          <li><strong>Tách web tier / data tier</strong> — mỗi tier scale độc lập. Đây là bước quan trọng nhất về mặt kiến trúc.</li>
          <li><strong>Load balancer</strong> — user kết nối tới public IP của LB; web server dùng private IP. Lợi ích: failover (server chết → route sang server khác), thêm server không cần đổi DNS.</li>
          <li><strong>Database replication</strong> — master nhận write, slave nhận read. Tăng read throughput + có bản sao dự phòng. Vấn đề: <span class="kw">replication lag</span> → đọc có thể thấy dữ liệu cũ.</li>
          <li><strong>Cache tier</strong> — giảm tải DB, giảm latency. Cần chính sách expiration và chiến lược invalidation.</li>
          <li><strong>CDN</strong> — nội dung tĩnh (JS/CSS/ảnh/video) đặt gần user. Giảm RTT từ 150ms xuống 5–20ms.</li>
          <li><strong>Stateless web tier</strong> — chuyển session ra Redis/DB. Đây là <em>điều kiện tiên quyết</em> để autoscale: bất kỳ server nào cũng xử lý được request của bất kỳ user nào.</li>
          <li><strong>Multi-datacenter</strong> — GeoDNS route user tới DC gần nhất. Phức tạp: đồng bộ dữ liệu giữa các DC, xử lý conflict, traffic failover.</li>
          <li><strong>Message queue</strong> — decouple producer/consumer, xử lý async, chịu được burst. Producer không cần biết consumer là ai.</li>
          <li><strong>Logging, metrics, automation</strong> — không có observability thì không biết hệ thống có đang chạy đúng. Metrics + log tập trung + alerting.</li>
          <li><strong>Database sharding</strong> — khi 1 master không đủ chứa/ghi. Chọn shard key quyết định mọi thứ.</li>
          <li><strong>Tối ưu tiếp</strong> — tách service, CQRS, event sourcing... chỉ khi cần.</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Bẫy khi phỏng vấn</div>
            <p>Vẽ đủ 12 bước cho một hệ thống 10.000 user là <strong>over-engineering</strong> — một red flag Alex Xu nêu rõ. Hãy nói: "Với 10K user, em chỉ cần bước 1–4. Bước 5–7 em sẽ chuẩn bị sẵn về mặt thiết kế nhưng chưa triển khai."</p>
          </div>
        </div>`
    },

    {
      id: 'latency', num: '1.5', title: 'Latency, throughput và tail latency',
      html: `
        <p>Hai hệ thống có cùng average latency có thể có trải nghiệm người dùng hoàn toàn khác nhau. Đây là lý do <span class="kw">percentile</span> quan trọng hơn average.</p>

        <h3>Vì sao average đánh lừa bạn</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code>100 request, latency (ms):
1 request   : 5000 ms   <span class="c-com">← user này bỏ đi</span>
99 requests : 50 ms

Average = (5000 + 99×50) / 100 = 99,5 ms    <span class="c-com">← "trông ổn"</span>
P50     = 50 ms
P99     = 5000 ms                            <span class="c-com">← sự thật</span>

<span class="c-com"># Với page load gọi 10 service song song:</span>
P(at least 1 service chậm) = 1 - (1 - 0,01)^10 = 9,6%
<span class="c-out">→ 1% tail latency của 1 service = 10% user gặp chậm!</span></code></pre>
        </div>

        <h3>Nguyên nhân tail latency</h3>
        <ul class="list-bullet">
          <li><strong>Queueing</strong> — khi utilization &gt; 70%, thời gian chờ tăng phi tuyến tính (công thức M/M/1).</li>
          <li><strong>GC pause</strong> — stop-the-world của JVM/Go GC.</li>
          <li><strong>Hot shard / hot key</strong> — một partition nhận quá nhiều request.</li>
          <li><strong>Retry storm</strong> — client retry làm tăng tải, gây càng chậm.</li>
          <li><strong>Background job</strong> — compaction, backup chiếm I/O.</li>
        </ul>

        <h3>Cách xử lý</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Kỹ thuật</th><th>Cách làm</th><th>Đánh đổi</th></tr></thead>
            <tbody>
              <tr><td><span class="kw">Hedged request</span></td><td>Gửi request sang replica thứ 2 nếu quá P95, lấy cái về trước</td><td>Tăng tải 5–10%</td></tr>
              <tr><td><span class="kw">Bulkhead</span></td><td>Tách pool riêng cho từng dependency</td><td>Tốn tài nguyên hơn</td></tr>
              <tr><td><span class="kw">Timeout + fallback</span></td><td>Trả dữ liệu cache thay vì chờ</td><td>Có thể stale</td></tr>
              <tr><td><span class="kw">Backpressure</span></td><td>Từ chối sớm (429) thay vì xếp hàng vô hạn</td><td>Giảm throughput</td></tr>
              <tr><td><span class="kw">Jitter</span></td><td>Random hoá thời gian retry/refresh</td><td>Không</td></tr>
            </tbody>
          </table>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">python</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># Exponential backoff + full jitter — chuẩn cho retry</span>
<span class="c-key">import</span> random, time

<span class="c-key">def</span> <span class="c-fn">retry_with_backoff</span>(fn, max_attempts=<span class="c-num">5</span>, base=<span class="c-num">0.1</span>, cap=<span class="c-num">10</span>):
    <span class="c-key">for</span> attempt <span class="c-key">in</span> range(max_attempts):
        <span class="c-key">try</span>:
            <span class="c-key">return</span> fn()
        <span class="c-key">except</span> TransientError:
            <span class="c-key">if</span> attempt == max_attempts - <span class="c-num">1</span>:
                <span class="c-key">raise</span>
            <span class="c-com"># full jitter: sleep ngẫu nhiên trong [0, exp]</span>
            exp = min(cap, base * <span class="c-num">2</span> ** attempt)
            sleep = random.uniform(<span class="c-num">0</span>, exp)
            time.sleep(sleep)

<span class="c-com"># Không có jitter → tất cả client retry cùng lúc → thundering herd</span>
<span class="c-com"># Có jitter → tải trải đều theo thời gian</span></code></pre>
        </div>`
    },

    {
      id: 'url-shortener', num: '1.6', title: 'Ví dụ đầy đủ: URL Shortener (TinyURL)',
      html: `
        <p>Bài toán đầu tiên ai cũng học. Nhưng nhiều người trả lời sai ở phần <span class="kw">hash collision</span> và <span class="kw">301 vs 302</span>.</p>

        <h3>Bước 1 — Requirements</h3>
        <ul class="list-bullet">
          <li><strong>Functional:</strong> tạo short URL từ long URL; redirect short → long.</li>
          <li><strong>Non-functional:</strong> high availability, low latency redirect, không cho xoá/sửa.</li>
          <li><strong>Scale:</strong> 100 triệu URL/ngày (write), tỉ lệ read:write = 10:1.</li>
        </ul>

        <h3>Bước 2 — Ước lượng</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code>Write QPS  = 100M / 86.400 ≈ 1.160 QPS
Read QPS   = 1.160 × 10    ≈ 11.600 QPS
10 năm     = 100M × 365 × 10 = 365 tỉ bản ghi
Storage    = 365 × 10⁹ × 100 bytes ≈ 36,5 TB (chưa tính index)
<span class="c-out">→ 36,5 TB vừa một cluster, KHÔNG cần sharding ngay</span>
<span class="c-out">→ Nhưng 11.600 read QPS cần cache + replica</span>

<span class="c-com"># Độ dài code: base62, cần chứa 365 tỉ</span>
62^6 = 56,8 × 10⁹   <span class="c-com">← 56 tỉ, KHÔNG đủ</span>
62^7 = 3,52 × 10¹²  <span class="c-com">← 3,5 nghìn tỉ, ĐỦ ✓</span>
<span class="c-out">→ Cần 7 ký tự base62</span></code></pre>
        </div>

        <h3>Bước 3 — API</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">http</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-key">POST</span> /api/v1/data/shorten
<span class="c-key">Content-Type</span>: application/json
{ "longUrl": "https://example.com/very/long/path?q=1" }

<span class="c-key">201 Created</span>
{ "shortUrl": "https://sho.rt/aB3xK9p" }

<span class="c-key">GET</span> /{code}
<span class="c-key">301 Moved Permanently</span>   <span class="c-com">hoặc</span> <span class="c-key">302 Found</span>
<span class="c-key">Location</span>: https://example.com/very/long/path?q=1</code></pre>
        </div>

        <h3>301 vs 302 — câu hỏi phân biệt ứng viên giỏi</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>301 Permanent</th><th>302 Found (temporary)</th></tr></thead>
            <tbody>
              <tr><td>Browser cache</td><td>Có, cache vĩnh viễn</td><td>Không cache (hoặc cache ngắn)</td></tr>
              <tr><td>Tải lên server</td><td>Giảm mạnh (browser không gọi lại)</td><td>Mỗi click đều gọi server</td></tr>
              <tr><td>Analytics</td><td><strong>Mất</strong> — không đếm được click</td><td><strong>Đếm được</strong> mọi click</td></tr>
              <tr><td>Dùng khi</td><td>URL cố định, ưu tiên hiệu năng</td><td>Cần tracking, URL có thể đổi</td></tr>
            </tbody>
          </table>
        </div>
        <p>Với dịch vụ short link thương mại (bit.ly), họ dùng <strong>302</strong> vì cần đếm click cho analytics. Nếu bạn chọn 301, hãy nói rõ lý do: "ưu tiên giảm tải, chấp nhận mất analytics".</p>

        <h3>Bước 4 — Thiết kế chi tiết</h3>

        <div class="diagram">
          <svg viewBox="0 0 720 300" role="img" aria-label="Kiến trúc URL shortener với cache và replication">
            <defs><marker id="m1c" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 9 3.5, 0 7" fill="#505a68"/></marker></defs>
            <g font-size="10" font-weight="700">
              <rect x="14" y="120" width="92" height="52" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="60" y="142" text-anchor="middle" fill="#151515">Client</text>
              <text x="60" y="158" text-anchor="middle" fill="#505a68" font-size="8.5" font-weight="600">browser/app</text>

              <rect x="130" y="112" width="104" height="68" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="182" y="138" text-anchor="middle" fill="#151515">Load</text>
              <text x="182" y="152" text-anchor="middle" fill="#151515">Balancer</text>
              <text x="182" y="168" text-anchor="middle" fill="#505a68" font-size="8.5" font-weight="600">L7, health check</text>

              <rect x="258" y="104" width="108" height="34" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="312" y="126" text-anchor="middle" fill="#151515" font-size="9.5">Service 1</text>
              <rect x="258" y="146" width="108" height="34" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="312" y="168" text-anchor="middle" fill="#151515" font-size="9.5">Service 2</text>
              <rect x="258" y="188" width="108" height="34" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="312" y="210" text-anchor="middle" fill="#151515" font-size="9.5">Service N</text>

              <rect x="392" y="130" width="104" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="444" y="153" text-anchor="middle" fill="#151515">Cache</text>
              <text x="444" y="169" text-anchor="middle" fill="#505a68" font-size="8.5" font-weight="600">Redis, 90% hit</text>

              <rect x="522" y="96" width="88" height="44" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="566" y="114" text-anchor="middle" fill="#151515" font-size="9.5">Master</text>
              <text x="566" y="129" text-anchor="middle" fill="#505a68" font-size="8" font-weight="600">write</text>

              <rect x="522" y="152" width="88" height="34" rx="7" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
              <text x="566" y="173" text-anchor="middle" fill="#151515" font-size="9.5">Replica 1</text>
              <rect x="522" y="192" width="88" height="34" rx="7" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
              <text x="566" y="213" text-anchor="middle" fill="#151515" font-size="9.5">Replica 2</text>

              <rect x="632" y="130" width="74" height="56" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
              <text x="669" y="150" text-anchor="middle" fill="#151515" font-size="9">ID</text>
              <text x="669" y="163" text-anchor="middle" fill="#151515" font-size="9">Generator</text>
              <text x="669" y="177" text-anchor="middle" fill="#505a68" font-size="8" font-weight="600">Snowflake</text>
            </g>
            <g stroke="#505a68" stroke-width="1.6" marker-end="url(#m1c)" fill="none">
              <line x1="108" y1="146" x2="126" y2="146"/>
              <path d="M236 138 L254 122"/><path d="M236 146 L254 163"/><path d="M236 154 L254 204"/>
              <path d="M368 122 L388 148"/>
              <path d="M498 148 L518 120"/>
              <path d="M498 155 L518 168"/>
              <path d="M498 162 L518 208"/>
              <path d="M494 130 L628 152"/>
            </g>
            <text x="360" y="264" text-anchor="middle" font-size="10" font-weight="600" fill="#505a68">Read path: Client → LB → Service → Cache → (miss) → Replica</text>
            <text x="360" y="282" text-anchor="middle" font-size="10" font-weight="600" fill="#505a68">Write path: Client → LB → Service → ID Generator → Master</text>
          </svg>
          <div class="diagram-cap">Hình 1.3 — Luồng đọc và ghi tách biệt. Cache hấp thụ 90% read, replica 2× read capacity.</div>
        </div>

        <h3>Sinh code — hai cách tiếp cận</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>Hash + base62</th><th>Counter + base62</th></tr></thead>
            <tbody>
              <tr><td>Cách làm</td><td><code>base62(md5(longUrl))[:7]</code></td><td>ID tăng dần → base62</td></tr>
              <tr><td>Collision</td><td><strong>Có</strong> — phải retry hoặc dùng hash + salt</td><td>Không bao giờ</td></tr>
              <tr><td>Độ dài</td><td>Cố định 7</td><td>Tăng dần (1 → 7 ký tự)</td></tr>
              <tr><td>Đoán trước</td><td>Khó</td><td><strong>Dễ</strong> — có thể enumerate URL của người khác</td></tr>
              <tr><td>Distributed</td><td>Dễ (stateless)</td><td>Cần ID generator (Snowflake, ZooKeeper)</td></tr>
            </tbody>
          </table>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">python</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code>BASE62 = <span class="c-str">"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"</span>

<span class="c-key">def</span> <span class="c-fn">to_base62</span>(n: int) -> str:
    <span class="c-key">if</span> n == <span class="c-num">0</span>: <span class="c-key">return</span> BASE62[<span class="c-num">0</span>]
    out = []
    <span class="c-key">while</span> n:
        out.append(BASE62[n % <span class="c-num">62</span>])
        n //= <span class="c-num">62</span>
    <span class="c-key">return</span> <span class="c-str">""</span>.join(reversed(out))

<span class="c-com"># Cách 1: hash — có collision</span>
<span class="c-key">def</span> <span class="c-fn">shorten_hash</span>(long_url: str, salt: int = <span class="c-num">0</span>) -> str:
    h = hashlib.md5(f<span class="c-str">"{long_url}{salt}"</span>.encode()).hexdigest()
    <span class="c-key">return</span> to_base62(int(h[:<span class="c-num">12</span>], <span class="c-num">16</span>))[:<span class="c-num">7</span>]

<span class="c-key">def</span> <span class="c-fn">create_url</span>(long_url: str) -> str:
    <span class="c-key">for</span> attempt <span class="c-key">in</span> range(<span class="c-num">5</span>):
        code = shorten_hash(long_url, salt=attempt)
        <span class="c-com"># INSERT ... nếu conflict thì thử salt tiếp theo</span>
        <span class="c-key">if</span> db.insert_if_absent(code, long_url):
            <span class="c-key">return</span> code
    <span class="c-key">raise</span> RuntimeError(<span class="c-str">"collision không giải quyết được"</span>)

<span class="c-com"># Cách 2: Snowflake ID — không collision, nhưng đoán được</span>
<span class="c-com"># 64 bit = 41 timestamp + 10 machine + 12 sequence</span>
<span class="c-key">def</span> <span class="c-fn">snowflake</span>(machine_id: int, seq: int) -> int:
    <span class="c-key">return</span> (int(time.time()*<span class="c-num">1000</span>) - EPOCH) &lt;&lt; <span class="c-num">22</span> | \
           (machine_id &amp; <span class="c-num">0x3FF</span>) &lt;&lt; <span class="c-num">12</span> | (seq &amp; <span class="c-num">0xFFF</span>)</code></pre>
        </div>

        <h3>Schema</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">sql</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-key">CREATE TABLE</span> urls (
  code         <span class="c-key">VARCHAR</span>(<span class="c-num">8</span>)  <span class="c-key">PRIMARY KEY</span>,   <span class="c-com">-- 7 chars base62</span>
  long_url     <span class="c-key">TEXT</span>         <span class="c-key">NOT NULL</span>,
  user_id      <span class="c-key">BIGINT</span>,
  created_at   <span class="c-key">TIMESTAMP</span>    <span class="c-key">DEFAULT</span> now(),
  expires_at   <span class="c-key">TIMESTAMP</span>    <span class="c-key">NULL</span>,
  click_count  <span class="c-key">BIGINT</span>       <span class="c-key">DEFAULT</span> <span class="c-num">0</span>
);

<span class="c-com">-- Chỉ cần 1 unique index trên PK, redirect là lookup O(1)</span>
<span class="c-com">-- Nếu cần "URL của tôi": thêm index (user_id, created_at DESC)</span>
<span class="c-key">CREATE INDEX</span> idx_urls_user <span class="c-key">ON</span> urls(user_id, created_at <span class="c-key">DESC</span>);</code></pre>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Điểm cộng khi phỏng vấn</div>
            <p>Chủ động nêu: (1) <strong>custom alias</strong> — user tự đặt code, cần check uniqueness và reserved words; (2) <strong>rate limiting</strong> theo user để chống spam; (3) <strong>expiration</strong> — dùng TTL hoặc background job quét; (4) <strong>abuse detection</strong> — chặn URL độc hại bằng Google Safe Browsing API.</p>
          </div>
        </div>`
    },

    {
      id: 'thinking', num: '1.7', title: 'Cách trình bày trade-off như senior',
      html: `
        <p>Đây là kỹ năng khó nhất và cũng quan trọng nhất. Junior nói "em dùng Kafka". Senior nói "em cân nhắc Kafka và SQS, chọn SQS vì...".</p>

        <h3>Cấu trúc một câu trả lời trade-off</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code>1. QUYẾT ĐỊNH:  "Em chọn X cho thành phần này."
2. LÝ DO:      "Vì yêu cầu là Y, và X đáp ứng tốt nhất."
3. ĐÁNH ĐỔI:   "Cái giá là Z — cụ thể là ..."
4. GIẢM THIỂU: "Để giảm Z, em sẽ ..."
5. PHƯƠNG ÁN B: "Nếu quy mô tăng gấp 10, em sẽ chuyển sang W."

<span class="c-com"># Ví dụ thực tế:</span>
"Em chọn Postgres cho user service.
 Vì cần transaction và quan hệ rõ ràng, lượng user 10M vẫn trong
 khả năng của 1 cluster có read replica.
 Đánh đổi: write bị giới hạn ~5K QPS trên 1 master.
 Giảm thiểu: shard theo user_id khi vượt 3K QPS write, và dùng
 connection pool (PgBouncer) để giảm overhead.
 Phương án B: nếu cần multi-region active-active, em sẽ dùng
 CockroachDB hoặc chuyển sang Cassandra cho phần không cần transaction."</code></pre>
        </div>

        <h3>Từ vựng phải dùng đúng</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Từ</th><th>Nghĩa chính xác</th><th>Sai thường gặp</th></tr></thead>
            <tbody>
              <tr><td>Scalable</td><td>Có thể thêm tài nguyên để chịu tải cao hơn</td><td>Nhầm với "nhanh"</td></tr>
              <tr><td>Available</td><td>Luôn phản hồi (kể cả trả lỗi?)</td><td>Nhầm với "đúng"</td></tr>
              <tr><td>Consistent</td><td>Mọi reader thấy cùng dữ liệu</td><td>Nhầm với "ACID C"</td></tr>
              <tr><td>Idempotent</td><td>Gọi 1 lần hay N lần kết quả như nhau</td><td>Nhầm với "retry được"</td></tr>
              <tr><td>Stateless</td><td>Server không giữ state giữa các request</td><td>Nhầm với "không có DB"</td></tr>
              <tr><td>Partition tolerant</td><td>Vẫn hoạt động khi mạng đứt</td><td>Nhầm với "có sharding"</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Các câu hỏi tự vấn trước khi chốt thiết kế</h3>
        <ul class="list-check">
          <li>Nếu thành phần này chết, điều gì xảy ra? Có single point of failure không?</li>
          <li>Khi traffic tăng 10×, chỗ nào vỡ trước? Cách scale nó?</li>
          <li>Dữ liệu có thể mất/trùng/không nhất quán ở đâu? Chấp nhận được không?</li>
          <li>Làm sao biết hệ thống đang lỗi? Metric nào? Alert cho ai?</li>
          <li>Chi phí hạ tầng ước tính bao nhiêu/tháng?</li>
          <li>Nếu phải bỏ 1 thành phần để giảm độ phức tạp, bỏ cái nào?</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Câu chốt hạ luôn gây ấn tượng</div>
            <p>"Nếu em có thêm thời gian, em sẽ <strong>bỏ bớt</strong> thành phần X vì nó chưa cần thiết ở quy mô này." — Người phỏng vấn đánh giá rất cao khả năng <em>không</em> over-engineer.</p>
          </div>
        </div>`
    }
  ],

  quiz: [
    {
      q: 'Bạn được yêu cầu thiết kế hệ thống cho 1 triệu DAU. Bước đầu tiên bạn làm gì?',
      a: 'Hỏi để làm rõ yêu cầu (functional + non-functional) TRƯỚC KHI vẽ bất cứ thứ gì. Cụ thể: tính năng nào là cốt lõi, tỉ lệ đọc/ghi, latency mục tiêu, dữ liệu lưu bao lâu, có cần multi-region không. Sau đó viết giả định ra giấy rồi mới ước lượng QPS/storage. Nhảy vào vẽ kiến trúc ngay là red flag lớn nhất trong phỏng vấn system design.'
    },
    {
      q: 'Tính storage cho dịch vụ ảnh: 50 triệu ảnh/ngày, mỗi ảnh 500KB, lưu 3 năm. Cần loại storage gì?',
      a: '50M × 500KB = 25 TB/ngày. 3 năm = 25 TB × 365 × 3 ≈ 27 PB. Con số này loại bỏ hoàn toàn block storage hoặc DB thông thường — phải dùng object storage (S3/GCS) vì: (1) rẻ hơn ~10× so với EBS, (2) scale gần như vô hạn, (3) tích hợp CDN sẵn. Metadata (id, owner, size, url) đặt trong DB, ảnh đặt trong S3, phục vụ qua CDN (CloudFront/Cloudflare) để giảm egress cost và latency.'
    },
    {
      q: 'Vì sao "average latency" là chỉ số nguy hiểm để đánh giá hệ thống?',
      a: 'Vì phân phối latency có đuôi dài (long tail). 1% request chậm 5 giây có thể bị che khuất bởi 99% request nhanh 50ms, cho average đẹp ~100ms. Nhưng với một page load gọi 10 service song song, xác suất ít nhất 1 service chậm là 1-(0,99)^10 ≈ 9,6% — nghĩa là gần 10% user thực sự gặp trải nghiệm tệ. Phải đo và tối ưu P95/P99, không phải average.'
    },
    {
      q: 'Với URL shortener dùng hash base62, điều gì xảy ra khi 2 URL khác nhau cho cùng 7 ký tự? Bạn xử lý thế nào?',
      a: 'Đó là hash collision. Với 7 ký tự base62 (3,5×10¹² không gian) và 365 tỉ URL trong 10 năm, xác suất collision theo birthday paradox là đáng kể. Cách xử lý: (1) khi INSERT bị vi phạm unique constraint, thêm salt vào input và hash lại, retry tối đa N lần; (2) hoặc dùng counter/Snowflake ID để không bao giờ collision nhưng phải chấp nhận URL có thể đoán được; (3) hoặc kết hợp: hash trước, nếu fail thì fallback sang ID generator. Trong phỏng vấn nên nêu cả 2 hướng và trade-off về khả năng enumerate.'
    },
    {
      q: 'Hệ thống của bạn gọi 3 microservice, mỗi cái có availability 99,95%. Availability tổng là bao nhiêu và bạn cải thiện thế nào?',
      a: 'Với phụ thuộc nối tiếp: 0,9995³ ≈ 99,85% — tệ hơn từng service, tương đương ~13 giờ downtime/năm. Cải thiện: (1) thêm fallback/graceful degradation — nếu service gợi ý chết thì vẫn hiển thị feed không có gợi ý; (2) cache kết quả để giảm phụ thuộc; (3) circuit breaker để không chờ service chết; (4) nếu bắt buộc phải có, thêm redundancy song song: 1-(0,0005)² ≈ 99,999975% cho từng service.'
    }
  ]
};

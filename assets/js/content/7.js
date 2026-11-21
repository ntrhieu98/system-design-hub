/* ============================================================
   Module 7 — Interview Practice
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[7] = {
  title: 'Module 7 — Luyện phỏng vấn',
  lead: 'Bạn đã có kiến thức. Buổi phỏng vấn system design không kiểm tra bạn <em>biết</em> bao nhiêu mà kiểm tra bạn <span class="kw">điều khiển cuộc hội thoại</span> thế nào trong 45 phút. Module này là phần huấn luyện: khung thời gian, cách nói trade-off, cách xử lý khi bị hỏi khó, và checklist trước khi kết thúc.',

  keywords: [
    { term: 'Khung 45 phút', def: '5\' yêu cầu → 5\' ước lượng → 10\' thiết kế cao tầng → 15\' đi sâu 2 thành phần → 5\' scale & failure → 5\' trade-off & wrap-up. Đây là phân bổ nên tập, không phải luật cứng.' },
    { term: 'Functional requirements', def: 'Hệ thống LÀM ĐƯỢC gì. "User đăng ảnh, follow người khác, xem feed". Phải chốt với interviewer trước khi vẽ — đây là bước hay bị bỏ qua nhất.' },
    { term: 'Non-functional requirements', def: 'Hệ thống phải TỐT đến mức nào: số user, QPS, latency, availability, consistency. Nêu con số cụ thể, đừng nói "nhanh và ổn định".' },
    { term: 'Out of scope', def: 'Những gì bạn chủ động KHÔNG làm. Nói rõ giúp bạn kiểm soát phạm vi và thể hiện bạn biết đánh đổi. Ví dụ: "Tôi bỏ qua phần thanh toán, giả định đã có."' },
    { term: 'Back-of-envelope', def: 'Tính nhanh QPS, storage, bandwidth với số tròn. Mục đích không phải con số đúng tuyệt đối mà chứng minh bạn biết cái gì quyết định kiến trúc.' },
    { term: 'Tiến hoá thiết kế', def: 'Bắt đầu đơn giản (1 server + 1 DB), rồi nêu điểm nghẽn và cách xử lý. Cách này luôn tốt hơn vẽ ngay 15 component từ đầu — thể hiện tư duy thực tế.' },
    { term: 'Nói trade-off', def: 'Mỗi lựa chọn nên có "tôi chọn X vì..., nhưng đánh đổi Y". Không có lựa chọn miễn phí. Câu "nó tuỳ" mà không giải thích là câu trả lời kém.' },
    { term: 'Deep dive', def: 'Interviewer chọn 1–2 thành phần để hỏi sâu. Bạn phải biết chi tiết đến mức data model + con số, không chỉ tên công nghệ.' },
    { term: 'Bottleneck', def: 'Thành phần chịu tải nặng nhất hoặc dễ hỏng nhất. Luôn chủ động nêu — đừng chờ bị hỏi. "Bottleneck tiếp theo sẽ là X vì..."' },
    { term: 'Single point of failure', def: 'Thành phần mà nếu chết thì cả hệ thống chết. Chỉ ra và nêu cách xử lý: redundancy, failover, degradation.' },
    { term: 'Graceful degradation', def: 'Hệ thống vẫn phục vụ được (kém hơn) khi một phần hỏng. Ví dụ: không có recommendation thì hiển thị "phổ biến" thay vì lỗi trang.' },
    { term: 'CAP trong ngữ cảnh', def: 'Không nói "chọn CP" chung chung — nói theo từng entity: "thanh toán CP, feed AP". Đây là dấu hiệu rõ nhất của người hiểu sâu.' },
    { term: 'Clarifying question', def: 'Câu hỏi làm rõ trước khi trả lời. Tốt: "Hệ thống có cần read-your-writes không?". Kém: hỏi lại điều đã nói trong đề.' },
    { term: 'Drive the conversation', def: 'Bạn dẫn dắt, không chờ bị dẫn. Nêu ra vấn đề trước khi được hỏi, đề xuất bước tiếp theo. Interviewer đánh giá cao người chủ động có cấu trúc.' },
    { term: 'Red flag', def: 'Điều làm mất điểm: nhảy vào giải pháp, không ước lượng, không nói failure mode, không biết khi nào dừng, hoặc phủ nhận trade-off ("cách của tôi không có nhược điểm").' }
  ],

  sections: [
    {
      id: 'framework', num: '7.1', title: 'Khung 45 phút — phân bổ thời gian và những gì phải nói',
      html: `
        <p>Buổi phỏng vấn system design là một bài tập <span class="kw">quản lý thời gian có cấu trúc</span>. Người trượt thường không phải vì thiếu kiến thức mà vì dùng 30 phút để vẽ diagram rồi hết giờ ở phần quan trọng nhất: trade-off và failure.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 300" role="img" aria-label="Phân bổ 45 phút phỏng vấn system design thành sáu giai đoạn với tỉ lệ thời gian">
            <defs>
              <marker id="m7a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">45 PHÚT — PHÂN BỔ VÀNG</text>

            <rect x="16" y="36" width="84" height="52" rx="7" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="58" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">0–5'</text>
            <text x="58" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Requirements</text>

            <rect x="108" y="36" width="84" height="52" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="150" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">5–10'</text>
            <text x="150" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Estimation</text>

            <rect x="200" y="36" width="152" height="52" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="276" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">10–20'</text>
            <text x="276" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">High-level design</text>

            <rect x="360" y="36" width="176" height="52" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="448" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">20–35'</text>
            <text x="448" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Deep dive 2 thành phần</text>

            <rect x="544" y="36" width="110" height="52" rx="7" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="599" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">35–41'</text>
            <text x="599" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Scale & failure</text>

            <rect x="662" y="36" width="82" height="52" rx="7" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="703" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">41–45'</text>
            <text x="703" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Wrap-up</text>

            <rect x="16" y="108" width="728" height="66" rx="8" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Giai đoạn 1 — Requirements (5') — đừng bỏ qua</text>
            <text x="34" y="148" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Functional: 3–5 tính năng chính (chốt với interviewer). Non-functional: DAU, QPS read/write, latency, availability, consistency.</text>
            <text x="34" y="164" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">Sai lầm: nhảy vào vẽ ngay. Mất 10 phút sau phải làm lại vì hiểu sai đề.</text>

            <rect x="16" y="182" width="728" height="48" rx="8" fill="#f8fafc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="204" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Giai đoạn 2 — Estimation (5')</text>
            <text x="34" y="222" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">QPS, storage/năm, bandwidth, cache size. Viết ra giấy. Chỉ cần 2–3 chữ số có nghĩa: 1.160 QPS, 36,5 TB.</text>

            <rect x="16" y="238" width="728" height="46" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="258" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Nguyên tắc xuyên suốt</text>
            <text x="34" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Nói to suy nghĩ. Mỗi lựa chọn kèm trade-off. Chủ động nêu bottleneck trước khi bị hỏi. Không im lặng quá 30 giây.</text>
          </svg>
          <div class="diagram-cap">Hình 7.1 — Phân bổ thời gian: dành 25/45 phút cho high-level và deep dive, không phải cho requirement</div>
        </div>

        <h3>Kịch bản cụ thể 5 phút đầu</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SCRIPT</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Bạn nói, không phải interviewer hỏi</span>

<span class="c-str">"Trước khi thiết kế, tôi muốn chốt phạm vi. Tôi hiểu đề là X — đúng không?</span>
<span class="c-str"> Tôi sẽ tập trung vào 3 tính năng: (1)…, (2)…, (3)…</span>
<span class="c-str"> Và tôi chủ động bỏ ra ngoài phạm vi: thanh toán, moderation — giả định đã có."</span>

<span class="c-str">"Về quy mô, tôi giả định: 100 triệu DAU, mỗi user đọc 10 lần/ngày</span>
<span class="c-str"> → 1 tỷ read/ngày → ~11.600 QPS read. Write ít hơn 10 lần</span>
<span class="c-str"> → ~1.160 QPS. Dung lượng 10 năm khoảng 36 TB.</span>
<span class="c-str"> Con số này ảnh hưởng thế nào? Với 11k QPS tôi cần cache và</span>
<span class="c-str"> read replica, nhưng chưa cần shard. Anh/chị muốn tôi đi tiếp</span>
<span class="c-str"> theo hướng này không?"</span>

<span class="c-com">// Câu hỏi cuối rất quan trọng: tạo cơ hội interviewer điều chỉnh</span>
<span class="c-com">// và thể hiện bạn làm việc hợp tác, không độc diễn</span></code></pre>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Ba sai lầm thời gian chết người</div>
            <p><strong>1. Dành 15 phút cho requirements.</strong> Bạn đang hỏi những câu mà interviewer nghĩ là hiển nhiên. Chốt nhanh, ghi ra 5 dòng, đi tiếp. <strong>2. Vẽ quá chi tiết ở high-level.</strong> Đừng vẽ 20 box với label đầy đủ — vẽ 6–8 box, nói rõ luồng, rồi để dành thời gian cho deep dive. Bạn không được điểm vì diagram đẹp. <strong>3. Không dành thời gian cho failure mode.</strong> Đây là phần phân biệt senior với middle. Nếu hết giờ trước khi nói "điều gì xảy ra khi X chết", bạn mất điểm lớn.</p>
          </div>
        </div>

        <h3>Cấu trúc câu trả lời cho mỗi thành phần</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Bước</th><th>Nói gì</th><th>Ví dụ (cache)</th></tr></thead>
            <tbody>
              <tr><td>1. Mục đích</td><td>Nó giải quyết vấn đề gì</td><td>"Giảm tải DB vì 95% request là read lặp lại."</td></tr>
              <tr><td>2. Lựa chọn</td><td>2–3 phương án</td><td>"Cache-aside, write-through, hoặc write-behind."</td></tr>
              <tr><td>3. Chọn & lý do</td><td>Chọn một, nói tại sao</td><td>"Cache-aside vì workload đọc nhiều, chấp nhận stale 60s."</td></tr>
              <tr><td>4. Chi tiết</td><td>Số liệu, key design, TTL</td><td>"Redis 64GB, key = user:{id}, TTL 300s ± 10% jitter."</td></tr>
              <tr><td>5. Rủi ro</td><td>Điều gì có thể sai</td><td>"Cache stampede khi key hot hết hạn → single-flight lock."</td></tr>
            </tbody>
          </table>
        </div>
        <p>Năm bước này áp dụng được cho <em>mọi</em> thành phần: LB, queue, search, DB, CDN. Tập nói theo cấu trúc này đến khi thành phản xạ.</p>
      `
    },

    {
      id: 'requirements', num: '7.2', title: 'Requirements & estimation — phần quyết định một nửa điểm',
      html: `
        <p>Nhiều ứng viên nghĩ đây là phần "khởi động" không quan trọng. Sai. Đây là nơi interviewer đánh giá bạn có <span class="kw">tư duy kỹ sư</span> hay chỉ thuộc lòng template.</p>

        <h3>Bộ câu hỏi làm rõ — chọn 5–7, đừng hỏi hết</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nhóm</th><th>Câu hỏi</th><th>Tại sao quan trọng</th></tr></thead>
            <tbody>
              <tr><td rowspan="3"><strong>Chức năng</strong></td><td>"Ai là người dùng chính? Có loại user đặc biệt (admin, creator)?"</td><td>Creator/celebrity thay đổi toàn bộ thiết kế fan-out</td></tr>
              <tr><td>"3 tính năng nào quan trọng nhất? Tôi sẽ bỏ phần còn lại."</td><td>Kiểm soát phạm vi — không bao giờ làm hết trong 45 phút</td></tr>
              <tr><td>"Có cần realtime không, hay eventual (trễ vài giây) được?"</td><td>Quyết định WebSocket vs polling, đồng bộ vs async</td></tr>
              <tr><td rowspan="3"><strong>Quy mô</strong></td><td>"Bao nhiêu DAU? Tỉ lệ read/write?"</td><td>Quyết định cache, replica, shard</td></tr>
              <tr><td>"Dữ liệu giữ bao lâu? Có cần xoá theo yêu cầu user không?"</td><td>Ảnh hưởng storage, partition, GDPR</td></tr>
              <tr><td>"Peak traffic gấp mấy lần trung bình?"</td><td>Capacity planning — thường 2–3×, sự kiện có thể 10×</td></tr>
              <tr><td rowspan="3"><strong>Chất lượng</strong></td><td>"Latency mục tiêu là bao nhiêu? p99 hay trung bình?"</td><td>p99 &lt; 100ms khác hoàn toàn p50 &lt; 100ms</td></tr>
              <tr><td>"Availability cần bao nhiêu số 9?"</td><td>99,9% (43 phút/tháng) vs 99,99% (4 phút) khác nhau 10× chi phí</td></tr>
              <tr><td>"Có cần nhất quán mạnh ở đâu không?"</td><td>Thanh toán vs feed — quyết định CAP per entity</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Bốn câu hỏi "ăn điểm" ít người hỏi</div>
            <p><strong>1.</strong> "Hệ thống này là greenfield hay đang chạy và cần migration?" — nếu là hệ thống có sẵn, câu trả lời hoàn toàn khác (không thể chọn DB mới dễ dàng). <strong>2.</strong> "Có yêu cầu multi-region/compliance (dữ liệu phải ở Việt Nam) không?" — thể hiện bạn nghĩ đến ràng buộc thật. <strong>3.</strong> "Thành công của hệ thống này đo bằng gì — DAU, doanh thu, hay độ trễ?" — cho thấy bạn hiểu business context. <strong>4.</strong> "Ngân sách hạ tầng có ràng buộc không?" — hầu hết ứng viên không bao giờ hỏi, nhưng đó là ràng buộc thật của mọi hệ thống.</p>
          </div>
        </div>

        <h3>Estimation — công thức và số phải thuộc</h3>
        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Bộ số cần nhớ</div>
            <p><strong>1 ngày</strong> = 86.400s ≈ 10⁵. <strong>1 tháng</strong> ≈ 2,6×10⁶s. <strong>1 năm</strong> ≈ 3,15×10⁷s. <strong>1 triệu request/ngày</strong> ≈ 12 QPS. <strong>1 tỷ/ngày</strong> ≈ 11.600 QPS. <strong>1 KB</strong> × 1 tỷ = 1 TB. <strong>1 byte</strong> × 1 tỷ/ngày × 1 năm = 365 GB. Latency: RAM 100ns, SSD 100µs, disk seek 10ms, cùng DC 0,5ms, cross-AZ 1ms, cross-region 50–150ms, cross-continent 150–300ms.</p>
          </div>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">ESTIMATION</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Template 6 dòng, dùng cho mọi bài</span>

<span class="c-com">1. QPS write</span>  = writes_per_day / 86_400
<span class="c-com">2. QPS read</span>   = QPS_write * read_write_ratio
<span class="c-com">3. Peak QPS</span>   = QPS * 2..3
<span class="c-com">4. Storage/y</span>  = writes_per_day * 365 * bytes_per_record
<span class="c-com">5. Bandwidth</span>  = QPS * avg_response_bytes
<span class="c-com">6. Cache size</span> = hot_data_ratio * total_storage * 1.2

<span class="c-com">// Ví dụ: news feed, 150M DAU, 500M tweet/ngày, 200 byte/tweet</span>
<span class="c-num">1</span>. write = 500M / 86.400          ≈ <span class="c-num">5.800</span> QPS
<span class="c-num">2</span>. read  = 150M * <span class="c-num">10</span> / 86.400      ≈ <span class="c-num">17.400</span> QPS  (10 lần mở app/ngày)
<span class="c-num">3</span>. peak  = <span class="c-num">17.400</span> * <span class="c-num">3</span>             ≈ <span class="c-num">52.000</span> QPS
<span class="c-num">4</span>. store = 500M * <span class="c-num">365</span> * <span class="c-num">200</span>B     ≈ <span class="c-num">36</span> TB/năm (text only)
<span class="c-num">5</span>. bw    = <span class="c-num">52.000</span> * <span class="c-num">20</span>KB           ≈ <span class="c-num">1</span> GB/s  → cần CDN/many nodes
<span class="c-num">6</span>. cache = <span class="c-num">10</span>% * <span class="c-num">36</span>TB * <span class="c-num">1</span>.<span class="c-num">2</span>       ≈ <span class="c-num">4</span>.<span class="c-num">3</span> TB  → cluster Redis ~<span class="c-num">10</span> node</code></pre>
        </div>

        <h3>Dùng con số để dẫn đến quyết định kiến trúc</h3>
        <p>Con số không phải để khoe tính toán — nó phải <strong>thay đổi thiết kế</strong>. Ví dụ cụ thể:</p>
        <ul class="list-bullet">
          <li>"11.600 QPS read" → một Postgres chịu được ~5.000 QPS đơn giản → <strong>cần cache + read replica</strong>.</li>
          <li>"36 TB/năm" → một máy chịu được → <strong>chưa cần shard</strong>, nhưng cần partition theo tháng cho dễ xoá.</li>
          <li>"1 GB/s bandwidth" → một NIC 10 Gbps đủ về lý thuyết nhưng không đủ dư địa → <strong>cần CDN</strong>.</li>
          <li>"4,3 TB cache" → quá lớn cho một Redis → <strong>cache chọn lọc</strong> (10% hot nhất, không phải 100%).</li>
          <li>"1,16 triệu write/s nếu fan-out 200 follower" → <strong>không khả thi</strong> → phải hybrid fan-out.</li>
        </ul>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Đừng tính chính xác đến từng đồng</div>
            <p>Interviewer không cần bạn ra 1.157,41 QPS. Họ cần thấy bạn biết <em>bậc độ lớn</em>. Làm tròn 86.400 thành 10⁵ và nói "khoảng 1.200 QPS" tốt hơn nhiều so với bấm máy tính 3 phút. Sai số 20% không ảnh hưởng kết luận; sai bậc độ lớn (nhầm 1.000 QPS với 1 triệu QPS) thì ảnh hưởng hoàn toàn. Và nếu bạn tính sai, hãy nói "khoảng" — thể hiện bạn biết đó là ước lượng, không phải khẳng định.</p>
          </div>
        </div>
      `
    },

    {
      id: 'tradeoffs', num: '7.3', title: 'Nói trade-off — kỹ năng được chấm điểm cao nhất',
      html: `
        <p>Interviewer senior không quan tâm bạn chọn Kafka hay RabbitMQ. Họ quan tâm bạn có biết <span class="kw">cái giá của lựa chọn đó</span> và có thể bảo vệ nó trước phản biện. Đây là phần dễ mất điểm nhất và cũng dễ ghi điểm nhất.</p>

        <h3>Cấu trúc câu trade-off</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">PATTERN</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Công thức 4 phần</span>

<span class="c-str">"Tôi chọn [X]"</span>
  <span class="c-str">"vì [lý do gắn với yêu cầu cụ thể của bài này],"</span>
  <span class="c-str">"đánh đổi là [nhược điểm cụ thể],"</span>
  <span class="c-str">"và tôi giảm nhẹ bằng [biện pháp]."</span>

<span class="c-com">// Ví dụ 1 — chọn cache-aside</span>
<span class="c-str">"Tôi chọn cache-aside vì 95% traffic là read lặp lại và chấp nhận</span>
<span class="c-str"> stale 60 giây. Đánh đổi là có cửa sổ stale và 3 round-trip khi miss.</span>
<span class="c-str"> Tôi giảm nhẹ bằng TTL có jitter và single-flight lock cho key hot."</span>

<span class="c-com">// Ví dụ 2 — chọn CP cho payment</span>
<span class="c-str">"Với thanh toán tôi chọn CP — khi mất quorum tôi từ chối ghi. Đánh đổi</span>
<span class="c-str"> là availability giảm trong sự cố network partition. Tôi giảm nhẹ bằng</span>
<span class="c-str"> cách trả 503 kèm Retry-After và client có idempotency key để retry an toàn."</span>

<span class="c-com">// Ví dụ 3 — chọn monolith</span>
<span class="c-str">"Tôi chọn modular monolith cho giai đoạn này vì team 8 người chưa có</span>
<span class="c-str"> vấn đề tổ chức. Đánh đổi là scale cả khối và một bug có blast radius</span>
<span class="c-str"> lớn. Tôi giảm nhẹ bằng module boundary rõ + tách service khi có module</span>
<span class="c-str"> cần scale khác biệt."</span></code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Ba câu trả lời tự động mất điểm</div>
            <p><strong>1. "Nó tuỳ."</strong> — Không giải thích gì. Interviewer sẽ nghĩ bạn không biết. Nếu thật sự tuỳ, hãy nói: "Nó tuỳ vào X. Nếu X thì A, nếu không thì B. Với bài này tôi giả định X nên chọn A." <strong>2. "Giải pháp của tôi không có nhược điểm."</strong> — Mọi giải pháp đều có. Nói không có nghĩa là bạn chưa nghĩ đủ sâu hoặc đang bán ý tưởng. <strong>3. "Tôi dùng microservices vì nó scalable."</strong> — Đây là câu trả lời của người đọc blog, không phải kỹ sư. Scalable là thuộc tính, không phải lý do; lý do phải gắn với yêu cầu cụ thể (team size, deploy frequency, independent scaling).</p>
          </div>
        </div>

        <h3>Bảng trade-off cho các quyết định phổ biến</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Quyết định</th><th>Chọn A khi</th><th>Chọn B khi</th></tr></thead>
            <tbody>
              <tr><td>SQL vs NoSQL</td><td><strong>SQL:</strong> cần transaction, quan hệ, query linh hoạt, dữ liệu &lt; TB</td><td><strong>NoSQL:</strong> access pattern biết trước, write cực lớn, schema thay đổi, multi-DC</td></tr>
              <tr><td>Sync vs async</td><td><strong>Sync:</strong> user cần kết quả ngay, logic đơn giản, ít service</td><td><strong>Async:</strong> xử lý lâu, cần decouple, chịu được eventual</td></tr>
              <tr><td>Normalize vs denormalize</td><td><strong>Normalize:</strong> ghi nhiều, dữ liệu hay đổi, cần nhất quán</td><td><strong>Denormalize:</strong> đọc nhiều, chấp nhận cập nhật lan rộng, cần tốc độ đọc</td></tr>
              <tr><td>Cache ngắn vs dài TTL</td><td><strong>Ngắn:</strong> dữ liệu nhạy cảm thời gian (tồn kho, giá)</td><td><strong>Dài:</strong> dữ liệu ít đổi (profile, catalog), giảm tải nhiều hơn</td></tr>
              <tr><td>Strong vs eventual</td><td><strong>Strong:</strong> tiền, tồn kho, uniqueness, auth</td><td><strong>Eventual:</strong> like, view, feed, gợi ý, analytics</td></tr>
              <tr><td>Push vs pull (feed)</td><td><strong>Push:</strong> user thường, follower ít, đọc nhiều</td><td><strong>Pull:</strong> celebrity, follower lớn, đọc ít</td></tr>
              <tr><td>Managed vs self-hosted</td><td><strong>Managed:</strong> team nhỏ, cần nhanh, không có chuyên gia</td><td><strong>Self-hosted:</strong> cần kiểm soát chi phí ở quy mô lớn, cần tuỳ biến sâu</td></tr>
              <tr><td>Shard sớm vs muộn</td><td><strong>Sớm:</strong> biết chắc sẽ vượt 2TB hoặc 50k write/s</td><td><strong>Muộn:</strong> hầu hết trường hợp — shard là bước nhảy phức tạp</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Kỹ thuật nâng cao: nói trade-off của chính câu trả lời trước</div>
            <p>Sau khi trình bày xong một phần, hãy tự phản biện: <em>"Cách này có một điểm yếu: nếu X xảy ra thì Y. Tôi chấp nhận vì Z, nhưng nếu yêu cầu là W thì tôi sẽ đổi sang cách khác."</em> Đây là dấu hiệu rất mạnh của senior — bạn không chỉ biết giải pháp mà còn biết <strong>điều kiện áp dụng</strong> của nó. Interviewer thường hỏi đúng vào điểm yếu đó, và bạn đã có câu trả lời sẵn.</p>
          </div>
        </div>

        <h3>Xử lý khi bị phản biện</h3>
        <ul class="list-check">
          <li><strong>Không phòng thủ.</strong> "Đó là điểm hay, tôi chưa nghĩ đến. Với ràng buộc đó, tôi sẽ..." — thừa nhận nhanh, điều chỉnh nhanh. Đây là dấu hiệu của người làm việc được với người khác.</li>
          <li><strong>Hỏi lại để hiểu ràng buộc mới.</strong> "Anh/chị đang giả định team không có ai biết vận hành Kafka — đúng không? Nếu vậy tôi sẽ đổi sang SQS."</li>
          <li><strong>Phân biệt "sai" và "khác".</strong> Nếu interviewer đề xuất cách khác, không có nghĩa cách bạn sai. Nói: "Cách đó cũng đúng, và nó tối ưu cho Y thay vì X. Với yêu cầu ban đầu tôi vẫn nghiêng về cách của mình, nhưng nếu ưu tiên Y thì cách anh/chị nói tốt hơn."</li>
          <li><strong>Thừa nhận khi thật sự không biết.</strong> "Tôi không nhớ chính xác cơ chế đó. Tôi biết nó liên quan đến X và tôi sẽ kiểm tra lại. Nhưng về mặt thiết kế, tôi cần nó đảm bảo Y." — Tốt hơn nhiều so với bịa.</li>
        </ul>
      `
    },

    {
      id: 'deep-dive', num: '7.4', title: 'Deep dive — đi sâu 2 thành phần mà không lạc',
      html: `
        <p>Sau high-level, interviewer sẽ chọn 1–2 chỗ để hỏi sâu. Đây là lúc phân biệt người <span class="kw">biết tên công nghệ</span> với người <span class="kw-y">đã vận hành thật</span>. Bạn cần đi từ data model → con số → failure mode, không chỉ nói "dùng Redis".</p>

        <h3>Chọn gì để deep dive</h3>
        <ol class="list-num">
          <li><strong>Thành phần chịu tải lớn nhất</strong> — thường là read path hoặc write path chính. Đây là nơi có nhiều quyết định nhất.</li>
          <li><strong>Thành phần có tính nhất quán phức tạp</strong> — ví dụ đồng bộ giữa DB và search index, hoặc chuyển tiền.</li>
          <li><strong>Thành phần dễ hỏng nhất</strong> — nơi có SPOF tiềm ẩn hoặc phụ thuộc bên thứ ba.</li>
        </ol>
        <p>Nếu bạn được chọn, hãy nói rõ: "Tôi muốn đi sâu vào phần X vì đó là nơi tôi thấy nhiều rủi ro nhất." Điều này thể hiện bạn có phán đoán.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 340" role="img" aria-label="Cấu trúc năm lớp của một phần deep dive từ mục đích đến failure mode và monitoring">
            <defs>
              <marker id="m7b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="30" width="720" height="44" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="34" y="50" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">1. MỤC ĐÍCH — nó giải quyết vấn đề gì, nếu bỏ đi thì sao</text>
            <text x="34" y="66" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">"Lớp này tồn tại để giảm 95% tải đọc vào DB. Bỏ đi → DB quá tải ở 11,6k QPS."</text>

            <rect x="16" y="84" width="720" height="44" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="104" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">2. DATA MODEL — schema, key design, index</text>
            <text x="34" y="120" font-family="JetBrains Mono, monospace" font-size="8" fill="#505a68">urls(code PK, long_url, user_id, created_at) · index: (user_id, created_at DESC)</text>

            <rect x="16" y="138" width="720" height="44" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="158" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">3. CON SỐ — capacity, latency, sizing</text>
            <text x="34" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">"Redis 64GB cho 10M key hot, p99 1,2ms. Postgres 500GB, p99 8ms. Cache hit 90% → DB chỉ 1.160 QPS."</text>

            <rect x="16" y="192" width="720" height="44" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="34" y="212" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">4. FAILURE MODE — điều gì xảy ra khi nó hỏng</text>
            <text x="34" y="228" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">"Redis chết → fallback DB, sẽ quá tải. Giảm nhẹ: fail-open cho read không quan trọng + circuit breaker để không đánh sập DB."</text>

            <rect x="16" y="246" width="720" height="44" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">5. MONITORING — bạn biết nó đang khoẻ bằng cách nào</text>
            <text x="34" y="282" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">"Alert khi hit ratio &lt; 85%, p99 &gt; 5ms, hoặc evicted_keys &gt; 0 — ba dấu hiệu cache sắp mất tác dụng."</text>

            <text x="16" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Lớp 4 và 5 là thứ phân biệt senior với middle — hầu hết ứng viên dừng ở lớp 3.</text>
          </svg>
          <div class="diagram-cap">Hình 7.2 — Năm lớp của một deep dive tốt; đừng dừng ở "tôi dùng Redis"</div>
        </div>

        <h3>Năm deep dive phổ biến và những gì phải nói</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chủ đề</th><th>Điểm phải nói</th><th>Câu hỏi interviewer hay hỏi tiếp</th></tr></thead>
            <tbody>
              <tr><td><strong>Cache</strong></td><td>Key design, TTL + jitter, chiến lược (aside/through), chống stampede/penetration/avalanche, eviction policy</td><td>"Key hot hết hạn cùng lúc thì sao?" → single-flight</td></tr>
              <tr><td><strong>Sharding</strong></td><td>Shard key + lý do, resharding, cross-shard query, hotspot</td><td>"Thêm node thì sao?" → consistent hashing / fixed partitions</td></tr>
              <tr><td><strong>Rate limiter</strong></td><td>Thuật toán, state ở đâu, atomic, phân tán</td><td>"10 instance đếm riêng thì sao?" → Redis + Lua</td></tr>
              <tr><td><strong>Consistency</strong></td><td>Mức nào cho entity nào, replication lag, read-your-writes</td><td>"User vừa ghi không thấy dữ liệu?" → route về leader</td></tr>
              <tr><td><strong>Queue</strong></td><td>At-least-once, idempotency, DLQ, ordering, lag monitoring</td><td>"Consumer chết giữa chừng?" → offset + idempotent</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Mẹo: dùng con số để neo câu chuyện</div>
            <p>Khi nói về một thành phần, luôn gắn con số: "Cache này phục vụ 90% của 11.600 QPS, tức ~10.400 QPS, với p99 1ms — nghĩa là 10.400 request mỗi giây không chạm DB." Con số làm câu trả lời có sức nặng và chứng minh bạn đã tính toán chứ không đọc thuộc. Ngược lại, nói "cache giúp giảm tải DB" mà không có số là câu trả lời của người chưa thiết kế hệ thống thật.</p>
          </div>
        </div>

        <h3>Ba câu hỏi "khó" và cách xử lý</h3>
        <ul class="list-bullet">
          <li><strong>"Nếu tôi tăng traffic lên 10 lần thì sao?"</strong> — Đừng nói "thêm server". Đi qua từng tầng: LB (scale ngang được), app (stateless → scale), cache (shard Redis), DB (read replica cho đọc, shard cho ghi, hoặc queue để làm phẳng write). Nêu tầng nào sẽ vỡ trước: thường là DB ghi. Nói rõ ngưỡng bạn sẽ shard.</li>
          <li><strong>"Tại sao không dùng [công nghệ khác]?"</strong> — Không phủ nhận. "Cách đó cũng hợp lý. Tôi chọn cách này vì [ràng buộc cụ thể]. Nếu [điều kiện khác] thì tôi sẽ chọn cách kia." Thể hiện bạn biết cả hai và có lý do chọn.</li>
          <li><strong>"Chi phí thì sao?"</strong> — Hầu hết ứng viên không nghĩ đến. Nói: "Ước tính ~$X/tháng cho compute, $Y cho storage, $Z cho egress. Chi phí lớn nhất là egress/observability, nên tôi giảm bằng cache + sample traces + S3 tiering." Đây là câu trả lời gây ấn tượng mạnh.</li>
        </ul>
      `
    },

    {
      id: 'checklist', num: '7.5', title: 'Checklist trước khi kết thúc & mock interview',
      html: `
        <p>Năm phút cuối quyết định ấn tượng cuối cùng. Đừng để hết giờ giữa một câu. Hãy chủ động tổng kết và mở ra phần bạn muốn được hỏi.</p>

        <h3>Checklist tự kiểm trước khi nói "tôi xong"</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>✓</th><th>Điều phải có</th><th>Nếu thiếu thì sao</th></tr></thead>
            <tbody>
              <tr><td>☐</td><td>Đã nêu con số ước lượng (QPS, storage, bandwidth)</td><td>Mất điểm "tư duy kỹ sư" — trông như đọc template</td></tr>
              <tr><td>☐</td><td>Đã vẽ luồng chính end-to-end</td><td>Không ai biết hệ thống hoạt động thế nào</td></tr>
              <tr><td>☐</td><td>Đã nêu data model cho 2–3 entity chính</td><td>Thiết kế treo lơ lửng, không kiểm chứng được</td></tr>
              <tr><td>☐</td><td>Đã nói bottleneck + cách xử lý</td><td>Đây là điểm phân biệt senior — thiếu là mất điểm lớn</td></tr>
              <tr><td>☐</td><td>Đã nói ít nhất 1 failure mode + graceful degradation</td><td>Thiết kế "luôn hoạt động hoàn hảo" là thiết kế chưa xong</td></tr>
              <tr><td>☐</td><td>Đã nói trade-off cho ≥ 3 quyết định</td><td>Trông như đang bán giải pháp, không phải kỹ sư</td></tr>
              <tr><td>☐</td><td>Đã nói consistency: entity nào strong, entity nào eventual</td><td>Thiếu hiểu biết về phân tán</td></tr>
              <tr><td>☐</td><td>Đã nói monitoring: biết hệ thống khoẻ bằng cách nào</td><td>Thiếu tư duy vận hành</td></tr>
              <tr><td>☐</td><td>Đã nói điều gì sẽ làm tiếp nếu có thêm thời gian</td><td>Kết thúc cụt — không thể hiện được chiều sâu còn lại</td></tr>
            </tbody>
          </table>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SCRIPT</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Câu tổng kết 60 giây — học thuộc cấu trúc</span>

<span class="c-str">"Để tổng kết: hệ thống gồm [N] phần chính — [liệt kê 4–5].</span>
<span class="c-str"> Luồng đọc đi qua CDN → LB → app → cache (90% hit) → DB replica.</span>
<span class="c-str"> Luồng ghi đi qua app → DB leader → CDC → search index."</span>

<span class="c-str">"Ba quyết định lớn và trade-off:</span>
<span class="c-str"> (1) Postgres thay vì NoSQL — đánh đổi khả năng scale ghi, được ACID.</span>
<span class="c-str"> (2) Cache-aside — đánh đổi staleness 60s, được giảm 90% tải DB.</span>
<span class="c-str"> (3) Hybrid fan-out — đánh đổi độ phức tạp, được khả năng chịu celebrity."</span>

<span class="c-str">"Điểm yếu tôi biết: [1 điểm cụ thể]. Nếu có thêm thời gian tôi sẽ</span>
<span class="c-str"> [2 việc cụ thể]. Anh/chị muốn tôi đi sâu vào phần nào?"</span>

<span class="c-com">// Câu cuối mở ra cho interviewer — thể hiện hợp tác, không độc diễn</span></code></pre>
        </div>

        <h3>Lộ trình luyện tập 4 tuần</h3>
        <div class="diagram">
          <svg viewBox="0 0 760 300" role="img" aria-label="Lộ trình luyện phỏng vấn bốn tuần từ học khung đến mock interview với người thật">
            <defs>
              <marker id="m7c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="34" width="170" height="112" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="101" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">TUẦN 1 — Khung</text>
            <text x="32" y="82" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Học thuộc khung 45'</text>
            <text x="32" y="98" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Tập estimation 10 bài</text>
            <text x="32" y="114" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Viết template ra giấy</text>
            <text x="32" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Chưa cần làm full bài</text>

            <rect x="202" y="34" width="170" height="112" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="287" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">TUẦN 2 — Tự làm</text>
            <text x="218" y="82" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• 5 bài kinh điển</text>
            <text x="218" y="98" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Viết ra giấy 45', bấm giờ</text>
            <text x="218" y="114" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Tự ghi âm, nghe lại</text>
            <text x="218" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">Đau nhất nhưng hiệu quả nhất</text>

            <rect x="388" y="34" width="170" height="112" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="473" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">TUẦN 3 — Mock</text>
            <text x="404" y="82" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• 3 buổi mock với người</text>
            <text x="404" y="98" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Nhờ hỏi khó, phản biện</text>
            <text x="404" y="114" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Ghi lại điểm yếu</text>
            <text x="404" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Sửa từng điểm yếu</text>

            <rect x="574" y="34" width="170" height="112" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="659" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">TUẦN 4 — Tinh chỉnh</text>
            <text x="590" y="82" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• 5 bài khó hơn</text>
            <text x="590" y="98" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Tập nói trade-off</text>
            <text x="590" y="114" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Chuẩn bị câu hỏi ngược</text>
            <text x="590" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Nghỉ ngơi, không học mới</text>

            <path d="M186,90 L200,90" stroke="#505a68" stroke-width="2" marker-end="url(#m7c)"/>
            <path d="M372,90 L386,90" stroke="#505a68" stroke-width="2" marker-end="url(#m7c)"/>
            <path d="M558,90 L572,90" stroke="#505a68" stroke-width="2" marker-end="url(#m7c)"/>

            <rect x="16" y="168" width="728" height="112" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Năm bài nên tự làm trước tiên (theo thứ tự)</text>
            <text x="34" y="214" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68"><strong>1. URL Shortener</strong> — dễ nhất, kiểm tra estimation + ID generation. <strong>2. Rate Limiter</strong> — kiểm tra thuật toán + distributed state.</text>
            <text x="34" y="234" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68"><strong>3. News Feed</strong> — kiểm tra fan-out, celebrity problem, caching. <strong>4. Chat</strong> — kiểm tra realtime, presence, ordering.</text>
            <text x="34" y="254" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68"><strong>5. Payment / Ledger</strong> — kiểm tra idempotency, transaction, đối soát. Bài này khó nhất và ít người làm tốt.</text>
            <text x="34" y="272" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Làm 5 bài này kỹ tốt hơn làm 20 bài qua loa — vì 80% kỹ năng lặp lại giữa các bài.</text>
          </svg>
          <div class="diagram-cap">Hình 7.3 — Luyện tập có cấu trúc: khung trước, tự làm sau, mock cuối</div>
        </div>

        <h3>Câu hỏi ngược — chuẩn bị 2 câu</h3>
        <ul class="list-check">
          <li>"Team hiện tại đang gặp khó khăn nhất ở phần nào của hệ thống? Tôi muốn biết mình sẽ làm gì trong 3 tháng đầu."</li>
          <li>"Quy trình từ ý tưởng đến production hiện nay mất bao lâu? Có gì đang được cải thiện không?"</li>
          <li>"Điều gì khiến anh/chị thích làm việc ở đây?" — câu này luôn tốt, nhưng đừng hỏi nếu đã hết giờ.</li>
        </ul>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Ba điều không nên làm trong 5 phút cuối</div>
            <p><strong>1. Xin thêm thời gian để vẽ thêm.</strong> Thời gian đã hết; hãy tổng kết những gì có. <strong>2. Hỏi "em có đỗ không?".</strong> Không bao giờ. <strong>3. Bào chữa cho điểm yếu.</strong> Nếu bạn biết thiết kế có lỗ hổng, hãy nói thẳng: "Tôi biết phần này chưa xử lý tốt trường hợp X. Nếu có thêm thời gian, tôi sẽ [giải pháp]." Thừa nhận có kiểm soát luôn tốt hơn bị phát hiện.</p>
          </div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Điều cuối cùng — bình tĩnh quan trọng hơn kiến thức</div>
            <p>Interviewer biết bạn đang căng thẳng. Họ không tìm người biết mọi thứ — họ tìm người <strong>suy nghĩ có cấu trúc khi không biết</strong>. Nếu bị hỏi điều chưa từng gặp, hãy nói: "Tôi chưa gặp bài này. Tôi sẽ suy luận từ nguyên tắc: nếu cần X thì... " và đi từng bước. Đó chính xác là điều bạn sẽ làm trong công việc thật. Và nhớ: một buổi phỏng vấn không quyết định sự nghiệp của bạn. Chuẩn bị tốt, nói rõ ràng, thừa nhận giới hạn — đó là tất cả những gì có thể kiểm soát.</p>
          </div>
        </div>
      `
    }
,
    {
      id: 'resources', num: '7.6', title: 'Tài nguyên học tiếp & bước đi sau khoá này',
      html: `
        <p>Bạn đã đi qua 63 chủ đề. Điều quan trọng bây giờ không phải học thêm nhiều hơn mà là <span class="kw">áp dụng có chủ đích</span> — mỗi tuần một bài, có ghi chép, có phản biện.</p>

        <h3>Sách — đọc theo thứ tự này</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Sách</th><th>Đọc khi</th><th>Giá trị thật</th></tr></thead>
            <tbody>
              <tr><td><strong>System Design Interview (Alex Xu), Vol 1 &amp; 2</strong></td><td>Đang luyện phỏng vấn</td><td>15 + 13 bài kinh điển với con số cụ thể. Đọc song song với Module 5 — mỗi chương là một bài tập.</td></tr>
              <tr><td><strong>Designing Data-Intensive Applications</strong> (Kleppmann)</td><td>Sau khi đã có nền</td><td>Cuốn sách quan trọng nhất về hệ phân tán ứng dụng. Giải thích <em>tại sao</em> đằng sau mọi lựa chọn. Đọc chậm, 1 chương/tuần.</td></tr>
              <tr><td><strong>Site Reliability Engineering</strong> (Google)</td><td>Khi đã đi làm</td><td>Miễn phí online. Chương về SLO, error budget, on-call là chuẩn mực ngành.</td></tr>
              <tr><td><strong>Database Internals</strong> (Petrov)</td><td>Khi muốn hiểu sâu storage</td><td>B+ tree, LSM, compaction ở mức implementation. Nối tiếp Module 3.</td></tr>
              <tr><td><strong>Release It!</strong> (Nygard)</td><td>Khi làm production</td><td>Circuit breaker, bulkhead, stability patterns — nguồn gốc của mục 4.5.</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Nguồn online đáng thời gian</h3>
        <ul class="list-bullet">
          <li><strong>Engineering blog của công ty thật:</strong> Netflix TechBlog, Uber Engineering, Discord, Figma, Cloudflare, Shopify. Đọc bài về một sự cố cụ thể — giá trị cao hơn 10 bài tổng quan.</li>
          <li><strong>Jepsen.io</strong> — phân tích tính nhất quán của DB phân tán. Đọc báo cáo về một DB bạn đang dùng; bạn sẽ phát hiện nhiều điều không có trong tài liệu.</li>
          <li><strong>Postmortem công khai</strong> — Cloudflare, AWS, GitLab, Slack đều công bố. Đọc 5 cái và bạn sẽ thấy pattern lặp lại: cấu hình sai, thiếu giới hạn, failover chưa diễn tập.</li>
          <li><strong>Paper kinh điển:</strong> Dynamo (2007), Spanner (2012), Raft (2014), Kafka (2011), Bigtable (2006). Đọc phần introduction và evaluation là đủ cho hầu hết nhu cầu.</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Cách đọc hiệu quả nhất</div>
            <p>Đừng đọc để "biết thêm". Đọc với một câu hỏi cụ thể trong đầu: "Nếu tôi phải thiết kế lại hệ thống tôi đang làm, tôi sẽ đổi gì?" Sau mỗi bài đọc, viết <strong>3 dòng</strong>: (1) ý chính, (2) điều áp dụng được cho hệ thống của tôi, (3) điều tôi chưa hiểu. Ba dòng này quan trọng hơn việc đọc thêm 20 bài. Người đọc 20 bài không ghi chép sẽ nhớ ít hơn người đọc 5 bài có ghi chép.</p>
          </div>
        </div>

        <h3>Bước đi sau khoá này</h3>
        <div class="diagram">
          <svg viewBox="0 0 760 280" role="img" aria-label="Bốn bước tiếp theo sau khoá học từ luyện phỏng vấn đến dạy lại cho người khác">
            <defs>
              <marker id="m7d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="34" width="170" height="98" rx="9" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="101" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">BƯỚC 1</text>
            <text x="101" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">Luyện phỏng vấn</text>
            <text x="32" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">10 bài, mỗi bài 45 phút</text>
            <text x="32" y="116" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">có ghi âm + tự đánh giá</text>

            <rect x="202" y="34" width="170" height="98" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="287" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">BƯỚC 2</text>
            <text x="287" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">Áp dụng vào thật</text>
            <text x="218" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Chọn 1 vấn đề ở công ty,</text>
            <text x="218" y="116" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">viết 1 trang design doc</text>

            <rect x="388" y="34" width="170" height="98" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="473" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">BƯỚC 3</text>
            <text x="473" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">Vận hành thật</text>
            <text x="404" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Đo SLO, viết runbook,</text>
            <text x="404" y="116" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">chạy 1 game day</text>

            <rect x="574" y="34" width="170" height="98" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="659" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">BƯỚC 4</text>
            <text x="659" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">Dạy lại</text>
            <text x="590" y="100" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">Viết blog, thuyết trình,</text>
            <text x="590" y="116" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">mentor. Hiểu = giải thích được.</text>

            <path d="M186,83 L200,83" stroke="#505a68" stroke-width="2" marker-end="url(#m7d)"/>
            <path d="M372,83 L386,83" stroke="#505a68" stroke-width="2" marker-end="url(#m7d)"/>
            <path d="M558,83 L572,83" stroke="#505a68" stroke-width="2" marker-end="url(#m7d)"/>

            <rect x="16" y="152" width="728" height="50" rx="8" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Bước nào quan trọng nhất?</text>
            <text x="34" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Bước 2 và 3. Kiến thức không áp dụng được vào hệ thống thật sẽ mờ dần trong 6 tháng. Còn một quyết định bạn đã bảo vệ trước người khác thì nhớ mãi.</text>

            <rect x="16" y="216" width="728" height="50" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="238" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Đừng học tiếp ngay</text>
            <text x="34" y="256" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Học 3 khoá nữa mà không làm bài nào sẽ cho cảm giác tiến bộ nhưng không tạo năng lực. Hãy dừng 4 tuần để làm bước 1–2 trước.</text>
          </svg>
          <div class="diagram-cap">Hình 7.4 — Học → làm → vận hành → dạy: vòng tròn tạo năng lực thật</div>
        </div>

        <h3>Tự đánh giá — thang 4 mức</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mức</th><th>Dấu hiệu</th><th>Bước tiếp</th></tr></thead>
            <tbody>
              <tr><td><strong>Biết tên</strong></td><td>Nhận ra "Kafka", "sharding", "CAP" nhưng không giải thích được</td><td>Đọc lại Module 2, 3 — tập nói mỗi khái niệm trong 60 giây</td></tr>
              <tr><td><strong>Hiểu</strong></td><td>Giải thích được cơ chế, nhưng chưa biết khi nào chọn</td><td>Làm bảng trade-off ở mục 7.3 bằng lời của mình</td></tr>
              <tr><td><strong>Áp dụng được</strong></td><td>Thiết kế được trong 45 phút, nêu được trade-off và failure</td><td>Mock interview, viết design doc thật</td></tr>
              <tr><td><strong>Vận hành được</strong></td><td>Đã đối mặt sự cố thật, đã rollback, đã trực on-call</td><td>Dạy lại người khác — đây là mức cao nhất</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Tổng kết khoá học — những gì bạn đã có</div>
            <p><strong>63 chủ đề</strong> trải từ nền tảng mạng đến kiến trúc cloud. <strong>48 diagram</strong> để tham chiếu khi trình bày. <strong>115 khái niệm</strong> với định nghĩa và ngữ cảnh dùng. <strong>45 câu hỏi</strong> kèm đáp án chi tiết để tự kiểm tra. Nhưng thứ quan trọng nhất không phải số lượng — mà là <strong>khung tư duy</strong>: luôn bắt đầu bằng yêu cầu, lượng hoá bằng con số, chọn giải pháp kèm trade-off, và thiết kế cho lúc hệ thống hỏng. Khung đó áp dụng được cho mọi hệ thống bạn sẽ xây trong 10 năm tới, kể cả những công nghệ chưa tồn tại.</p>
          </div>
        </div>`
    }
  ],

  quiz: [
    {
      q: 'Interviewer nói: "Hãy thiết kế Instagram". Bạn làm gì trong 5 phút đầu?',
      a: 'Không vẽ gì cả. Trình tự: <strong>(1) Chốt phạm vi</strong> — "Tôi sẽ tập trung vào 3 tính năng: upload ảnh, follow, xem feed. Tôi bỏ ra ngoài: comment, story, DM, tìm kiếm — giả định đã có. Đúng không?". <strong>(2) Làm rõ quy mô</strong> — "Tôi giả định 500 triệu DAU, mỗi người xem feed 10 lần/ngày và upload 0,1 ảnh/ngày. Anh/chị muốn con số khác không?". <strong>(3) Hỏi yêu cầu phi chức năng quan trọng nhất</strong> — "Latency feed mục tiêu là bao nhiêu? Ảnh phải hiển thị ngay sau upload không, hay trễ 1 phút được?" — câu này quyết định đồng bộ hay async. <strong>(4) Nêu hướng tiếp cận</strong> — "Tôi sẽ đi theo thứ tự: ước lượng → kiến trúc cao tầng → đi sâu vào feed fan-out vì đó là phần khó nhất." <strong>(5) Xin xác nhận</strong> — "Anh/chị muốn tôi ưu tiên phần nào?". Năm phút này tạo ra: phạm vi rõ (bạn không bị lạc), con số (bạn dùng suốt bài), và sự hợp tác (interviewer thấy bạn làm việc được với người). Sai lầm phổ biến nhất là bắt đầu vẽ box "Client → LB → App" ngay — mất 5 phút mà không biết đang thiết kế cho quy mô nào, để rồi 15 phút sau phải làm lại.'
    },
    {
      q: 'Bạn đang trình bày và interviewer ngắt: "Tại sao dùng Postgres? Cassandra scale tốt hơn nhiều." Bạn trả lời thế nào?',
      a: 'Không phòng thủ, không đầu hàng. Trả lời theo cấu trúc: <strong>(1) Thừa nhận điểm đúng</strong> — "Đúng, Cassandra ghi tốt hơn nhiều và scale ngang dễ hơn — hàng trăm nghìn write/s là chuyện bình thường với Cassandra, còn Postgres sẽ cần sharding thủ công." <strong>(2) Gắn với yêu cầu cụ thể của bài</strong> — "Nhưng với bài này tôi có 3 ràng buộc: (a) cần transaction ACID cho phần thanh toán và tồn kho — Cassandra không có; (b) cần query linh hoạt vì tôi chưa biết hết access pattern khi mới xây — Cassandra yêu cầu thiết kế bảng theo query trước; (c) dữ liệu chỉ 500GB, write 2.000/s — Postgres dư sức với một máy và hai replica." <strong>(3) Nêu điều kiện đổi</strong> — "Tôi sẽ đổi sang Cassandra cho phần event log hoặc activity feed, nơi tôi có write 50.000/s và access pattern rõ ràng là đọc theo user cộng với khoảng thời gian. Nghĩa là tôi dùng cả hai cho hai loại dữ liệu khác nhau, không chọn một cho tất cả." <strong>(4) Hỏi lại</strong> — "Anh/chị đang giả định quy mô lớn hơn con số tôi nêu, hay đang muốn tôi xét khả năng scale ghi cao hơn?" Điểm mấu chốt: câu hỏi này không kiểm tra kiến thức về Postgres hay Cassandra — nó kiểm tra bạn có <em>lý do gắn với bài toán</em> hay chỉ chọn theo cảm tính hoặc theo độ phổ biến. Trả lời "vì Postgres phổ biến" hoặc "vì Cassandra nhanh hơn" đều mất điểm như nhau.'
    },
    {
      q: 'Bạn có 10 phút cuối và interviewer chưa hỏi gì về failure. Bạn chủ động đưa vào thế nào?',
      a: 'Chủ động chuyển topic một cách tự nhiên, không đột ngột: <strong>(1) Cầu nối</strong> — "Trước khi tổng kết, tôi muốn nói về phần tôi thấy rủi ro nhất: điều gì xảy ra khi các thành phần chính hỏng." <strong>(2) Ba kịch bản cụ thể, mỗi cái 2 phút</strong> — (a) "Redis chết: 10.400 QPS dồn vào Postgres, vượt ngưỡng 5.000 nên DB sập. Giảm nhẹ: circuit breaker chặn ở DB, và read không quan trọng trả dữ liệu cache cũ từ local." (b) "DB leader chết: failover 30–60s, trong đó ghi thất bại. Client có idempotency key nên retry an toàn. Đọc vẫn phục vụ từ replica." (c) "Một AZ mất: nếu trải 3 AZ với replica ở mỗi AZ thì mất 1 AZ vẫn còn quorum. Nếu chỉ 2 AZ thì mất AZ lớn là mất quorum — đây là lý do tôi chọn 3 AZ." <strong>(3) Nói monitoring</strong> — "Tôi biết những điều này đang xảy ra qua 4 alert: error rate, p99, cache hit ratio, replication lag." <strong>(4) Kết luận có kiểm soát</strong> — "Điểm yếu tôi biết: nếu mất cả DB leader và một replica cùng lúc, tôi có thể mất vài giây ghi cuối vì semi-sync chỉ đảm bảo 1 replica. Với hệ thống này tôi chấp nhận, vì client có idempotency key và có job đối soát." Việc chủ động đưa ra failure mode khi interviewer chưa hỏi là dấu hiệu rất mạnh — nó cho thấy bạn thiết kế cho thực tế vận hành chứ không chỉ để vẽ diagram đẹp.'
    },
    {
      q: 'Bạn tính ra 1,16 triệu write/s cho fan-out và nói "không khả thi". Interviewer hỏi: "Sao em biết không khả thi? Redis chịu được mà." Bạn xử lý thế nào?',
      a: 'Đây là câu phản biện kiểm tra bạn có con số thật hay chỉ nói cảm tính. Trả lời: <strong>(1) Thừa nhận đúng về mặt lý thuyết</strong> — "Đúng, một cluster Redis lớn có thể đạt 1 triệu op/s. Benchmark Redis đạt 100k–200k op/s mỗi node với pipelining, nên khoảng 10 node có thể tới 1–2 triệu." <strong>(2) Nêu vấn đề thật: không phải throughput mà là phân bố</strong> — "Nhưng 1,16 triệu/s đó là <em>trung bình</em>. Con số thật là: một celebrity tweet tạo ra 50 triệu write trong vài giây. Đó là 50 triệu op dồn vào cùng một khoảng thời gian, không phải rải đều. Không cluster nào xử lý được burst 50 triệu op trong 10 giây." <strong>(3) Vấn đề thứ hai — head-of-line blocking</strong> — "Worker fan-out bị chặn: một tweet của celebrity chiếm worker trong nhiều phút, các tweet khác xếp hàng sau. Độ trễ đăng bài của user thường tăng vọt." <strong>(4) Vấn đề thứ ba — lãng phí</strong> — "90% trong 50 triệu follower đó không online trong 10 phút tới. Ta đang pre-compute cho người không đọc." <strong>(5) Giải pháp có số</strong> — "Vì vậy tôi tách: user dưới 10k follower thì fan-out on write, chiếm 99,9% user nhưng chỉ khoảng 5% tổng write. Celebrity thì chỉ ghi timeline riêng, đọc merge khi cần — 5 đến 20 query song song, khoảng 50ms." Điểm mấu chốt: đừng nói "Redis yếu" — nói "throughput trung bình không phải vấn đề, burst và phân bố mới là vấn đề". Đây là hiểu biết thật về hệ phân tán, và interviewer sẽ chuyển sang hỏi sâu hơn thay vì nghi ngờ con số của bạn.'
    },
    {
      q: 'Trong 45 phút, bạn có 12 phút cuối và interviewer nói "cho tôi xem em xử lý khi hệ thống bị DDoS". Bạn trình bày thế nào?',
      a: 'Trình bày theo tầng, từ rìa vào trong, mỗi tầng 2–3 phút: <strong>(1) Phân loại trước</strong> — "Có ba loại: volumetric (L3/L4, làm nghẽn băng thông), protocol (SYN flood, slowloris), và application (L7 flood vào endpoint đắt như search). Cách xử lý khác nhau hoàn toàn." <strong>(2) Volumetric</strong> — "Không thể chống ở server của tôi vì đường truyền đã bị nghẽn. Cần anycast cộng với scrubbing center (Cloudflare, AWS Shield) phân tán hấp thụ ở rìa. Đây là lý do phải có CDN <em>trước</em> khi bị tấn công, không phải sau." <strong>(3) Application layer</strong> — "Rate limit theo IP và theo user ở edge, trước khi vào app. WAF rule cho pattern xấu. Challenge (CAPTCHA hoặc JS challenge) cho traffic nghi ngờ. Với endpoint đắt như search, rate limit chặt hơn (10 request/phút/user) và cache kết quả cho query phổ biến — biến tấn công thành cache hit." <strong>(4) Bảo vệ nội bộ</strong> — "Bulkhead để một endpoint bị flood không ăn hết thread pool; circuit breaker cho dependency bên thứ ba; và autoscaling có giới hạn trên — đây là rủi ro thật: autoscale theo DDoS có thể làm hoá đơn tăng 50–100 lần." <strong>(5) Chi tiết ít người nói</strong> — "Tôi cần phân biệt DDoS với traffic spike thật (ví dụ flash sale). Nếu chặn nhầm, tôi mất doanh thu. Vì vậy tôi dùng rate limit theo user đã đăng nhập (chặt hơn) và theo IP (lỏng hơn cho anonymous), cộng với kill switch để nới limit nhanh nếu phát hiện chặn nhầm — và dashboard hiển thị doanh thu realtime để phát hiện sớm." Hai chi tiết "autoscaling trong DDoS là bẫy chi phí" và "phân biệt DDoS với traffic thật" thể hiện kinh nghiệm vận hành thật, không phải kiến thức sách.'
    },
    {
      q: 'Bạn trượt một buổi phỏng vấn. Nhận feedback: "Thiết kế đúng nhưng không nói được trade-off." Bạn sửa thế nào trong 2 tuần?',
      a: 'Đây là feedback phổ biến và sửa được nhanh vì nó là <em>kỹ năng trình bày</em>, không phải kiến thức. Kế hoạch 2 tuần: <strong>(1) Nhận diện pattern hiện tại</strong> — ghi âm một buổi tự làm bài, nghe lại và đếm: có bao nhiêu lần bạn nói "tôi dùng X" mà không nói "đánh đổi là Y"? Hầu hết mọi người phát hiện gần 100% câu đều thiếu phần trade-off. <strong>(2) Học thuộc công thức 4 phần</strong> — "Tôi chọn X / vì Y / đánh đổi là Z / giảm nhẹ bằng W." Tập nói 20 lần cho thành phản xạ, mỗi lần với một quyết định khác nhau (cache, DB, queue, sync/async, shard). <strong>(3) Chuẩn bị bảng trade-off cho 15 quyết định phổ biến</strong> — dùng bảng ở mục 7.3 nhưng viết lại bằng lời của mình, không học thuộc. Mỗi quyết định phải có: chọn A khi nào, chọn B khi nào, cái giá của A. <strong>(4) Tập tự phản biện</strong> — sau mỗi lựa chọn trong bài tự làm, nói to: "Điểm yếu của cách này là... Nếu yêu cầu là... thì tôi đổi sang..." Đây là kỹ thuật mạnh nhất vì nó biến trade-off thành thói quen tư duy, không phải câu thêm vào cuối bài. <strong>(5) Mock với người chuyên hỏi "tại sao"</strong> — nhờ ai đó ngắt mỗi 2 phút và hỏi "tại sao không dùng cách khác?". Chịu được 3 buổi như vậy là thành phản xạ. Con số mục tiêu: trong một buổi 45 phút phải có <strong>ít nhất 6 câu trade-off rõ ràng</strong> — thường ở cache, DB, consistency, fan-out, queue, và deployment.'
    }
  ]
};

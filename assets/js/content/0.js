/* ============================================================
   Module 0 — Kiến thức nền tảng (Prerequisites)
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[0] = {
  title: 'Module 0 — Kiến thức nền tảng',
  lead: 'Trước khi thiết kế bất kỳ hệ thống nào, bạn phải hiểu những gì đang chạy bên dưới: gói tin đi qua đâu, thread được schedule thế nào, dữ liệu nằm trên đĩa ra sao, và tại sao hai máy không thể "chỉ cần đồng bộ" với nhau. Module này là phần đếm ngược từ vật lý lên đến kiến trúc.',

  keywords: [
    { term: 'OSI 7 layers', def: 'Mô hình tham chiếu chia giao tiếp mạng thành 7 tầng: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
    { term: 'TCP vs UDP', def: 'TCP: có kết nối, đảm bảo thứ tự và toàn vẹn (handshake, retransmit). UDP: không kết nối, nhanh, không đảm bảo — dùng cho video, game, DNS.' },
    { term: 'TLS handshake', def: 'Quá trình thoả thuận cipher suite, xác thực chứng chỉ và trao đổi khoá đối xứng. TLS 1.3 chỉ cần 1-RTT (hoặc 0-RTT khi resume).' },
    { term: 'DNS resolution', def: 'Trình tự: browser cache → OS cache → recursive resolver → root → TLD → authoritative NS. Kết quả được cache theo TTL.' },
    { term: 'CDN edge', def: 'Máy chủ đặt gần người dùng, cache nội dung tĩnh, giảm RTT và giảm tải origin.' },
    { term: 'Process vs Thread', def: 'Process có không gian địa chỉ riêng; thread chia sẻ heap trong cùng process. Chuyển thread rẻ hơn chuyển process.' },
    { term: 'epoll / kqueue', def: 'Cơ chế I/O multiplexing của Linux/macOS: một thread theo dõi hàng nghìn socket mà không cần blocking từng cái.' },
    { term: 'ACID', def: 'Atomicity, Consistency, Isolation, Durability — bốn đảm bảo của transaction quan hệ.' },
    { term: 'B+ Tree index', def: 'Cấu trúc index mặc định của MySQL/Postgres: lá liên kết, tìm kiếm O(log n), hỗ trợ range scan tốt.' },
    { term: 'CAP theorem', def: 'Khi có partition, hệ thống chỉ chọn được Consistency hoặc Availability — không thể cả hai.' },
    { term: 'PACELC', def: 'Mở rộng CAP: nếu Partition chọn A hoặc C; Else (bình thường) chọn Latency hoặc Consistency.' },
    { term: 'Clock skew', def: 'Đồng hồ vật lý giữa các máy lệch nhau. Không thể dùng timestamp đơn thuần để sắp xếp sự kiện phân tán.' }
  ],

  sections: [
    {
      id: 'network', num: '0.1', title: 'Mạng máy tính: OSI, TCP/IP và đường đi của một request',
      html: `
        <p>Khi bạn gõ một URL và nhấn Enter, có khoảng 15 bước xảy ra trước khi byte đầu tiên hiện ra. Hiểu đường đi này giúp bạn biết <span class="kw">nút thắt</span> nằm ở đâu khi hệ thống chậm.</p>

        <div class="diagram">
          <svg viewBox="0 0 720 400" role="img" aria-label="So sánh mô hình OSI 7 tầng và TCP/IP 4 tầng">
            <defs>
              <marker id="m0a" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#505a68"/>
              </marker>
            </defs>
            <text x="150" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#151515">OSI (7 tầng)</text>
            <text x="520" y="26" text-anchor="middle" font-size="13" font-weight="800" fill="#151515">TCP/IP (4 tầng)</text>

            <g font-size="12" font-weight="700">
              <rect x="60" y="44" width="180" height="38" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="150" y="68" text-anchor="middle" fill="#151515">7 Application</text>

              <rect x="60" y="88" width="180" height="38" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="150" y="112" text-anchor="middle" fill="#151515">6 Presentation</text>

              <rect x="60" y="132" width="180" height="38" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="150" y="156" text-anchor="middle" fill="#151515">5 Session</text>

              <rect x="60" y="176" width="180" height="38" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="150" y="200" text-anchor="middle" fill="#151515">4 Transport</text>

              <rect x="60" y="220" width="180" height="38" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="150" y="244" text-anchor="middle" fill="#151515">3 Network</text>

              <rect x="60" y="264" width="180" height="38" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="150" y="288" text-anchor="middle" fill="#151515">2 Data Link</text>

              <rect x="60" y="308" width="180" height="38" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="150" y="332" text-anchor="middle" fill="#151515">1 Physical</text>
            </g>

            <g font-size="12" font-weight="700">
              <rect x="430" y="44" width="180" height="126" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="520" y="90" text-anchor="middle" fill="#151515">Application</text>
              <text x="520" y="110" text-anchor="middle" font-size="10" font-weight="600" fill="#505a68">HTTP, DNS, TLS, WS</text>

              <rect x="430" y="176" width="180" height="38" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="520" y="200" text-anchor="middle" fill="#151515">Transport</text>

              <rect x="430" y="220" width="180" height="38" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="520" y="244" text-anchor="middle" fill="#151515">Internet</text>

              <rect x="430" y="264" width="180" height="82" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="520" y="300" text-anchor="middle" fill="#151515">Network Access</text>
              <text x="520" y="320" text-anchor="middle" font-size="10" font-weight="600" fill="#505a68">Ethernet, Wi-Fi</text>
            </g>

            <line x1="246" y1="63" x2="424" y2="80" stroke="#505a68" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#m0a)"/>
            <line x1="246" y1="151" x2="424" y2="95" stroke="#505a68" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#m0a)"/>
            <line x1="246" y1="195" x2="424" y2="195" stroke="#505a68" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#m0a)"/>
            <line x1="246" y1="239" x2="424" y2="239" stroke="#505a68" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#m0a)"/>
            <line x1="246" y1="305" x2="424" y2="305" stroke="#505a68" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#m0a)"/>

            <text x="360" y="380" text-anchor="middle" font-size="11" font-weight="600" fill="#505a68">Data Link + Physical gộp thành Network Access</text>
          </svg>
          <div class="diagram-cap">Hình 0.1 — Ánh xạ OSI 7 tầng sang TCP/IP 4 tầng. Khi debug, ta thường nói theo TCP/IP.</div>
        </div>

        <h3>Đường đi của một request HTTPS</h3>
        <ol class="list-num">
          <li><strong>DNS lookup</strong> — <code>api.example.com</code> → IP. Có thể mất 20–120&nbsp;ms nếu cache miss.</li>
          <li><strong>TCP handshake</strong> — SYN → SYN-ACK → ACK. 1 RTT.</li>
          <li><strong>TLS handshake</strong> — ClientHello → ServerHello + cert → Finished. TLS 1.3 tốn 1 RTT (0-RTT nếu resume).</li>
          <li><strong>HTTP request</strong> — Gửi request qua kết nối đã mã hoá.</li>
          <li><strong>Đi qua hạ tầng</strong> — CDN edge → load balancer → app server → cache → DB.</li>
          <li><strong>Response</strong> — Trả ngược lại, có thể qua nén (gzip/brotli) và cache.</li>
        </ol>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Vì sao system designer quan tâm tầng nào?</div>
            <p>Mỗi tầng có cách tối ưu riêng: DNS/CDN giảm RTT ở tầng application; TCP tuning (congestion window) ở tầng transport; bỏ TLS session cache làm tăng CPU ở tầng presentation. Chọn sai tầng để tối ưu là lý do phổ biến khiến hệ thống không nhanh lên.</p>
          </div>
        </div>

        <h3>Bảng so sánh giao thức tầng transport</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tiêu chí</th><th>TCP</th><th>UDP</th><th>QUIC (HTTP/3)</th></tr></thead>
            <tbody>
              <tr><td>Kết nối</td><td>Có (handshake)</td><td>Không</td><td>Có, gộp vào TLS (1-RTT)</td></tr>
              <tr><td>Đảm bảo thứ tự</td><td>Có</td><td>Không</td><td>Có, theo stream</td></tr>
              <tr><td>Head-of-line blocking</td><td>Có</td><td>Không</td><td>Không (đa stream độc lập)</td></tr>
              <tr><td>Dùng cho</td><td>HTTP/1.1, HTTP/2, DB</td><td>DNS, video, game</td><td>HTTP/3, video hiện đại</td></tr>
              <tr><td>Phù hợp khi</td><td>Cần tin cậy</td><td>Cần độ trễ cực thấp</td><td>Web hiện đại, mạng không ổn định</td></tr>
            </tbody>
          </table>
        </div>`
    },

    {
      id: 'http', num: '0.2', title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3',
      html: `
        <p>Ba phiên bản HTTP giải quyết ba vấn đề khác nhau. Hiểu khác biệt này giúp bạn biết khi nào tách domain, khi nào dùng CDN, khi nào phải dùng WebSocket.</p>

        <h3>Vấn đề của HTTP/1.1</h3>
        <ul class="list-bullet">
          <li><strong>Head-of-line blocking ở tầng application:</strong> mỗi kết nối xử lý tuần tự một request.</li>
          <li>Workaround lịch sử: mở 6 kết nối song song mỗi domain, <span class="kw">domain sharding</span>, sprite image, inline CSS.</li>
          <li>Header lặp lại mỗi request, không nén → tốn băng thông.</li>
        </ul>

        <h3>HTTP/2 sửa gì?</h3>
        <ul class="list-bullet">
          <li><span class="kw">Multiplexing</span>: nhiều stream trên một kết nối TCP.</li>
          <li><span class="kw">HPACK</span>: nén header.</li>
          <li><span class="kw">Server push</span>: server chủ động đẩy tài nguyên (nay ít dùng).</li>
          <li><strong>Vấn đề còn lại:</strong> một gói TCP mất → toàn bộ stream bị chặn (TCP head-of-line blocking).</li>
        </ul>

        <h3>HTTP/3 sửa gì?</h3>
        <p>HTTP/3 chạy trên <span class="kw">QUIC</span> (trên UDP). Mỗi stream độc lập ở tầng transport, nên mất gói chỉ ảnh hưởng stream đó. Thêm vào đó handshake gộp với TLS 1.3, giảm còn 1 RTT (hoặc 0-RTT).</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>HTTP/1.1</th><th>HTTP/2</th><th>HTTP/3</th></tr></thead>
            <tbody>
              <tr><td>Transport</td><td>TCP</td><td>TCP</td><td>QUIC/UDP</td></tr>
              <tr><td>Multiplexing</td><td>Không (pipelining hỏng)</td><td>Có, nhưng bị chặn bởi TCP</td><td>Có, độc lập hoàn toàn</td></tr>
              <tr><td>Header compression</td><td>Không</td><td>HPACK</td><td>QPACK</td></tr>
              <tr><td>Handshake</td><td>TCP + TLS = 2-3 RTT</td><td>2-3 RTT</td><td>1 RTT / 0 RTT</td></tr>
              <tr><td>Khi nào dùng</td><td>Legacy, nội bộ đơn giản</td><td>Mặc định web hiện nay</td><td>Mobile, mạng yếu, CDN lớn</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Câu hỏi phỏng vấn hay gặp</div>
            <p>"Tại sao HTTP/2 không cần domain sharding nữa?" → Vì multiplexing cho phép nhiều request trên 1 kết nối, và sharding lại làm mất lợi ích của connection reuse + HPACK.</p>
          </div>
        </div>`
    },

    {
      id: 'dns-tls', num: '0.3', title: 'DNS, CDN và TLS — ba lớp giảm độ trễ',
      html: `
        <h3>DNS: bản đồ của Internet</h3>
        <p>DNS là hệ thống phân tán có thứ bậc. Một lookup đi qua: browser cache → OS cache → <span class="kw">recursive resolver</span> (8.8.8.8, 1.1.1.1) → root server → TLD server → authoritative nameserver.</p>

        <div class="diagram">
          <svg viewBox="0 0 700 220" role="img" aria-label="Luồng phân giải DNS từ client đến authoritative nameserver">
            <defs><marker id="m0b" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><polygon points="0 0, 10 4, 0 8" fill="#505a68"/></marker></defs>
            <g font-size="11" font-weight="700">
              <rect x="20" y="80" width="96" height="56" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="68" y="104" text-anchor="middle" fill="#151515">Browser</text>
              <text x="68" y="120" text-anchor="middle" fill="#505a68" font-size="9">cache → OS</text>

              <rect x="150" y="80" width="110" height="56" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="205" y="104" text-anchor="middle" fill="#151515">Resolver</text>
              <text x="205" y="120" text-anchor="middle" fill="#505a68" font-size="9">recursive</text>

              <rect x="296" y="14" width="110" height="48" rx="8" fill="#f8fafc" stroke="#151515" stroke-width="2"/>
              <text x="351" y="44" text-anchor="middle" fill="#151515">Root (.)</text>

              <rect x="296" y="80" width="110" height="48" rx="8" fill="#f8fafc" stroke="#151515" stroke-width="2"/>
              <text x="351" y="110" text-anchor="middle" fill="#151515">TLD (.com)</text>

              <rect x="296" y="146" width="110" height="48" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="351" y="176" text-anchor="middle" fill="#151515">Authoritative</text>

              <rect x="452" y="80" width="96" height="56" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="500" y="112" text-anchor="middle" fill="#151515">Origin</text>
            </g>
            <line x1="118" y1="108" x2="144" y2="108" stroke="#505a68" stroke-width="2" marker-end="url(#m0b)"/>
            <line x1="262" y1="96" x2="290" y2="52" stroke="#505a68" stroke-width="1.6" marker-end="url(#m0b)"/>
            <line x1="262" y1="108" x2="290" y2="108" stroke="#505a68" stroke-width="1.6" marker-end="url(#m0b)"/>
            <line x1="262" y1="120" x2="290" y2="164" stroke="#505a68" stroke-width="1.6" marker-end="url(#m0b)"/>
            <line x1="408" y1="108" x2="446" y2="108" stroke="#505a68" stroke-width="2" marker-end="url(#m0b)"/>
            <text x="500" y="152" text-anchor="middle" font-size="10" font-weight="600" fill="#505a68">trả IP cuối cùng</text>
          </svg>
          <div class="diagram-cap">Hình 0.2 — Phân giải DNS đệ quy. Resolver cache theo TTL nên phần lớn lookup không đi hết chuỗi.</div>
        </div>

        <h3>CDN: cache ở gần người dùng</h3>
        <p><span class="kw">CDN</span> đặt máy chủ tại nhiều PoP (point of presence). Người dùng được anycast/DNS route tới PoP gần nhất. Lợi ích: giảm RTT, giảm tải origin, chống DDoS ở biên.</p>
        <ul class="list-bullet">
          <li><strong>Pull CDN</strong> — PoP tự fetch từ origin khi miss. Phù hợp nội dung lớn, thay đổi thường xuyên.</li>
          <li><strong>Push CDN</strong> — đẩy nội dung lên CDN trước. Phù hợp nội dung ít đổi, cần hit rate cao ngay.</li>
          <li><strong>Cache invalidation</strong> — dùng versioned URL (<code>/app.3f8a.js</code>) thay vì purge.</li>
        </ul>

        <h3>TLS handshake</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">TLS 1.3</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># 1 RTT (0-RTT nếu session resumption)</span>
Client                                Server
  | ---- ClientHello (key_share) -------> |
  | <--- ServerHello (key_share, cert) -- |
  | ---- Finished ----------------------> |
  | <--- Finished ----------------------- |
  | ===== encrypted application data ==== |

<span class="c-com"># TLS 1.2 cần 2 RTT, TLS 1.3 gộp key exchange vào hello</span></code></pre>
        </div>`
    },

    {
      id: 'os', num: '0.4', title: 'Hệ điều hành: process, thread và các mô hình I/O',
      html: `
        <p>Đây là phần quyết định <span class="kw">throughput</span> thực tế của server. Một server 8 core có thể phục vụ 10&nbsp;000 kết nối đồng thời nếu dùng đúng mô hình I/O — hoặc chỉ 8 nếu dùng sai.</p>

        <h3>Process vs Thread</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>Process</th><th>Thread</th></tr></thead>
            <tbody>
              <tr><td>Không gian địa chỉ</td><td>Riêng biệt</td><td>Chia sẻ trong process</td></tr>
              <tr><td>Chi phí tạo</td><td>Nặng (~ms)</td><td>Nhẹ (~µs)</td></tr>
              <tr><td>Giao tiếp</td><td>IPC (pipe, socket, shared mem)</td><td>Biến dùng chung (cần lock)</td></tr>
              <tr><td>Cô lập lỗi</td><td>Tốt — crash không lan</td><td>Kém — 1 thread crash cả process</td></tr>
              <tr><td>Dùng khi</td><td>Cần cô lập (browser tab, worker)</td><td>Cần chia sẻ state, I/O song song</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Bốn mô hình I/O</h3>
        <ol class="list-num">
          <li><strong>Blocking I/O</strong> — thread chờ đến khi có dữ liệu. Đơn giản, nhưng cần 1 thread/kết nối.</li>
          <li><strong>Non-blocking I/O</strong> — gọi trả về ngay (<code>EAGAIN</code>), phải poll liên tục → tốn CPU.</li>
          <li><strong>I/O multiplexing</strong> — <code>select</code>/<code>poll</code>/<code>epoll</code>/<code>kqueue</code>. Một thread theo dõi nhiều fd. Nền tảng của Nginx, Redis, Node.js.</li>
          <li><strong>Async I/O</strong> — kernel báo khi hoàn tất (io_uring trên Linux). Hiệu quả nhất nhưng phức tạp.</li>
        </ol>

        <div class="diagram">
          <svg viewBox="0 0 700 250" role="img" aria-label="So sánh mô hình thread-per-connection và event loop">
            <text x="170" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="#151515">Thread-per-connection</text>
            <text x="520" y="20" text-anchor="middle" font-size="12" font-weight="800" fill="#151515">Event loop (epoll)</text>

            <rect x="40" y="34" width="260" height="200" rx="10" fill="#f8fafc" stroke="#151515" stroke-width="2"/>
            <rect x="400" y="34" width="260" height="200" rx="10" fill="#f8fafc" stroke="#151515" stroke-width="2"/>

            <g font-size="10" font-weight="700" fill="#505a68">
              <rect x="56" y="52" width="48" height="34" rx="6" fill="#fee2e2" stroke="#151515" stroke-width="1.6"/><text x="80" y="73" text-anchor="middle">T1</text>
              <rect x="112" y="52" width="48" height="34" rx="6" fill="#fee2e2" stroke="#151515" stroke-width="1.6"/><text x="136" y="73" text-anchor="middle">T2</text>
              <rect x="168" y="52" width="48" height="34" rx="6" fill="#fee2e2" stroke="#151515" stroke-width="1.6"/><text x="192" y="73" text-anchor="middle">T3</text>
              <rect x="224" y="52" width="48" height="34" rx="6" fill="#fef3c7" stroke="#151515" stroke-width="1.6"/><text x="248" y="73" text-anchor="middle">T…</text>
              <text x="170" y="112" text-anchor="middle" font-size="10.5" fill="#505a68">1 thread / kết nối</text>
              <text x="170" y="134" text-anchor="middle" font-size="10.5" fill="#505a68">10k kết nối = 10k thread</text>
              <text x="170" y="156" text-anchor="middle" font-size="10.5" fill="#ef4444">context switch đắt</text>
              <text x="170" y="184" text-anchor="middle" font-size="10.5" fill="#505a68">RAM ~1MB/thread</text>
              <text x="170" y="206" text-anchor="middle" font-size="10.5" fill="#505a68">→ giới hạn ~ vài nghìn</text>
            </g>

            <g font-size="10" font-weight="700" fill="#505a68">
              <circle cx="530" cy="80" r="30" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="530" y="84" text-anchor="middle" font-size="9">EVENT</text>
              <text x="530" y="96" text-anchor="middle" font-size="9">LOOP</text>
              <rect x="438" y="140" width="40" height="26" rx="5" fill="#e9f0fc" stroke="#151515" stroke-width="1.6"/><text x="458" y="157" text-anchor="middle" font-size="9">fd1</text>
              <rect x="486" y="140" width="40" height="26" rx="5" fill="#e9f0fc" stroke="#151515" stroke-width="1.6"/><text x="506" y="157" text-anchor="middle" font-size="9">fd2</text>
              <rect x="534" y="140" width="40" height="26" rx="5" fill="#e9f0fc" stroke="#151515" stroke-width="1.6"/><text x="554" y="157" text-anchor="middle" font-size="9">fd3</text>
              <rect x="582" y="140" width="40" height="26" rx="5" fill="#e9f0fc" stroke="#151515" stroke-width="1.6"/><text x="602" y="157" text-anchor="middle" font-size="9">fd…</text>
              <text x="530" y="196" text-anchor="middle" font-size="10.5" fill="#10b981">1 thread, nhiều fd</text>
              <text x="530" y="216" text-anchor="middle" font-size="10.5" fill="#505a68">10k kết nối vẫn ổn</text>
            </g>
            <line x1="530" y1="110" x2="530" y2="134" stroke="#151515" stroke-width="2"/>
          </svg>
          <div class="diagram-cap">Hình 0.3 — Hai mô hình server kinh điển. Hầu hết server hiện đại (Nginx, Redis, Node, Go runtime) dùng event loop + non-blocking.</div>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Bẫy phổ biến khi phỏng vấn</div>
            <p>Nói "dùng thread pool để scale" mà không nói giới hạn. Thread pool chỉ giúp khi tác vụ là I/O-bound; với CPU-bound, thêm thread không tăng throughput mà còn làm chậm do context switch.</p>
          </div>
        </div>`
    },

    {
      id: 'db', num: '0.5', title: 'Cơ sở dữ liệu: ACID, transaction và index',
      html: `
        <h3>ACID — bốn đảm bảo</h3>
        <ul class="list-bullet">
          <li><span class="kw">Atomicity</span> — transaction hoặc xong hết hoặc không gì cả (rollback).</li>
          <li><span class="kw">Consistency</span> — dữ liệu luôn vi phạm constraint nào (khác "C" trong CAP!).</li>
          <li><span class="kw">Isolation</span> — transaction đồng thời không thấy dữ liệu trung gian của nhau.</li>
          <li><span class="kw">Durability</span> — commit rồi thì mất điện vẫn còn (WAL + fsync).</li>
        </ul>

        <h3>Bốn mức isolation</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Level</th><th>Dirty read</th><th>Non-repeatable</th><th>Phantom</th><th>Dùng khi</th></tr></thead>
            <tbody>
              <tr><td>Read Uncommitted</td><td>Có thể</td><td>Có thể</td><td>Có thể</td><td>Gần như không dùng</td></tr>
              <tr><td>Read Committed</td><td>Không</td><td>Có thể</td><td>Có thể</td><td>Mặc định Postgres</td></tr>
              <tr><td>Repeatable Read</td><td>Không</td><td>Không</td><td>Có thể</td><td>Mặc định MySQL InnoDB</td></tr>
              <tr><td>Serializable</td><td>Không</td><td>Không</td><td>Không</td><td>Cần đúng tuyệt đối (giao dịch tiền)</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Index: tại sao nhanh hơn 1000×</h3>
        <p>Không có index, tìm 1 dòng trong 10 triệu dòng là <span class="kw">full table scan</span> — O(n). B+ tree giảm còn O(log n) ≈ 24 lần so sánh, và mỗi node là một page 16&nbsp;KB nên đọc từ đĩa chỉ 3–4 lần.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">sql</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Không index: quét 10M dòng</span>
SELECT * FROM orders WHERE user_id = 42;
<span class="c-out">-- Seq Scan on orders (cost=0..183421 rows=1) (actual time=812ms)</span>

<span class="c-com">-- Có index: 3-4 page read</span>
CREATE INDEX idx_orders_user ON orders(user_id);
<span class="c-out">-- Index Scan using idx_orders_user (cost=0..8 rows=1) (actual time=0.04ms)</span>

<span class="c-com">-- Composite index: thứ tự cột quan trọng</span>
CREATE INDEX idx_user_status_created
  ON orders(user_id, status, created_at DESC);

<span class="c-key">SELECT</span> * <span class="c-key">FROM</span> orders
<span class="c-key">WHERE</span> user_id = <span class="c-num">42</span>          <span class="c-com">-- dùng được index</span>
  <span class="c-key">AND</span> status = <span class="c-str">'paid'</span>     <span class="c-com">-- dùng được (cột 2)</span>
<span class="c-key">ORDER BY</span> created_at <span class="c-key">DESC</span>; <span class="c-com">-- dùng được (cột 3), không cần sort</span></code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Index không miễn phí</div>
            <p>Mỗi index làm chậm INSERT/UPDATE/DELETE (phải ghi thêm page) và tốn dung lượng. Index thừa là nguyên nhân phổ biến khiến write throughput tụt. Quy tắc: index cho truy vấn đọc quan trọng, không index "cho chắc".</p>
          </div>
        </div>`
    },

    {
      id: 'nosql', num: '0.6', title: 'Chọn NoSQL đúng loại',
      html: `
        <p>"NoSQL" không phải một thứ — nó là bốn họ CSDL với mô hình dữ liệu hoàn toàn khác nhau.</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Loại</th><th>Ví dụ</th><th>Phù hợp</th><th>Không phù hợp</th></tr></thead>
            <tbody>
              <tr><td>Key-Value</td><td>Redis, DynamoDB, etcd</td><td>Session, cache, counter, config</td><td>Truy vấn theo nhiều tiêu chí</td></tr>
              <tr><td>Document</td><td>MongoDB, Couchbase</td><td>Dữ liệu lồng nhau, schema linh hoạt</td><td>Join phức tạp, transaction đa document lớn</td></tr>
              <tr><td>Wide-column</td><td>Cassandra, ScyllaDB, HBase</td><td>Ghi cực nhiều, time-series, multi-DC</td><td>Truy vấn ad-hoc, aggregate phức tạp</td></tr>
              <tr><td>Graph</td><td>Neo4j, Neptune</td><td>Quan hệ nhiều bậc (social, fraud)</td><td>Dữ liệu dạng bảng đơn giản</td></tr>
              <tr><td>Search</td><td>Elasticsearch, OpenSearch</td><td>Full-text, facet, log analytics</td><td>Source of truth, transaction</td></tr>
              <tr><td>Time-series</td><td>InfluxDB, TimescaleDB</td><td>Metrics, IoT, monitoring</td><td>Quan hệ thực thể phức tạp</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Nguyên tắc chọn</div>
            <p>Bắt đầu bằng <strong>access pattern</strong>, không phải bằng công nghệ. Viết ra 5–10 truy vấn quan trọng nhất, đo tỉ lệ read/write, rồi mới chọn. "Dùng NoSQL cho scale" là câu trả lời sai nếu bạn chỉ cần đọc theo ID — Postgres với index cũng làm được.</p>
          </div>
        </div>`
    },

    {
      id: 'cap', num: '0.7', title: 'CAP, PACELC và các mô hình nhất quán',
      html: `
        <h3>CAP theorem — và cách nó bị hiểu sai</h3>
        <p>CAP nói: khi có <span class="kw">network partition</span> (P), hệ thống phải chọn giữa <span class="kw">Consistency</span> (C) và <span class="kw">Availability</span> (A). Không có "chọn 2 trong 3" — P là điều bạn không kiểm soát được, nên thực chất chỉ chọn C hoặc A <em>khi partition xảy ra</em>.</p>

        <div class="diagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Tam giác CAP và vị trí các hệ thống thực tế">
            <polygon points="320,30 100,220 540,220" fill="#f8fafc" stroke="#151515" stroke-width="2"/>
            <text x="320" y="22" text-anchor="middle" font-size="12" font-weight="900" fill="#151515">Consistency</text>
            <text x="82" y="238" text-anchor="middle" font-size="12" font-weight="900" fill="#151515">Availability</text>
            <text x="558" y="238" text-anchor="middle" font-size="12" font-weight="900" fill="#151515">Partition tolerance</text>

            <text x="320" y="150" text-anchor="middle" font-size="10.5" font-weight="700" fill="#505a68">CP</text>
            <text x="320" y="168" text-anchor="middle" font-size="9.5" font-weight="600" fill="#505a68">(từ chối khi mất kết nối)</text>

            <text x="200" y="196" text-anchor="middle" font-size="10.5" font-weight="700" fill="#505a68">AP</text>
            <text x="200" y="212" text-anchor="middle" font-size="9.5" font-weight="600" fill="#505a68">(vẫn phục vụ, có thể stale)</text>

            <circle cx="320" cy="108" r="5" fill="#5294ff" stroke="#151515" stroke-width="1.6"/>
            <text x="336" y="112" font-size="9.5" font-weight="700" fill="#151515">ZooKeeper, etcd, HBase</text>

            <circle cx="240" cy="180" r="5" fill="#10b981" stroke="#151515" stroke-width="1.6"/>
            <text x="136" y="150" font-size="9.5" font-weight="700" fill="#151515">Cassandra, DynamoDB</text>

            <circle cx="330" cy="140" r="5" fill="#f4d77c" stroke="#151515" stroke-width="1.6"/>
            <text x="344" y="144" font-size="9.5" font-weight="700" fill="#151515">MongoDB (majority)</text>
          </svg>
          <div class="diagram-cap">Hình 0.4 — Vị trí tương đối. Trong thực tế hệ thống có thể cấu hình được (DynamoDB có strong read, Mongo có write concern).</div>
        </div>

        <h3>PACELC — bổ sung phần quan trọng hơn</h3>
        <p>Daniel Abadi nhận ra CAP chỉ nói về lúc có partition, trong khi phần lớn thời gian hệ thống <em>bình thường</em>. PACELC nói: <strong>nếu P → chọn A hoặc C; Else → chọn Latency hoặc Consistency</strong>.</p>
        <p>Ví dụ: DynamoDB có thể cấu hình strongly consistent read, nhưng phải trả giá bằng <span class="kw">latency</span> cao hơn (phải chờ majority). Đây mới là trade-off bạn gặp hằng ngày.</p>

        <h3>Các mô hình nhất quán</h3>
        <ul class="list-bullet">
          <li><span class="kw">Strong consistency</span> — đọc luôn thấy write mới nhất. Đắt, cần consensus hoặc single node.</li>
          <li><span class="kw">Linearizability</span> — mạnh hơn strong: mọi operation trông như thực hiện tuần tự tại một thời điểm.</li>
          <li><span class="kw">Causal consistency</span> — nếu A xảy ra trước B thì mọi node thấy A trước B. Thực dụng cho mạng xã hội.</li>
          <li><span class="kw">Eventual consistency</span> — các replica sẽ hội tụ nếu không có write mới. Rẻ, scale tốt.</li>
          <li><span class="kw">Read-your-writes</span> — user đọc thấy write của chính mình. Thường dùng session pin.</li>
        </ul>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Áp dụng thực tế</div>
            <p>Với hệ thống tin nhắn: gửi tin (write) — giữ nguyên thứ tự causal; hiển thị avatar — eventual consistency hoàn toàn ổn; số dư ví — bắt buộc strong/linearizable. Một hệ thống thường có nhiều mức nhất quán ở nhiều phần khác nhau.</p>
          </div>
        </div>`
    },

    {
      id: 'clocks', num: '0.8', title: 'Clocks, ordering và sự thật phũ phàng',
      html: `
        <p>Trong một máy, thứ tự sự kiện rõ ràng. Trong hệ phân tán, <strong>không có "bây giờ" chung</strong>. Đây là nguồn gốc của hàng loạt bug khó tìm.</p>

        <h3>Vì sao timestamp không đủ?</h3>
        <p>Đồng hồ vật lý lệch nhau (<span class="kw">clock skew</span>) vài ms đến vài chục ms do nhiệt độ, drift phần cứng, NTP sai. Nếu máy A ghi giá trị lúc 10:00:00.100 và máy B ghi lúc 10:00:00.090 (nhưng thực tế B xảy ra sau), dùng <span class="kw">last-write-wins</span> theo timestamp sẽ mất dữ liệu của A.</p>

        <h3>Giải pháp theo cấp độ</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách</th><th>Ý tưởng</th><th>Đảm bảo</th><th>Dùng ở</th></tr></thead>
            <tbody>
              <tr><td>Lamport clock</td><td>Counter tăng theo message</td><td>Thứ tự nhân quả</td><td>Distributed lock, log</td></tr>
              <tr><td>Vector clock</td><td>Vector đếm cho mỗi node</td><td>Phát hiện conflict</td><td>Dynamo, Riak</td></tr>
              <tr><td>Hybrid Logical Clock</td><td>Physical + logical</td><td>Causality + gần thời gian thực</td><td>CockroachDB</td></tr>
              <tr><td>TrueTime</td><td>GPS + atomic clock, trả khoảng [earliest, latest]</td><td>Linearizability ngoài trời</td><td>Spanner (Google)</td></tr>
            </tbody>
          </table>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">text</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># Lamport clock</span>
A: e1 (t=1) ----send(t=1)----> B: receives, t = max(local,1)+1 = 2
A: e2 (t=2)                    B: e3 (t=3)
                               
<span class="c-com"># Quy tắc: nếu a → b (nhân quả) thì L(a) < L(b)</span>
<span class="c-com"># Nhưng L(a) < L(b) KHÔNG suy ra a → b (chỉ là tiềm năng)</span>

<span class="c-com"># Vector clock</span>
A = [A:2, B:0, C:0]
B = [A:2, B:1, C:0]
<span class="c-out">→ A < B (A xảy ra trước B)</span>

A = [A:2, B:1, C:0]
B = [A:1, B:2, C:0]
<span class="c-out">→ conflict (không so sánh được) → cần resolve</span></code></pre>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Bài học thiết kế</div>
            <p>Đừng bao giờ dựa vào "hai máy có cùng thời gian" cho logic nghiệp vụ. Dùng idempotency key, version number, hoặc logical clock. Nếu buộc dùng thời gian, hãy chấp nhận cửa sổ sai số và viết logic chịu được nó.</p>
          </div>
        </div>`
    }
  ],

  quiz: [
    {
      q: 'Một service có P99 latency 2 giây nhưng average chỉ 80 ms. Nguyên nhân khả dĩ và cách xử lý?',
      a: 'Average thấp + P99 cao là dấu hiệu tail latency do queueing hoặc GC pause. Nguyên nhân thường gặp: (1) request rơi vào thời điểm thread pool/connection pool đầy, phải xếp hàng; (2) stop-the-world GC; (3) một dependency chậm chỉ với một số key (hot shard); (4) retry storm. Cách xử lý: dùng hedged request (gửi sang replica thứ 2 nếu quá chậm), tách pool theo dependency, tránh head-of-line blocking bằng bulkhead, và giới hạn retry bằng token bucket.'
    },
    {
      q: 'Tại sao "chọn 2 trong 3 CAP" là cách phát biểu sai?',
      a: 'Vì Partition tolerance không phải lựa chọn — mạng sẽ partition dù bạn muốn hay không. Câu đúng là: khi partition xảy ra, bạn buộc phải chọn giữa Consistency và Availability. Trong thời gian không có partition (phần lớn thời gian), trade-off thật là Latency vs Consistency — đó là nội dung của PACELC.'
    },
    {
      q: 'Với 10.000 kết nối đồng thời, tại sao mô hình thread-per-connection thường thất bại?',
      a: 'Mỗi thread tốn ~1 MB stack ảo và chi phí context switch của kernel. 10k thread = 10 GB stack tiềm năng và scheduler phải liên tục chuyển ngữ cảnh, mất phần lớn CPU cho việc chuyển thay vì xử lý. Event loop (epoll/kqueue) chỉ dùng vài thread để theo dõi hàng chục nghìn fd, chỉ cấp phát CPU khi có dữ liệu thật sự.'
    },
    {
      q: 'Bạn cần lưu lịch sử giao dịch tài chính, mỗi ngày 50 triệu dòng, truy vấn chủ yếu theo (account_id, thời gian). Chọn CSDL nào và tại sao?',
      a: 'Ưu tiên wide-column hoặc relational có partition theo account_id — ví dụ Cassandra/ScyllaDB với partition key = account_id, clustering key = created_at DESC. Lý do: ghi cực nhiều (append-only), truy vấn luôn theo account + khoảng thời gian (một partition), không cần join. Nếu cần transaction và báo cáo phức tạp, dùng Postgres/MySQL có partition table và read replica. Tránh dùng document DB vì không tối ưu cho range scan lớn.'
    }
  ]
};

/* ============================================================
   Module 2 — Building Blocks
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[2] = {
  title: 'Module 2 — Building Blocks',
  lead: 'Chín viên gạch này xuất hiện trong <em>mọi</em> buổi phỏng vấn system design, dù đề bài là Twitter, Uber hay Netflix. Học chúng theo trình tự: cái nào giải quyết vấn đề gì, hoạt động ra sao, và khi nào thì <span class="kw-y">không</span> nên dùng. Người mới thường nhồi tất cả building block vào một thiết kế — đó là sai lầm nghiêm trọng nhất.',

  keywords: [
    { term: 'Load Balancer (L4/L7)', def: 'Thiết bị/phần mềm phân phối request. L4 chỉ nhìn IP:port (nhanh, không hiểu HTTP). L7 đọc được URL/header/cookie nên route theo path, terminate TLS, thêm header.' },
    { term: 'Health check', def: 'LB định kỳ gọi /health. Active: LB chủ động ping. Passive: LB quan sát lỗi thật từ traffic. Thiếu health check sai = LB đẩy traffic vào instance đã chết.' },
    { term: 'Sticky session', def: 'Ghim một user vào một server (bằng cookie hoặc hash IP). Cần khi server giữ session state — nhưng đó là dấu hiệu kiến trúc nên sửa thành stateless.' },
    { term: 'Cache-aside (lazy loading)', def: 'App tự đọc cache, miss thì đọc DB rồi ghi lại cache. Phổ biến nhất, dễ hiểu, nhưng có thể bị stale và có 3 request thay vì 1.' },
    { term: 'Write-through / write-behind', def: 'Write-through: ghi cache + DB đồng thời (nhất quán, chậm ghi). Write-behind: ghi cache trước, DB sau (nhanh, mất dữ liệu nếu cache chết).' },
    { term: 'Cache invalidation', def: 'Bài toán khó nhất: khi dữ liệu gốc đổi, cache cũ phải bị xoá. Dùng TTL, publish event, hoặc version key để tránh ghi đè bằng dữ liệu cũ.' },
    { term: 'Cache stampede', def: 'Một key hot hết hạn, hàng nghìn request cùng miss và cùng đổ vào DB. Chặn bằng single-flight lock, probabilistic early expiration, hoặc never-expire + refresh nền.' },
    { term: 'Token bucket', def: 'Xô chứa token, nạp đều theo rate, mỗi request lấy 1 token. Cho phép burst tới capacity. Redis + Lua script là cách chuẩn để làm atomic.' },
    { term: 'Sliding window counter', def: 'Xấp xỉ sliding window bằng cách nội suy giữa 2 fixed window liền kề. Sai số nhỏ (~0,003% theo Cloudflare) nhưng rẻ hơn sliding window log.' },
    { term: 'Message Queue vs Event Log', def: 'Queue (SQS/RabbitMQ): message bị xoá sau khi xử lý, một consumer. Log (Kafka): giữ lại, nhiều consumer group đọc độc lập, replay được.' },
    { term: 'At-least-once / idempotency', def: 'Queue thường giao ít nhất 1 lần ⇒ consumer phải idempotent. Dùng idempotency key + bảng dedupe, hoặc unique constraint trong DB.' },
    { term: 'CDN & cache-control', def: 'Mạng edge đặt gần user. s-maxage cho CDN, max-age cho browser, stale-while-revalidate để vẫn trả bản cũ trong lúc fetch bản mới.' },
    { term: 'Inverted index', def: 'Map từ term → danh sách document chứa term đó (posting list). Nền tảng của mọi search engine, khác hoàn toàn LIKE %keyword% trên SQL.' },
    { term: 'Fan-out on write vs read', def: 'Write: đẩy bài vào feed sẵn của follower (đọc nhanh, ghi đắt). Read: gom khi đọc (ghi rẻ, đọc chậm). News feed dùng hybrid.' }
  ],

  sections: [
    {
      id: 'overview', num: '2.1', title: 'Bản đồ building blocks — mỗi cái giải quyết vấn đề gì',
      html: `
        <p>Trước khi học từng cái, hãy nhìn chúng như một <span class="kw">bộ đồ nghề</span>. Mỗi dụng cụ tồn tại vì một vấn đề cụ thể. Nếu bạn không nêu được vấn đề, bạn đang over-engineer.</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Building block</th><th>Vấn đề nó giải quyết</th><th>Triệu chứng nếu thiếu</th><th>Triệu chứng nếu lạm dụng</th></tr></thead>
            <tbody>
              <tr><td><strong>Load Balancer</strong></td><td>Một máy không chịu nổi tải; cần HA</td><td>1 server quá tải, downtime khi chết</td><td>Thêm 1 hop latency; LB thành SPOF nếu chỉ 1 cái</td></tr>
              <tr><td><strong>Cache</strong></td><td>Đọc lặp lại tốn kém; DB là bottleneck</td><td>DB chết vì read; P99 cao</td><td>Dữ liệu stale, invalidate sai, cache stampede</td></tr>
              <tr><td><strong>Rate Limiter</strong></td><td>Bảo vệ hệ thống khỏi abuse/burst</td><td>Bị DDoS, 1 client chiếm hết tài nguyên</td><td>Chặn nhầm user thật; thêm 1 round-trip Redis</td></tr>
              <tr><td><strong>Message Queue</strong></td><td>Tách producer/consumer, xử lý bất đồng bộ</td><td>Request chậm vì gọi đồng bộ; mất task khi crash</td><td>Lag tăng vô hạn; khó debug; eventual consistency</td></tr>
              <tr><td><strong>CDN</strong></td><td>Nội dung tĩnh đi xa; origin quá tải</td><td>Latency toàn cầu cao; egress cost lớn</td><td>Cache nội dung động → sai dữ liệu per-user</td></tr>
              <tr><td><strong>Search Index</strong></td><td>Cần full-text search, fuzzy, ranking</td><td>LIKE '%x%' full scan, chậm và không xếp hạng</td><td>Đồng bộ index trễ; tốn storage gấp 2–3×</td></tr>
              <tr><td><strong>API Gateway</strong></td><td>Xác thực, rate limit, routing tập trung</td><td>Mỗi service tự làm auth → trùng lặp, lệch nhau</td><td>Gateway phình to thành monolith mới</td></tr>
              <tr><td><strong>Service Discovery</strong></td><td>Instance IP thay đổi liên tục</td><td>Hard-code IP; deploy xong là hỏng</td><td>Thêm phụ thuộc; DNS cache TTL gây lỗi</td></tr>
              <tr><td><strong>ID Generator</strong></td><td>Cần ID duy nhất, không đoán được, sắp xếp được</td><td>Auto-increment 1 DB không scale; UUID random phá index</td><td>Clock skew làm ID trùng/lệch</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Thứ tự ưu tiên khi thiết kế</h3>
        <p>Khi phỏng vấn, đừng vẽ cả 9 block. Thứ tự hợp lý là:</p>
        <ol class="list-num">
          <li><strong>Luồng cơ bản chạy được</strong> — client → API → DB. Vẽ cái này trước, nó chiếm 80% thời gian.</li>
          <li><strong>Chỗ nào đọc nhiều</strong> → thêm cache + read replica.</li>
          <li><strong>Chỗ nào cần scale ngang</strong> → thêm load balancer.</li>
          <li><strong>Chỗ nào cần bảo vệ</strong> → rate limiter, auth.</li>
          <li><strong>Chỗ nào chậm nhưng không cần đồng bộ</strong> → message queue.</li>
          <li><strong>Chỗ nào cần tìm kiếm</strong> → search index.</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Lỗi phổ biến: vẽ hết building block ngay từ phút thứ 5</div>
            <p>Người phỏng vấn sẽ hỏi "tại sao cần cái này?" và bạn phải trả lời bằng <em>con số</em>. Nếu ước lượng ra 500 QPS, một Postgres đơn là đủ — thêm Kafka chỉ làm hệ thống khó vận hành hơn mà không giải quyết vấn đề nào.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 420" role="img" aria-label="Sơ đồ vị trí các building block trong một kiến trúc web điển hình">
            <defs>
              <marker id="m2a" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#505a68"/>
              </marker>
            </defs>
            <g font-size="11" font-weight="700" fill="#151515">
              <rect x="18" y="180" width="88" height="46" rx="9" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="62" y="200" text-anchor="middle">Client</text>
              <text x="62" y="214" text-anchor="middle" font-size="9.5" fill="#505a68">browser/app</text>

              <rect x="130" y="172" width="96" height="62" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="178" y="194" text-anchor="middle">CDN edge</text>
              <text x="178" y="208" text-anchor="middle" font-size="9.5" fill="#505a68">static + TLS</text>
              <text x="178" y="222" text-anchor="middle" font-size="9.5" fill="#505a68">cache</text>

              <rect x="250" y="172" width="104" height="62" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="302" y="194" text-anchor="middle">API Gateway</text>
              <text x="302" y="208" text-anchor="middle" font-size="9.5" fill="#505a68">auth · rate limit</text>
              <text x="302" y="222" text-anchor="middle" font-size="9.5" fill="#505a68">routing</text>

              <rect x="378" y="172" width="96" height="62" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="426" y="194" text-anchor="middle">Load Balancer</text>
              <text x="426" y="208" text-anchor="middle" font-size="9.5" fill="#505a68">L7 · health</text>
              <text x="426" y="222" text-anchor="middle" font-size="9.5" fill="#505a68">check</text>

              <rect x="498" y="120" width="104" height="52" rx="9" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="550" y="142" text-anchor="middle">Service A</text>
              <text x="550" y="156" text-anchor="middle" font-size="9.5" fill="#505a68">stateless ×N</text>

              <rect x="498" y="184" width="104" height="52" rx="9" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="550" y="206" text-anchor="middle">Service B</text>
              <text x="550" y="220" text-anchor="middle" font-size="9.5" fill="#505a68">stateless ×N</text>

              <rect x="498" y="248" width="104" height="52" rx="9" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="550" y="270" text-anchor="middle">Worker</text>
              <text x="550" y="284" text-anchor="middle" font-size="9.5" fill="#505a68">async ×N</text>

              <rect x="640" y="60" width="104" height="48" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
              <text x="692" y="80" text-anchor="middle">Redis</text>
              <text x="692" y="94" text-anchor="middle" font-size="9.5" fill="#505a68">cache</text>

              <rect x="640" y="122" width="104" height="48" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
              <text x="692" y="142" text-anchor="middle">Kafka</text>
              <text x="692" y="156" text-anchor="middle" font-size="9.5" fill="#505a68">event log</text>

              <rect x="640" y="184" width="104" height="48" rx="9" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="692" y="204" text-anchor="middle">Primary DB</text>
              <text x="692" y="218" text-anchor="middle" font-size="9.5" fill="#505a68">write</text>

              <rect x="640" y="246" width="104" height="48" rx="9" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="692" y="266" text-anchor="middle">Replicas</text>
              <text x="692" y="280" text-anchor="middle" font-size="9.5" fill="#505a68">read</text>

              <rect x="640" y="308" width="104" height="48" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="692" y="328" text-anchor="middle">Elasticsearch</text>
              <text x="692" y="342" text-anchor="middle" font-size="9.5" fill="#505a68">search index</text>

              <line x1="106" y1="203" x2="128" y2="203" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="226" y1="203" x2="248" y2="203" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="354" y1="203" x2="376" y2="203" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="474" y1="192" x2="496" y2="150" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="474" y1="203" x2="496" y2="208" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="474" y1="214" x2="496" y2="268" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="602" y1="146" x2="638" y2="90" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="602" y1="200" x2="638" y2="206" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="602" y1="274" x2="638" y2="148" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
              <line x1="602" y1="212" x2="638" y2="268" stroke="#505a68" stroke-width="2" marker-end="url(#m2a)"/>
            </g>
            <text x="380" y="398" text-anchor="middle" font-size="11" fill="#505a68" font-weight="600">Luồng đọc: CDN → Gateway → LB → Service → Redis (hit) hoặc Replica (miss)</text>
          </svg>
          <div class="diagram-cap">Hình 1 — Vị trí tương đối của 9 building block trong một kiến trúc web điển hình</div>
        </div>`
    },

    {
      id: 'load-balancer', num: '2.2', title: 'Load Balancer — phân phối tải và giữ hệ thống sống',
      html: `
        <p>Load balancer là building block đầu tiên bạn thêm khi một server không đủ. Nhưng nó có hai tầng hiểu biết: <span class="kw">L4</span> (chỉ nhìn gói tin) và <span class="kw">L7</span> (hiểu HTTP). Chọn sai tầng là lý do nhiều hệ thống không làm được routing thông minh.</p>

        <h3>L4 vs L7 — khác biệt thực sự nằm ở đâu</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tiêu chí</th><th>L4 (Transport)</th><th>L7 (Application)</th></tr></thead>
            <tbody>
              <tr><td>Nhìn thấy</td><td>IP nguồn/đích, port, TCP flag</td><td>Toàn bộ HTTP: URL, method, header, cookie, body</td></tr>
              <tr><td>Định tuyến theo</td><td>IP hash, round-robin, least-conn</td><td>Path (<code>/api/*</code>), host, header, cookie</td></tr>
              <tr><td>TLS</td><td>Pass-through (không giải mã)</td><td>Terminate hoặc re-encrypt</td></tr>
              <tr><td>Chi phí</td><td>Rất thấp, throughput rất cao</td><td>Cao hơn (parse HTTP), cần CPU</td></tr>
              <tr><td>Ví dụ</td><td>AWS NLB, IPVS, HAProxy mode TCP</td><td>Nginx, Envoy, ALB, Traefik</td></tr>
              <tr><td>Dùng khi</td><td>TCP/UDP thuần, DB proxy, game server</td><td>Web API, microservices, cần sticky/canary</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Các thuật toán cân bằng tải</h3>
        <ul class="list-bullet">
          <li><strong>Round robin</strong> — lần lượt từng server. Đơn giản, nhưng nếu request không đều nhau (1 request nặng 5s, 1 request nhẹ 5ms) thì server nhận request nặng sẽ nghẽn.</li>
          <li><strong>Weighted round robin</strong> — server khoẻ nhận nhiều hơn. Dùng khi máy không đồng cấu hình (migration, mixed instance types).</li>
          <li><strong>Least connections</strong> — chọn server ít kết nối đang mở nhất. Tốt cho request có thời gian xử lý biến thiên lớn (long-polling, WebSocket).</li>
          <li><strong>Least response time</strong> — kết hợp số connection và latency đo được. Tốt nhất về mặt trải nghiệm nhưng cần LB theo dõi metric, phức tạp hơn.</li>
          <li><strong>IP hash / consistent hash</strong> — cùng client (hoặc cùng key) luôn về cùng server. Cần cho cache local hoặc khi server giữ state. Nhược điểm: phân phối lệch nếu ít IP, và rebalance khi thêm/bớt node.</li>
          <li><strong>Random (power of two choices)</strong> — chọn ngẫu nhiên 2 server rồi lấy cái ít tải hơn. Gần tối ưu, cực rẻ, được dùng nhiều trong service mesh.</li>
        </ul>

        <h3>Health check — phần bị đánh giá thấp nhất</h3>
        <p>LB không tự biết server chết. Nó biết qua health check, và có hai kiểu:</p>
        <ul class="list-bullet">
          <li><span class="kw">Active health check</span> — LB gọi <code>GET /health</code> mỗi 5–10s. Nếu fail 3 lần liên tiếp → đánh dấu unhealthy, rút khỏi pool. Ưu điểm: phát hiện sớm. Nhược điểm: tốn request, và endpoint <code>/health</code> hay bị viết ẩu (chỉ <code>return 200</code> dù DB đã chết).</li>
          <li><span class="kw">Passive health check</span> — LB quan sát traffic thật, thấy 5 lỗi 5xx trong 30s thì rút server ra. Không tốn request, phản ánh đúng trải nghiệm user, nhưng phát hiện chậm hơn.</li>
        </ul>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Anti-pattern: health check chỉ trả 200</div>
            <p>Nếu <code>/health</code> không kiểm tra DB connection pool và dependency quan trọng, LB sẽ tiếp tục đẩy traffic vào một instance đã mất kết nối DB. Kết quả: user thấy lỗi 500 dù LB báo "tất cả khoẻ". Health check phải kiểm tra đúng thứ quyết định khả năng phục vụ — nhưng đừng kiểm tra quá nhiều (gọi 5 service trong health check sẽ làm health check tự thành nguồn lỗi).</p>
          </div>
        </div>

        <h3>Sticky session và cái bẫy phía sau</h3>
        <p>Khi server giữ session trong memory (giỏ hàng, login state), bạn buộc phải ghim user vào server — thường bằng cookie <code>AWSALB</code> hoặc hash IP. Vấn đề:</p>
        <ul class="list-bullet">
          <li>Deploy rolling update → user bị đá ra ngoài (session mất).</li>
          <li>Autoscaling không giúp được user đang ghim vào một server.</li>
          <li>Server chết → toàn bộ session trên nó mất, user phải login lại hàng loạt.</li>
        </ul>
        <p>Cách sửa đúng là làm service <span class="kw-g">stateless</span>: đưa session ra Redis hoặc dùng JWT. Khi đó mọi thuật toán LB đều hoạt động và autoscaling mới thực sự hiệu quả.</p>

        <h3>LB tự nó có phải single point of failure?</h3>
        <p>Có. Vì vậy trong thực tế LB luôn đi theo cặp: DNS trả về nhiều IP (DNS round robin) hoặc dùng <code>anycast</code>, và mỗi LB có thể là một cluster (ví dụ AWS ALB tự scale bên trong). Với on-premise: 2 LB chạy VRRP/keepalived, một active một standby, dùng chung virtual IP.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">nginx.conf</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># Cấu hình L7 tối thiểu nhưng đúng</span>
<span class="c-key">upstream</span> api_backend {
    <span class="c-key">least_conn</span>;                        <span class="c-com"># request biến thiên → least_conn</span>
    <span class="c-key">server</span> 10.0.1.11:8080 max_fails=3 fail_timeout=10s;
    <span class="c-key">server</span> 10.0.1.12:8080 max_fails=3 fail_timeout=10s;
    <span class="c-key">server</span> 10.0.1.13:8080 backup;       <span class="c-com"># chỉ nhận traffic khi 2 cái kia chết</span>
    <span class="c-key">keepalive</span> 64;                       <span class="c-com"># tái sử dụng connection tới backend</span>
}

<span class="c-key">server</span> {
    <span class="c-key">listen</span> 443 ssl http2;
    <span class="c-key">location</span> /api/ {
        <span class="c-key">proxy_pass</span> http://api_backend;
        <span class="c-key">proxy_http_version</span> 1.1;
        <span class="c-key">proxy_set_header</span> Connection "";
        <span class="c-key">proxy_connect_timeout</span> 2s;
        <span class="c-key">proxy_read_timeout</span> 30s;
        <span class="c-key">proxy_next_upstream</span> error timeout http_502;   <span class="c-com"># retry server khác</span>
    }
}</code></pre>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Câu trả lời phỏng vấn ăn điểm</div>
            <p>"Em dùng L7 LB vì cần terminate TLS và route theo path. Em đặt <code>proxy_next_upstream</code> để retry sang instance khác khi 502, nhưng chỉ retry cho request idempotent — GET/PUT, không retry POST tạo đơn hàng vì có thể tạo trùng." — Chi tiết này cho thấy bạn hiểu cả tầng mạng và tầng nghiệp vụ.</p>
          </div>
        </div>`
    },

    {
      id: 'caching', num: '2.3', title: 'Caching — chiến lược, invalidation và ba cái bẫy chết người',
      html: `
        <p>Cache là building block cho tỉ lệ lợi ích/chi phí cao nhất — thường giảm 80–95% tải DB chỉ với vài chục dòng code. Nhưng nó cũng là nguồn bug khó chịu nhất, vì dữ liệu sai <em>chỉ đôi khi</em>.</p>

        <h3>Bốn chiến lược ghi/đọc cache</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chiến lược</th><th>Cách hoạt động</th><th>Ưu</th><th>Nhược</th><th>Dùng khi</th></tr></thead>
            <tbody>
              <tr>
                <td><strong>Cache-aside</strong><br><span class="text-xs text-muted">lazy loading</span></td>
                <td>App đọc cache → miss → đọc DB → ghi cache</td>
                <td>Chỉ cache cái thực sự được dùng; cache chết không mất dữ liệu</td>
                <td>3 round-trip khi miss; dữ liệu có thể stale; stampede</td>
                <td>Mặc định cho hầu hết hệ thống</td>
              </tr>
              <tr>
                <td><strong>Read-through</strong></td>
                <td>App chỉ nói chuyện với cache, cache tự load từ DB</td>
                <td>Code app gọn; logic load tập trung</td>
                <td>Cần cache hỗ trợ loader; khó kiểm soát</td>
                <td>Dùng thư viện/cache có sẵn loader</td>
              </tr>
              <tr>
                <td><strong>Write-through</strong></td>
                <td>Ghi cache + DB trong cùng một thao tác</td>
                <td>Cache luôn nhất quán với DB</td>
                <td>Ghi chậm (2 lần ghi); cache chứa cả dữ liệu không bao giờ đọc</td>
                <td>Dữ liệu đọc ngay sau khi ghi (user vừa update profile)</td>
              </tr>
              <tr>
                <td><strong>Write-behind</strong><br><span class="text-xs text-muted">write-back</span></td>
                <td>Ghi cache, trả về ngay; nền flush xuống DB</td>
                <td>Ghi rất nhanh; gộp nhiều update</td>
                <td><strong>Mất dữ liệu</strong> nếu cache chết trước khi flush</td>
                <td>Counter, metric, dữ liệu chấp nhận mất</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 720 340" role="img" aria-label="So sánh luồng cache-aside và write-through">
            <defs>
              <marker id="m2c" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#505a68"/>
              </marker>
              <marker id="m2cr" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#ef4444"/>
              </marker>
            </defs>
            <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="#151515">Cache-aside (đọc)</text>
            <text x="540" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="#151515">Write-through (ghi)</text>

            <g font-size="11" font-weight="700" fill="#151515">
              <rect x="40" y="46" width="90" height="40" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="85" y="71" text-anchor="middle">App</text>

              <rect x="170" y="46" width="96" height="40" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
              <text x="218" y="71" text-anchor="middle">Redis</text>

              <rect x="170" y="150" width="96" height="40" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="218" y="175" text-anchor="middle">Postgres</text>

              <line x1="130" y1="60" x2="168" y2="60" stroke="#505a68" stroke-width="2" marker-end="url(#m2c)"/>
              <text x="149" y="52" text-anchor="middle" font-size="9.5" fill="#505a68">1 GET</text>

              <path d="M218 86 L218 148" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4" marker-end="url(#m2cr)"/>
              <text x="248" y="120" font-size="9.5" fill="#ef4444" font-weight="700">2 MISS</text>

              <path d="M266 170 L330 170 L330 66 L298 66" stroke="#505a68" stroke-width="2" fill="none" marker-end="url(#m2c)"/>
              <text x="352" y="120" font-size="9.5" fill="#505a68">3 SET</text>

              <text x="180" y="230" text-anchor="middle" font-size="10.5" fill="#505a68">miss: 3 round-trip · hit: 1 round-trip</text>
              <text x="180" y="248" text-anchor="middle" font-size="10.5" fill="#ef4444" font-weight="700">cache chết → vẫn đọc được DB</text>

              <rect x="420" y="46" width="90" height="40" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="465" y="71" text-anchor="middle">App</text>

              <rect x="552" y="46" width="96" height="40" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
              <text x="600" y="71" text-anchor="middle">Redis</text>

              <rect x="552" y="150" width="96" height="40" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
              <text x="600" y="175" text-anchor="middle">Postgres</text>

              <line x1="510" y1="66" x2="550" y2="66" stroke="#505a68" stroke-width="2" marker-end="url(#m2c)"/>
              <text x="530" y="58" text-anchor="middle" font-size="9.5" fill="#505a68">1 SET</text>
              <line x1="600" y1="86" x2="600" y2="148" stroke="#505a68" stroke-width="2" marker-end="url(#m2c)"/>
              <text x="632" y="120" font-size="9.5" fill="#505a68">2 SET</text>

              <text x="540" y="230" text-anchor="middle" font-size="10.5" fill="#505a68">ghi 2 lần · luôn nhất quán</text>
              <text x="540" y="248" text-anchor="middle" font-size="10.5" fill="#fb923c" font-weight="700">ghi chậm hơn 2×</text>
            </g>
            <text x="360" y="300" text-anchor="middle" font-size="11" fill="#505a68" font-weight="600">Chọn cache-aside trừ khi dữ liệu phải đọc lại ngay sau khi ghi</text>
          </svg>
          <div class="diagram-cap">Hình 2 — Cache-aside tối ưu cho đọc, write-through tối ưu cho tính nhất quán</div>
        </div>

        <h3>Invalidation — bài toán thực sự khó</h3>
        <p>Có bốn cách vô hiệu hoá cache, xếp theo độ phức tạp:</p>
        <ol class="list-num">
          <li><strong>TTL</strong> — đơn giản nhất: <code>SET key val EX 300</code>. Chấp nhận dữ liệu cũ tối đa 300s. Với dữ liệu ít đổi (profile, config) đây là lựa chọn đúng.</li>
          <li><strong>Explicit delete</strong> — khi update DB thì <code>DEL key</code>. Nhưng thứ tự quan trọng: phải <em>delete cache trước hay sau</em> khi ghi DB? Ghi DB rồi delete cache là an toàn hơn; delete trước rồi ghi DB có thể khiến một reader chen vào, đọc DB cũ, và ghi lại giá trị cũ vào cache.</li>
          <li><strong>Publish event</strong> — DB update phát event (Kafka/CDC), consumer xoá cache. Đúng trong hệ phân tán nhiều writer, nhưng có độ trễ.</li>
          <li><strong>Version key</strong> — nhúng version vào key: <code>user:42:v7</code>. Khi update, tăng version. Không cần xoá, cache cũ tự hết hạn. Cực kỳ hiệu quả với dữ liệu tổng hợp (aggregate) vì tránh được race condition.</li>
        </ol>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Bẫy 1 — Cache stampede (thundering herd)</div>
            <p>Một key hot (ví dụ trang chủ) hết hạn đúng lúc 10.000 request/giây cùng miss. Tất cả đổ vào DB, DB sập, và vì không ai ghi được cache nên tất cả tiếp tục miss — hệ thống sập hoàn toàn.</p>
            <p><strong>Cách chặn:</strong> (a) <em>single-flight</em>: chỉ 1 request được load, các request khác chờ hoặc trả bản cũ; (b) <em>probabilistic early expiration</em>: refresh sớm ngẫu nhiên trước khi hết hạn; (c) <em>never expire</em> + background refresh định kỳ — cache luôn có dữ liệu, chỉ lệch vài giây.</p>
          </div>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Bẫy 2 — Cache penetration</div>
            <p>Request cho key không tồn tại (<code>user:999999999</code>) sẽ <em>luôn</em> miss và luôn đánh vào DB — kẻ tấn công có thể dùng điều này để đánh sập DB mà không tốn gì.</p>
            <p><strong>Cách chặn:</strong> cache cả giá trị rỗng (<code>NULL</code>) với TTL ngắn (30–60s), hoặc dùng Bloom filter để loại key chắc chắn không tồn tại trước khi query DB.</p>
          </div>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Bẫy 3 — Cache avalanche</div>
            <p>Nhiều key hết hạn <em>cùng một thời điểm</em> (ví dụ toàn bộ cache được warm lúc 2h sáng với TTL 1 giờ, nên 3h sáng tất cả cùng hết).</p>
            <p><strong>Cách chặn:</strong> thêm jitter ngẫu nhiên vào TTL — <code>EX (3600 + random(0,600))</code>. Một dòng code, xoá bỏ hoàn toàn cả lớp sự cố này.</p>
          </div>
        </div>

        <h3>Tính toán cache có đáng không</h3>
        <p>Ví dụ: 50.000 QPS đọc, DB chịu được 5.000 QPS, cache hit 95%.</p>
        <ul class="list-bullet">
          <li>Load DB sau cache = 50.000 × 5% = <strong>2.500 QPS</strong> — nằm dưới ngưỡng 5.000. OK.</li>
          <li>Load cache = 50.000 QPS. Redis 1 node chịu được ~100.000 op/s đơn giản ⇒ 1 node đủ, nhưng nên 2 node + replica để HA.</li>
          <li>Memory: nếu key 1KB, cache 10 triệu key = 10GB. Redis cần RAM đủ chứa working set + overhead ~30%.</li>
        </ul>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">Python — cache-aside có single-flight</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-key">import</span> json, random

<span class="c-key">def</span> <span class="c-fn">get_user</span>(uid):
    key = <span class="c-str">f"user:{uid}:v{CURRENT_VERSION}"</span>
    raw = redis.get(key)
    <span class="c-key">if</span> raw <span class="c-key">is not None</span>:
        <span class="c-key">return</span> json.loads(raw)          <span class="c-com"># hit</span>

    <span class="c-com"># single-flight: chỉ 1 request được load, các request khác chờ</span>
    lock = redis.set(<span class="c-str">f"lock:{key}"</span>, <span class="c-str">"1"</span>, nx=<span class="c-key">True</span>, ex=<span class="c-num">5</span>)
    <span class="c-key">if not</span> lock:
        <span class="c-key">return</span> _wait_and_retry(uid)      <span class="c-com"># tránh stampede</span>

    <span class="c-key">try</span>:
        row = db.query(<span class="c-str">"SELECT * FROM users WHERE id=%s"</span>, uid)
        val = row <span class="c-key">or</span> {}                  <span class="c-com"># cache cả NULL để chặn penetration</span>
        ttl = <span class="c-num">300</span> + random.randint(<span class="c-num">0</span>, <span class="c-num">60</span>)  <span class="c-com"># jitter chống avalanche</span>
        redis.set(key, json.dumps(val), ex=ttl)
        <span class="c-key">return</span> val
    <span class="c-key">finally</span>:
        redis.delete(<span class="c-str">f"lock:{key}"</span>)</code></pre>
        </div>

        <h3>Cache ở đâu trong hệ thống?</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tầng</th><th>Công cụ</th><th>Latency</th><th>Dùng cho</th></tr></thead>
            <tbody>
              <tr><td>Browser</td><td>Cache-Control, ETag</td><td>~0ms</td><td>Ảnh, JS, CSS, HTML ít đổi</td></tr>
              <tr><td>CDN edge</td><td>Cloudflare, CloudFront</td><td>5–30ms</td><td>Nội dung tĩnh, API cache được</td></tr>
              <tr><td>Application (in-process)</td><td>Guava, Caffeine, lru-cache</td><td>~0,1ms</td><td>Config, dữ liệu siêu hot, không đổi</td></tr>
              <tr><td>Distributed</td><td>Redis, Memcached</td><td>0,5–2ms</td><td>Session, object, kết quả query</td></tr>
              <tr><td>Database buffer pool</td><td>InnoDB, shared_buffers</td><td>~0,05ms</td><td>Tự động, không cần code</td></tr>
            </tbody>
          </table>
        </div>
        <p>Điểm quan trọng: <span class="kw">in-process cache</span> nhanh hơn Redis 10–20× nhưng <em>không chia sẻ</em> giữa các instance và <em>không invalidate được</em> từ ngoài. Chỉ dùng cho dữ liệu gần như bất biến. Nếu dùng, phải có cơ chế broadcast invalidation (Redis pub/sub, hoặc TTL rất ngắn 5–10s).</p>`
    },

    {
      id: 'rate-limiting', num: '2.4', title: 'Rate Limiting — bảo vệ hệ thống mà không chặn nhầm',
      html: `
        <p>Rate limiter trả lời câu hỏi: "một client được làm bao nhiêu request trong một đơn vị thời gian?". Nghe đơn giản, nhưng có 5 thuật toán với trade-off rất khác nhau, và chọn sai sẽ hoặc là chặn nhầm user, hoặc là để lọt burst.</p>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Đặt ở đâu?</div>
            <p>Rate limiter phải chạy <strong>trước</strong> khi request chạm tài nguyên đắt. Thường đặt ở API Gateway hoặc middleware. Nếu mỗi service tự limit thì client có thể lách bằng cách gọi service khác. Ngược lại, limit ở mỗi instance (in-memory) không chính xác khi scale ngang — 10 instance × 100 req/s = 1000 req/s thực tế. Muốn chính xác cần state chia sẻ (Redis) hoặc <em>sticky theo key</em>.</p>
          </div>
        </div>

        <h3>Năm thuật toán và khi nào dùng</h3>

        <h3>1. Token Bucket — thuật toán chuẩn của thực tế</h3>
        <p>Một xô có capacity <code>B</code> token. Token được nạp với tốc độ <code>r</code> token/giây, tối đa <code>B</code>. Mỗi request lấy 1 token; nếu xô rỗng thì bị chặn (hoặc đưa vào hàng chờ).</p>
        <ul class="list-bullet">
          <li>Cho phép <span class="kw-g">burst</span> lên tới B — tốt, vì traffic thật luôn có burst.</li>
          <li>Rate trung bình dài hạn bị giới hạn ở r.</li>
          <li>State chỉ là 2 số: <code>tokens</code> và <code>last_refill</code>. Rất nhẹ.</li>
          <li>Đây là thuật toán của AWS API Gateway, Stripe, và hầu hết CDN.</li>
        </ul>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">Lua — token bucket atomic trong Redis</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- KEYS[1]=bucket key, ARGV: capacity, refill_rate, now_ms, cost</span>
<span class="c-key">local</span> cap    = <span class="c-fn">tonumber</span>(ARGV[<span class="c-num">1</span>])
<span class="c-key">local</span> rate   = <span class="c-fn">tonumber</span>(ARGV[<span class="c-num">2</span>])
<span class="c-key">local</span> now    = <span class="c-fn">tonumber</span>(ARGV[<span class="c-num">3</span>])
<span class="c-key">local</span> cost   = <span class="c-fn">tonumber</span>(ARGV[<span class="c-num">4</span>])

<span class="c-key">local</span> b = redis.call(<span class="c-str">'HMGET'</span>, KEYS[<span class="c-num">1</span>], <span class="c-str">'tokens'</span>, <span class="c-str">'ts'</span>)
<span class="c-key">local</span> tokens = <span class="c-fn">tonumber</span>(b[<span class="c-num">1</span>]) <span class="c-key">or</span> cap
<span class="c-key">local</span> ts     = <span class="c-fn">tonumber</span>(b[<span class="c-num">2</span>]) <span class="c-key">or</span> now

<span class="c-com">-- nạp token theo thời gian trôi qua</span>
tokens = math.min(cap, tokens + (now - ts) / <span class="c-num">1000</span> * rate)

<span class="c-key">if</span> tokens &lt; cost <span class="c-key">then</span>
  redis.call(<span class="c-str">'HMSET'</span>, KEYS[<span class="c-num">1</span>], <span class="c-str">'tokens'</span>, tokens, <span class="c-str">'ts'</span>, now)
  <span class="c-key">return</span> {<span class="c-num">0</span>, math.floor((cost - tokens) / rate * <span class="c-num">1000</span>)}  <span class="c-com">-- 0 = chặn, kèm retry-after ms</span>
<span class="c-key">end</span>

redis.call(<span class="c-str">'HMSET'</span>, KEYS[<span class="c-num">1</span>], <span class="c-str">'tokens'</span>, tokens - cost, <span class="c-str">'ts'</span>, now)
redis.call(<span class="c-str">'EXPIRE'</span>, KEYS[<span class="c-num">1</span>], math.ceil(cap / rate))
<span class="c-key">return</span> {<span class="c-num">1</span>, <span class="c-num">0</span>}   <span class="c-com">-- 1 = cho qua</span></code></pre>
        </div>

        <h3>2. Leaking Bucket — làm phẳng traffic</h3>
        <p>Request vào hàng đợi (FIFO), xử lý với tốc độ cố định <code>r</code>. Khác biệt cốt lõi với token bucket: leaking bucket <strong>không cho burst</strong> — output luôn phẳng. Dùng khi downstream rất nhạy với burst (ví dụ gọi API bên thứ ba có quota cứng), hoặc khi cần shaping traffic đều đặn.</p>
        <p>Nhược điểm: request cũ trong queue có thể bị xử lý quá trễ (stale). Với <code>capacity=100</code>, <code>rate=10/s</code>, request thứ 100 phải chờ 10 giây — thường đã hết hạn timeout của client.</p>

        <h3>3. Fixed Window Counter — đơn giản nhưng có lỗ hổng</h3>
        <p>Chia thời gian thành cửa sổ cố định (1 phút), đếm bằng <code>INCR</code> + <code>EXPIRE</code>.</p>
        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Lỗ hổng biên cửa sổ</div>
            <p>Limit 100 req/phút. Client gửi 100 request ở giây 59 của phút 1, rồi 100 request ở giây 1 của phút 2. Trong khoảng 2 giây thực tế, client đã gửi <strong>200 request</strong> — gấp đôi limit. Đây là lý do fixed window một mình không đủ cho hệ thống cần bảo vệ nghiêm ngặt.</p>
          </div>
        </div>

        <h3>4. Sliding Window Log — chính xác nhưng tốn memory</h3>
        <p>Lưu timestamp của từng request trong sorted set (Redis ZSET). Mỗi lần check: xoá entry cũ hơn <code>now - window</code>, đếm phần còn lại. Chính xác tuyệt đối, không có lỗ hổng biên. Nhược điểm: với limit 1 triệu req/giờ, bạn phải lưu 1 triệu timestamp — memory cực lớn.</p>

        <h3>5. Sliding Window Counter — cân bằng tốt nhất</h3>
        <p>Kết hợp 2 fixed window liền kề và nội suy:</p>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">Công thức</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Đang ở giây thứ 15 của phút hiện tại (25% thời gian đã trôi qua)</span>
<span class="c-com">// current_window = 30 request, previous_window = 90 request, limit = 100</span>

estimated = previous_window × (<span class="c-num">1</span> - <span class="c-num">0.25</span>) + current_window
          = <span class="c-num">90</span> × <span class="c-num">0.75</span> + <span class="c-num">30</span>
          = <span class="c-num">67.5</span> + <span class="c-num">30</span>
          = <span class="c-num">97.5</span>    → còn 2.5 slot, request tiếp theo <span class="c-out">được phép</span>

<span class="c-com">// Giả sử previous_window = 100 (đã full), current = 30:</span>
<span class="c-com">// estimated = 100 × 0.75 + 30 = 105 → vượt limit → CHẶN</span></code></pre>
        </div>
        <p>Cloudflare đã đo trên <strong>400 triệu request</strong> và thấy thuật toán này chỉ sai <strong>0,003%</strong> — trong khi chi phí memory bằng 1/1000 so với sliding window log. Đây là lựa chọn mặc định tốt nhất hiện nay.</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Thuật toán</th><th>Chính xác</th><th>Memory</th><th>Cho burst</th><th>Phù hợp</th></tr></thead>
            <tbody>
              <tr><td>Token bucket</td><td>Cao</td><td>Rất thấp (2 số)</td><td>Có, tới B</td><td>API công khai, mặc định tốt nhất</td></tr>
              <tr><td>Leaking bucket</td><td>Cao</td><td>Thấp (queue)</td><td>Không</td><td>Bảo vệ API bên thứ ba, shaping</td></tr>
              <tr><td>Fixed window</td><td>Thấp (lỗi biên)</td><td>Rất thấp (1 counter)</td><td>Có, gấp đôi</td><td>Limit mềm, cảnh báo nội bộ</td></tr>
              <tr><td>Sliding log</td><td>Tuyệt đối</td><td>Rất cao (N timestamp)</td><td>Đúng chính xác</td><td>Limit thấp, cần chính xác (login, OTP)</td></tr>
              <tr><td>Sliding counter</td><td>~99,997%</td><td>Thấp (2 counter)</td><td>Đúng gần đúng</td><td>Lựa chọn cân bằng nhất</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Rate limit theo chiều nào?</h3>
        <ul class="list-bullet">
          <li><strong>Theo user</strong> — <code>user_id</code> sau khi login. Công bằng nhất nhưng chỉ áp dụng được cho traffic đã xác thực.</li>
          <li><strong>Theo IP</strong> — cho traffic ẩn danh. Vấn đề: nhiều user sau NAT dùng chung IP (văn phòng, quán cafe, mobile carrier) → chặn oan cả một toà nhà.</li>
          <li><strong>Theo API key</strong> — cho đối tác/dev. Gắn với quota hợp đồng.</li>
          <li><strong>Theo endpoint</strong> — login/OTP dùng limit rất chặt (5/phút), đọc dữ liệu công khai dùng limit rộng (1000/phút).</li>
          <li><strong>Toàn hệ thống (global)</strong> — bảo vệ toàn bộ backend khi bị DDoS; đặt ở CDN/LB.</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Header trả về rất quan trọng</div>
            <p>Đừng chỉ trả 429. Trả kèm <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code> và <code>Retry-After</code>. Client tốt sẽ tự backoff; client xấu bị chặn mà không biết vì sao sẽ retry dồn dập và làm tình hình tệ hơn. Kèm theo <em>jitter</em> trong thời gian chờ cũng giúp tránh đồng loạt retry.</p>
          </div>
        </div>`
    },

    {
      id: 'message-queue', num: '2.5', title: 'Message Queue & Event Log — tách rời producer và consumer',
      html: `
        <p>Message queue xuất hiện khi có công việc <span class="kw">không cần hoàn thành ngay</span> trong request. Gửi email, tạo thumbnail, đồng bộ search index, charge thẻ — tất cả đều nên bất đồng bộ.</p>

        <h3>Queue vs Log — hai mô hình khác nhau về bản chất</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tiêu chí</th><th>Message Queue</th><th>Event Log</th></tr></thead>
            <tbody>
              <tr><td>Đại diện</td><td>SQS, RabbitMQ, Redis Streams</td><td>Kafka, Kinesis, Pulsar, Redpanda</td></tr>
              <tr><td>Sau khi consume</td><td>Message bị xoá khỏi queue</td><td>Vẫn nằm trong log, giữ theo retention</td></tr>
              <tr><td>Nhiều consumer</td><td>Mỗi message chỉ 1 consumer (competing consumers)</td><td>Nhiều consumer group đọc độc lập cùng một dòng</td></tr>
              <tr><td>Replay</td><td>Không (đã xoá)</td><td>Có — tua lại offset, xử lý lại lịch sử</td></tr>
              <tr><td>Thứ tự</td><td>Không đảm bảo (trừ FIFO queue)</td><td>Đảm bảo trong một partition</td></tr>
              <tr><td>Throughput</td><td>Cao, nhưng thấp hơn Kafka nhiều</td><td>Rất cao (hàng triệu msg/s mỗi cluster)</td></tr>
              <tr><td>Dùng khi</td><td>Task queue, job nền, background work</td><td>Event sourcing, CDC, analytics, fan-out nhiều hệ thống</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 740 380" role="img" aria-label="So sánh mô hình message queue và event log với partition">
            <defs>
              <marker id="m2q" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#505a68"/>
              </marker>
            </defs>
            <text x="170" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="#151515">Queue — message biến mất</text>
            <text x="560" y="24" text-anchor="middle" font-size="13" font-weight="800" fill="#151515">Log — message ở lại</text>

            <g font-size="11" font-weight="700" fill="#151515">
              <rect x="20" y="60" width="76" height="40" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="58" y="85" text-anchor="middle">Producer</text>

              <rect x="126" y="50" width="120" height="60" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="186" y="72" text-anchor="middle">Queue</text>
              <text x="186" y="88" text-anchor="middle" font-size="9.5" fill="#505a68">m1 m2 m3</text>
              <text x="186" y="102" text-anchor="middle" font-size="9.5" fill="#ef4444">xoá sau ack</text>

              <rect x="276" y="36" width="80" height="36" rx="8" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="316" y="59" text-anchor="middle" font-size="10">Worker 1</text>
              <rect x="276" y="82" width="80" height="36" rx="8" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="316" y="105" text-anchor="middle" font-size="10">Worker 2</text>

              <line x1="96" y1="80" x2="124" y2="80" stroke="#505a68" stroke-width="2" marker-end="url(#m2q)"/>
              <line x1="246" y1="68" x2="274" y2="56" stroke="#505a68" stroke-width="2" marker-end="url(#m2q)"/>
              <line x1="246" y1="92" x2="274" y2="100" stroke="#505a68" stroke-width="2" marker-end="url(#m2q)"/>

              <text x="186" y="150" text-anchor="middle" font-size="10" fill="#ef4444" font-weight="700">✗ Không replay được</text>
              <text x="186" y="168" text-anchor="middle" font-size="10" fill="#505a68">✗ 1 message = 1 consumer</text>
              <text x="186" y="186" text-anchor="middle" font-size="10" fill="#10b981">✓ Đơn giản, task queue tốt</text>

              <rect x="400" y="60" width="76" height="40" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
              <text x="438" y="85" text-anchor="middle">Producer</text>

              <rect x="506" y="44" width="210" height="72" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
              <text x="611" y="62" text-anchor="middle">Topic: orders (3 partitions)</text>
              <rect x="514" y="70" width="62" height="36" rx="5" fill="#ffffff" stroke="#151515" stroke-width="1.5"/>
              <text x="545" y="92" text-anchor="middle" font-size="9">P0: 0 1 2 3</text>
              <rect x="580" y="70" width="62" height="36" rx="5" fill="#ffffff" stroke="#151515" stroke-width="1.5"/>
              <text x="611" y="92" text-anchor="middle" font-size="9">P1: 0 1 2</text>
              <rect x="646" y="70" width="62" height="36" rx="5" fill="#ffffff" stroke="#151515" stroke-width="1.5"/>
              <text x="677" y="92" text-anchor="middle" font-size="9">P2: 0 1</text>

              <line x1="476" y1="80" x2="504" y2="80" stroke="#505a68" stroke-width="2" marker-end="url(#m2q)"/>

              <rect x="470" y="150" width="86" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="513" y="171" text-anchor="middle" font-size="9.5">Group A: billing</text>
              <rect x="470" y="192" width="86" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="513" y="213" text-anchor="middle" font-size="9.5">Group B: search</text>
              <rect x="470" y="234" width="86" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="513" y="255" text-anchor="middle" font-size="9.5">Group C: analytics</text>

              <path d="M611 116 L611 140 L558 140 L558 168" stroke="#505a68" stroke-width="2" fill="none" marker-end="url(#m2q)"/>
              <path d="M611 116 L611 140 L558 140 L558 210" stroke="#505a68" stroke-width="2" fill="none" marker-end="url(#m2q)"/>
              <path d="M611 116 L611 140 L558 140 L558 252" stroke="#505a68" stroke-width="2" fill="none" marker-end="url(#m2q)"/>

              <text x="600" y="296" text-anchor="middle" font-size="10" fill="#10b981" font-weight="700">✓ Replay bằng cách reset offset</text>
              <text x="600" y="314" text-anchor="middle" font-size="10" fill="#10b981" font-weight="700">✓ N consumer group độc lập</text>
              <text x="600" y="332" text-anchor="middle" font-size="10" fill="#505a68">✓ Thứ tự trong 1 partition</text>
            </g>
            <text x="370" y="366" text-anchor="middle" font-size="11" fill="#505a68" font-weight="600">Queue cho công việc; Log cho sự kiện cần nhiều bên cùng đọc</text>
          </svg>
          <div class="diagram-cap">Hình 3 — Queue xoá message sau khi xử lý; Log giữ lại và cho phép nhiều consumer group</div>
        </div>

        <h3>Ba đảm bảo giao nhận và cái giá phải trả</h3>
        <ul class="list-bullet">
          <li><span class="kw">At-most-once</span> — gửi 1 lần, có thể mất. Nhanh, dùng cho metric, log không quan trọng.</li>
          <li><span class="kw">At-least-once</span> — gửi tới khi được ack, có thể <em>trùng</em>. Mặc định của gần như mọi queue. Bắt buộc consumer phải <span class="kw-g">idempotent</span>.</li>
          <li><span class="kw">Exactly-once</span> — chỉ có thể đạt được trong phạm vi hẹp (Kafka transactional producer + consumer, hoặc transaction trong DB). Trong hệ phân tán thực sự, "exactly-once delivery" là <em>bất khả thi</em> — chỉ có "exactly-once <strong>processing</strong>" đạt được bằng idempotency + dedupe.</li>
        </ul>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Cách làm consumer idempotent</div>
            <p>Một trong ba cách: (1) <strong>Idempotency key</strong> — producer sinh UUID cho mỗi message, consumer ghi vào bảng <code>processed_keys</code> với unique constraint, insert fail nghĩa là đã xử lý; (2) <strong>Upsert thay vì insert</strong> — <code>INSERT ... ON CONFLICT DO NOTHING</code> biến retry thành no-op; (3) <strong>State machine có điều kiện</strong> — <code>UPDATE orders SET status='paid' WHERE status='pending'</code>, nếu update 0 row thì đã xử lý rồi.</p>
          </div>
        </div>

        <h3>Những vấn đề vận hành ít ai nói</h3>
        <ul class="list-bullet">
          <li><strong>Consumer lag</strong> — số message chưa xử lý. Lag tăng đều nghĩa là consumer chậm hơn producer. Phải alert trên lag, không chỉ trên error rate.</li>
          <li><strong>Poison message</strong> — message luôn làm consumer crash. Không có dead-letter queue (DLQ) thì consumer chết vòng lặp vô hạn ở đầu queue, chặn toàn bộ message sau.</li>
          <li><strong>Ordering</strong> — Kafka chỉ đảm bảo thứ tự trong 1 partition. Muốn tất cả event của 1 user theo thứ tự, phải set partition key = <code>user_id</code>. Hệ quả: hot user tạo hot partition.</li>
          <li><strong>Rebalance</strong> — khi thêm consumer, partition bị chia lại, có khoảng dừng ngắn. Với processing lâu, phải cấu hình <code>max.poll.interval.ms</code> và heartbeat hợp lý.</li>
          <li><strong>Backpressure</strong> — khi consumer không theo kịp, phải giới hạn producer (bounded queue, 429) thay vì để lag phình tới hàng tỷ message.</li>
        </ul>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Đừng dùng queue để che giấu thiết kế sai</div>
            <p>Nếu user phải <em>chờ</em> kết quả, queue không giúp gì — bạn chỉ chuyển latency từ đồng bộ sang polling. Queue đúng khi: công việc không cần kết quả ngay, cần retry bền bỉ, hoặc cần nhiều consumer độc lập. Queue sai khi: chỉ để "trông có vẻ scalable" mà không có lý do rõ ràng — bạn đánh đổi sự đơn giản lấy eventual consistency, vận hành phức tạp, và debug khó hơn nhiều.</p>
          </div>
        </div>`
    },

    {
      id: 'cdn', num: '2.6', title: 'CDN — đưa nội dung đến gần người dùng',
      html: `
        <p>CDN (Content Delivery Network) là mạng lưới hàng trăm điểm hiện diện (PoP) đặt tại các thành phố lớn. Khi user ở Hà Nội tải ảnh, request đi 10ms tới PoP Hà Nội thay vì 180ms tới origin ở Virginia. Đây là building block duy nhất cải thiện latency mà <span class="kw">không cần</span> sửa code.</p>

        <h3>Cơ chế hoạt động</h3>
        <ol class="list-num">
          <li>User nhập <code>cdn.example.com/logo.png</code>. DNS trả về IP của PoP gần nhất — thường dùng <span class="kw">anycast</span> (nhiều PoP cùng một IP, BGP chọn tuyến ngắn nhất).</li>
          <li>PoP kiểm tra cache local. Nếu có và còn hạn → trả ngay (<strong>cache HIT</strong>, ~5ms).</li>
          <li>Nếu không có → PoP gọi về origin, lấy nội dung, cache lại theo TTL (<strong>MISS</strong>).</li>
          <li>Các user cùng thành phố sau đó hưởng lợi từ lần MISS đầu tiên (<strong>warm cache</strong>).</li>
        </ol>

        <h3>Cache-Control — header quan trọng nhất trên web</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">HTTP headers</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># Ảnh logo có hash trong tên — cache vĩnh viễn, có thể batch redeploy</span>
Cache-Control: public, max-age=<span class="c-num">31536000</span>, immutable
<span class="c-com"># → browser và CDN đều cache 1 năm; đổi ảnh thì đổi tên file (logo.a3f9.png)</span>

<span class="c-com"># API trả dữ liệu thay đổi vừa phải</span>
Cache-Control: public, s-maxage=<span class="c-num">60</span>, max-age=<span class="c-num">10</span>, stale-while-revalidate=<span class="c-num">300</span>
<span class="c-com"># → CDN cache 60s, browser cache 10s; sau 60s CDN trả bản cũ NGAY và refresh nền</span>

<span class="c-com"># Dữ liệu riêng tư (giỏ hàng, profile)</span>
Cache-Control: private, no-store

<span class="c-com"># HTML động nhưng cần revalidate nhanh</span>
Cache-Control: no-cache
ETag: "a3f9-20261120"
<span class="c-com"># → trình duyệt gửi If-None-Match; server trả 304 Not Modified (không body) nếu chưa đổi</span></code></pre>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Directive</th><th>Áp dụng cho</th><th>Ý nghĩa</th></tr></thead>
            <tbody>
              <tr><td><code>max-age</code></td><td>Browser</td><td>Cache bao nhiêu giây</td></tr>
              <tr><td><code>s-maxage</code></td><td>CDN (shared cache)</td><td>Ghi đè max-age cho CDN; cho phép CDN cache lâu hơn browser</td></tr>
              <tr><td><code>private</code></td><td>CDN</td><td>Cấm CDN cache — chỉ browser được cache</td></tr>
              <tr><td><code>no-store</code></td><td>Tất cả</td><td>Không lưu ở bất cứ đâu (thông tin nhạy cảm)</td></tr>
              <tr><td><code>no-cache</code></td><td>Tất cả</td><td>Được lưu nhưng <em>phải</em> revalidate trước khi dùng</td></tr>
              <tr><td><code>stale-while-revalidate</code></td><td>CDN</td><td>Trả bản cũ trong lúc fetch bản mới — cực tốt cho trải nghiệm</td></tr>
              <tr><td><code>stale-if-error</code></td><td>CDN</td><td>Origin lỗi 5xx thì vẫn trả bản cũ — tăng availability</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Cache invalidation trên CDN</h3>
        <ul class="list-bullet">
          <li><strong>Purge theo URL</strong> — xoá 1 object cụ thể. Nhanh nhưng API thường giới hạn số lần/ngày.</li>
          <li><strong>Purge theo tag/surrogate key</strong> — gắn <code>Cache-Tag: product-42</code>, sau đó purge toàn bộ tag. Đây là cách đúng cho nội dung động.</li>
          <li><strong>Versioned URL</strong> — <code>/static/app.v42.js</code>. Không cần purge gì cả, chỉ deploy tên mới. Đơn giản và hiệu quả nhất cho asset tĩnh.</li>
        </ul>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">CDN không thay thế được thiết kế đúng</div>
            <p>Nếu bạn cache HTML trang chủ chứa tên user đã đăng nhập, CDN sẽ trả trang của user A cho user B — sự cố nghiêm trọng về bảo mật. Nguyên tắc: <strong>chỉ cache nội dung giống nhau cho mọi người</strong>, hoặc phân biệt bằng <code>Vary</code> header / <code>Cache-Key</code> có chứa session. Với nội dung cá nhân hoá, dùng <span class="kw">ES I</span> (Edge Side Includes) hoặc render phía client cho phần riêng.</p>
          </div>
        </div>

        <h3>Chi phí — phần ít được nói tới</h3>
        <p>CDN tính tiền chủ yếu theo <strong>egress</strong> (dữ liệu ra). Ví dụ CloudFront ~$0,085/GB cho 10TB đầu. Nếu bạn phục vụ 500TB video/tháng, tiền CDN có thể lên tới $40.000/tháng — thường là khoản chi lớn nhất trong hoá đơn cloud. Các cách giảm:</p>
        <ul class="list-bullet">
          <li>Nén ảnh sang WebP/AVIF (giảm 30–50% kích thước so với JPEG).</li>
          <li>Dùng <code>Accept-Encoding: br</code> (Brotli tốt hơn gzip ~20% với text).</li>
          <li>Tăng cache hit ratio — mỗi 1% hit ratio tăng giảm đáng kể origin load và egress từ origin.</li>
          <li>Chọn CDN có giá tốt hơn ở thị trường mục tiêu (Cloudflare, BunnyCDN rẻ hơn nhiều so với CloudFront ở châu Á).</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Mẹo đo hiệu quả CDN</div>
            <p>Không đo "có CDN hay không" mà đo <strong>cache hit ratio</strong> (thường mục tiêu 90–95% cho static) và <strong>origin offload</strong>. Nếu hit ratio thấp bất thường, nguyên nhân hay gặp: thiếu <code>Cache-Control</code>, query string chứa timestamp ngẫu nhiên (<code>?v=169</code> đổi mỗi request), hoặc <code>Vary</code> trên header có nhiều giá trị khác nhau.</p>
          </div>
        </div>`
    },

    {
      id: 'search', num: '2.7', title: 'Search — inverted index và tại sao LIKE "%x%" là sai',
      html: `
        <p>Câu hỏi phỏng vấn kinh điển: "thiết kế tính năng tìm kiếm cho 10 triệu sản phẩm". Nếu bạn trả lời "SELECT ... WHERE name LIKE '%iphone%'" thì đã sai ngay từ đầu, vì ba lý do.</p>
        <ul class="list-bullet">
          <li>SQL <code>LIKE '%x%'</code> <strong>không dùng được index</strong> tiêu chuẩn (phải full scan), vì index sắp xếp theo prefix. 10 triệu dòng × 100.000 query/ngày = thảm hoạ.</li>
          <li>Không có <strong>xếp hạng</strong> — mọi kết quả ngang nhau, user không tìm được kết quả tốt nhất.</li>
          <li>Không có <strong>fuzzy</strong> — gõ "ipone" không ra gì. Không hỗ trợ stemming ("phones" không match "phone").</li>
        </ul>

        <h3>Inverted index — cách search engine thật sự hoạt động</h3>
        <p>Thay vì map <em>document → words</em>, ta map <em>word → documents</em>. Đây là <span class="kw">inverted index</span>.</p>

        <div class="diagram">
          <svg viewBox="0 0 720 330" role="img" aria-label="Cấu trúc inverted index từ tài liệu tới posting list">
            <defs>
              <marker id="m2s" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                <polygon points="0 0, 10 4, 0 8" fill="#505a68"/>
              </marker>
            </defs>
            <text x="120" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#151515">Documents</text>
            <text x="370" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#151515">Index (inverted)</text>
            <text x="620" y="22" text-anchor="middle" font-size="12" font-weight="800" fill="#151515">Posting list</text>

            <g font-size="10.5" font-weight="700" fill="#151515">
              <rect x="20" y="40" width="200" height="52" rx="7" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="32" y="60">D1: "iPhone 15 Pro Max"</text>
              <text x="32" y="76" font-size="9.5" fill="#505a68">category: phone</text>

              <rect x="20" y="104" width="200" height="52" rx="7" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="32" y="124">D2: "iPhone 14 giá rẻ"</text>
              <text x="32" y="140" font-size="9.5" fill="#505a68">category: phone</text>

              <rect x="20" y="168" width="200" height="52" rx="7" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="32" y="188">D3: "Samsung Galaxy S24"</text>
              <text x="32" y="204" font-size="9.5" fill="#505a68">category: phone</text>

              <rect x="20" y="232" width="200" height="52" rx="7" fill="#ffffff" stroke="#151515" stroke-width="2"/>
              <text x="32" y="252">D4: "Ốp lưng iPhone"</text>
              <text x="32" y="268" font-size="9.5" fill="#505a68">category: accessory</text>

              <rect x="290" y="40" width="160" height="34" rx="6" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="370" y="61" text-anchor="middle" font-family="monospace">iphone</text>
              <rect x="290" y="82" width="160" height="34" rx="6" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="370" y="103" text-anchor="middle" font-family="monospace">pro</text>
              <rect x="290" y="124" width="160" height="34" rx="6" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="370" y="145" text-anchor="middle" font-family="monospace">giá</text>
              <rect x="290" y="166" width="160" height="34" rx="6" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="370" y="187" text-anchor="middle" font-family="monospace">samsung</text>
              <rect x="290" y="208" width="160" height="34" rx="6" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
              <text x="370" y="229" text-anchor="middle" font-family="monospace">ốp</text>

              <rect x="520" y="40" width="180" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="610" y="61" text-anchor="middle" font-family="monospace">D1, D2, D4</text>
              <rect x="520" y="82" width="180" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="610" y="103" text-anchor="middle" font-family="monospace">D1</text>
              <rect x="520" y="124" width="180" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="610" y="145" text-anchor="middle" font-family="monospace">D2</text>
              <rect x="520" y="166" width="180" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="610" y="187" text-anchor="middle" font-family="monospace">D3</text>
              <rect x="520" y="208" width="180" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
              <text x="610" y="229" text-anchor="middle" font-family="monospace">D4</text>

              <line x1="480" y1="57" x2="518" y2="57" stroke="#505a68" stroke-width="2" marker-end="url(#m2s)"/>
              <line x1="480" y1="99" x2="518" y2="99" stroke="#505a68" stroke-width="2" marker-end="url(#m2s)"/>
              <line x1="480" y1="141" x2="518" y2="141" stroke="#505a68" stroke-width="2" marker-end="url(#m2s)"/>
              <line x1="480" y1="183" x2="518" y2="183" stroke="#505a68" stroke-width="2" marker-end="url(#m2s)"/>
              <line x1="480" y1="225" x2="518" y2="225" stroke="#505a68" stroke-width="2" marker-end="url(#m2s)"/>
            </g>
            <text x="360" y="306" text-anchor="middle" font-size="10.5" fill="#505a68" font-weight="600">Query "iphone pro" → giao 2 posting list → D1 có cả hai → hạng 1</text>
          </svg>
          <div class="diagram-cap">Hình 4 — Inverted index: mỗi term trỏ tới danh sách document chứa nó</div>
        </div>

        <h3>Quá trình index một document</h3>
        <ol class="list-num">
          <li><strong>Tokenize</strong> — tách văn bản thành token. Tiếng Việt cần word segmentation (khó hơn tiếng Anh vì có dấu cách giữa âm tiết: "học sinh" là 1 từ, 2 âm tiết).</li>
          <li><strong>Normalize</strong> — lowercase, bỏ dấu (tuỳ chọn), chuẩn hoá unicode (NFC/NFD).</li>
          <li><strong>Stop words</strong> — bỏ "và", "của", "the", "a". Nhưng với tìm kiếm sản phẩm, đừng bỏ hết — "The North Face" là tên thương hiệu.</li>
          <li><strong>Stemming / Lemmatization</strong> — "phones" → "phone", "running" → "run".</li>
          <li><strong>Synonym</strong> — "điện thoại" ≈ "phone" ≈ "mobile".</li>
        </ol>

        <h3>Xếp hạng — BM25 thay vì TF-IDF thuần</h3>
        <p>Ba yếu tố quyết định điểm:</p>
        <ul class="list-bullet">
          <li><strong>TF</strong> (term frequency) — term xuất hiện nhiều trong document thì quan trọng hơn. Nhưng có <em>bão hoà</em>: xuất hiện 100 lần không quan trọng gấp 10 lần so với 10 lần.</li>
          <li><strong>IDF</strong> (inverse document frequency) — term hiếm thì có trọng số cao. "iphone" xuất hiện trong 90% document nên gần như vô dụng để phân biệt; "ống kính" hiếm nên rất có giá trị.</li>
          <li><strong>Field boost</strong> — term trong title quan trọng hơn trong description (thường ×3–5).</li>
        </ul>
        <p><span class="kw">BM25</span> là công thức chuẩn hiện nay (mặc định của Elasticsearch/Lucene), cải tiến TF-IDF bằng cách thêm tham số <code>k1</code> (bão hoà TF) và <code>b</code> (chuẩn hoá theo độ dài document). Không cần nhớ công thức trong phỏng vấn, chỉ cần nêu được 3 yếu tố trên.</p>

        <h3>Đồng bộ DB → search index</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách</th><th>Độ trễ</th><th>Độ tin cậy</th><th>Nhận xét</th></tr></thead>
            <tbody>
              <tr><td>Dual write (ghi cả 2)</td><td>Thấp</td><td>Kém — 1 cái fail là lệch</td><td>Không nên dùng, trừ khi có saga bù trừ</td></tr>
              <tr><td>Batch job định kỳ</td><td>Cao (phút/giờ)</td><td>Trung bình</td><td>Đơn giản, chấp nhận được với catalogue ít đổi</td></tr>
              <tr><td>CDC (Debezium)</td><td>Thấp (giây)</td><td>Cao — đọc binlog</td><td>Cách chuẩn cho production</td></tr>
              <tr><td>Application event qua Kafka</td><td>Thấp</td><td>Cao nếu outbox pattern</td><td>Cần transactional outbox để không mất event</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Search là eventual consistency — hãy nói ra điều này</div>
            <p>User vừa tạo sản phẩm có thể chưa tìm thấy ngay (index trễ 1–5 giây). Đây là trade-off được chấp nhận. Nhưng nếu user <em>vừa sửa</em> sản phẩm và tìm lại thấy bản cũ, đó là trải nghiệm tệ — cách xử lý: dùng <code>refresh=wait_for</code> cho write quan trọng, hoặc hiển thị kết quả từ DB cho chính owner trong vài giây đầu.</p>
          </div>
        </div>`
    },

    {
      id: 'gateway-id', num: '2.8', title: 'API Gateway, Service Discovery và ID Generator',
      html: `
        <p>Ba building block cuối thường xuất hiện cùng nhau trong kiến trúc microservices. Chúng không hào nhoáng như Kafka hay Redis nhưng thiếu chúng thì hệ thống không vận hành được.</p>

        <h3>API Gateway — cửa ngõ duy nhất</h3>
        <p>Không có gateway, mỗi service phải tự làm auth, rate limit, logging, CORS, versioning. Kết quả: 12 service × 12 cách làm khác nhau, và một lỗ hổng auth ở service nào đó là đủ để mất toàn bộ hệ thống.</p>
        <p>Gateway tập trung những việc <span class="kw">cross-cutting</span>:</p>
        <ul class="list-bullet">
          <li>Xác thực (verify JWT, introspect token) và phân quyền thô.</li>
          <li>Rate limiting, quota theo API key (như mục 2.4).</li>
          <li>Routing: <code>/api/users/*</code> → user-service, <code>/api/orders/*</code> → order-service.</li>
          <li>Request/response transformation: gộp N service thành 1 response (BFF pattern).</li>
          <li>Observability: gắn trace ID, đo latency per route.</li>
          <li>Circuit breaking, retry, timeout — chặn lỗi lan rộng.</li>
        </ul>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Gateway có thể trở thành monolith mới</div>
            <p>Nếu bạn bắt đầu nhét business logic vào gateway ("nếu user là VIP thì tính giá khác"), nó sẽ phình thành nơi không ai dám sửa và trở thành single point of failure về cả hiệu năng lẫn tổ chức. Nguyên tắc: gateway chỉ làm việc <em>cross-cutting</em>, không làm nghiệp vụ. Và luôn chạy ≥2 instance sau load balancer.</p>
          </div>
        </div>

        <h3>Service Discovery — khi IP không còn cố định</h3>
        <p>Trong Kubernetes hay autoscaling, instance sinh ra và chết liên tục với IP mới. Hard-code IP là tự sát. Có hai mô hình:</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mô hình</th><th>Cách hoạt động</th><th>Ví dụ</th><th>Nhận xét</th></tr></thead>
            <tbody>
              <tr><td>Client-side discovery</td><td>Client query registry, tự chọn instance, tự LB</td><td>Eureka + Ribbon, Consul + client LB</td><td>Ít hop, nhanh; client phức tạp</td></tr>
              <tr><td>Server-side discovery</td><td>Client gọi DNS/LB, LB tìm instance</td><td>K8s Service, AWS ALB</td><td>Client đơn giản; thêm 1 hop</td></tr>
              <tr><td>Service mesh</td><td>Sidecar proxy lo toàn bộ (mTLS, retry, LB)</td><td>Istio, Linkerd, Envoy</td><td>Mạnh nhất, nhưng vận hành nặng</td></tr>
            </tbody>
          </table>
        </div>
        <p>Với Kubernetes, bạn gần như không cần nghĩ về service discovery: gọi <code>http://user-service:8080</code> và DNS nội bộ + kube-proxy lo phần còn lại. Đây là lý do K8s phổ biến đến vậy.</p>

        <h3>ID Generator — bài toán nhỏ nhưng hay bị hỏi</h3>
        <p>Tại sao không dùng auto-increment? Vì (1) một DB không scale ghi, (2) ID lộ thông tin kinh doanh (đơn hàng #1000 nghĩa là mới có 1000 đơn — đối thủ đọc được), (3) không merge được dữ liệu từ nhiều shard.</p>

        <h4>Các lựa chọn</h4>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách</th><th>Ví dụ</th><th>Ưu</th><th>Nhược</th></tr></thead>
            <tbody>
              <tr><td>UUID v4</td><td><code>550e8400-e29b-41d4-a716-446655440000</code></td><td>Không cần phối hợp, 128-bit</td><td>Random hoàn toàn → phá locality của B+ tree, index phình to</td></tr>
              <tr><td>UUID v7</td><td>Timestamp ở đầu + random</td><td>Sortable theo thời gian, vẫn phân tán</td><td>Mới, chưa phổ biến ở mọi thư viện</td></tr>
              <tr><td>Snowflake</td><td>41 bit timestamp + 10 bit machine + 12 bit sequence</td><td>64-bit, sortable, 4096 ID/ms/máy</td><td>Cần đồng bộ clock; hết chỗ nếu >1024 máy</td></tr>
              <tr><td>Segment/range allocator</td><td>Mỗi service xin một dải 10.000 ID</td><td>Ít round-trip, đơn giản</td><td>ID lộ thứ tự; restart làm mất dải</td></tr>
              <tr><td>ULID</td><td>48-bit timestamp + 80-bit random, base32</td><td>Sortable, không cần coordination, 26 ký tự</td><td>Hơi dài hơn Snowflake</td></tr>
            </tbody>
          </table>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">Snowflake — bố cục 64 bit</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">┌─ 1 bit ─┬──── 41 bit ────┬── 10 bit ──┬── 12 bit ──┐</span>
<span class="c-com">│  dấu 0  │  timestamp ms  │ machine id │  sequence  │</span>
<span class="c-com">└─────────┴────────────────┴────────────┴────────────┘</span>

<span class="c-com">// 41 bit ms = 2^41 / 1000 / 86400 / 365 ≈ 69 năm kể từ epoch tuỳ chọn</span>
<span class="c-com">// 10 bit machine = 1024 node</span>
<span class="c-com">// 12 bit sequence = 4096 ID mỗi ms mỗi node = 4.096 triệu ID/s/node</span>

<span class="c-key">def</span> <span class="c-fn">next_id</span>(machine_id):
    now = time_ms()
    <span class="c-key">if</span> now == last_ts:
        seq = (seq + <span class="c-num">1</span>) &amp; <span class="c-num">0xFFF</span>
        <span class="c-key">if</span> seq == <span class="c-num">0</span>:                    <span class="c-com"># hết 4096 trong cùng 1ms</span>
            now = wait_next_ms()          <span class="c-com"># busy-wait tới ms kế tiếp</span>
    <span class="c-key">else</span>:
        seq = <span class="c-num">0</span>
    last_ts = now
    <span class="c-key">return</span> ((now - EPOCH) &lt;&lt; <span class="c-num">22</span>) | (machine_id &lt;&lt; <span class="c-num">12</span>) | seq</code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">✕</div>
          <div class="callout-body">
            <div class="callout-title">Snowflake và clock skew</div>
            <p>Nếu đồng hồ máy bị lùi (NTP điều chỉnh), ID sinh ra có thể <em>trùng</em> hoặc <em>nhỏ hơn</em> ID trước đó. Cách xử lý: (1) phát hiện <code>now &lt; last_ts</code> và từ chối sinh ID trong lúc chờ đồng hồ đuổi kịp; (2) hoặc dùng hybrid logical clock. Đây là chi tiết nhỏ nhưng người phỏng vấn senior rất thích hỏi.</p>
          </div>
        </div>

        <h3>Bảng chọn nhanh</h3>
        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Nếu chỉ nhớ 5 dòng</div>
            <p><strong>LB</strong> L7 cho web, L4 cho TCP thuần, luôn ≥2 instance + health check thật. <strong>Cache</strong> cache-aside mặc định, TTL có jitter, chống stampede bằng single-flight. <strong>Rate limit</strong> token bucket hoặc sliding window counter, đặt ở gateway. <strong>Queue</strong> at-least-once + consumer idempotent, luôn có DLQ. <strong>CDN</strong> chỉ cache nội dung giống nhau cho mọi người, versioned URL thay vì purge.</p>
          </div>
        </div>`
    }
  ],

  quiz: [
    {
      q: 'Bạn có 10 instance sau load balancer. Rate limiter đặt in-memory trong mỗi instance với limit 100 req/s. Điều gì thực sự xảy ra?',
      a: 'Client thực tế có thể gửi tới 1000 req/s (10 × 100) vì mỗi instance đếm riêng. Tệ hơn, nếu LB dùng round-robin thì một client dồn dập sẽ bị chặn không đều — instance này chặn, instance khác vẫn cho qua, tạo trải nghiệm thất thường (lúc 200, lúc 429). Cách sửa: dùng Redis làm state chia sẻ với Lua script atomic (token bucket hoặc sliding window counter). Nếu chấp nhận sai số, có thể dùng "limit chia đều" (mỗi instance 10 req/s) nhưng tổng vẫn dao động khi autoscaling. Cách khác: dùng consistent hashing để mỗi user luôn về cùng instance — nhưng phức tạp và vẫn lệch khi rebalance.'
    },
    {
      q: 'Cache hit ratio của bạn là 80%, DB đang chịu 20.000 QPS và bắt đầu quá tải ở 15.000 QPS. Bạn làm gì?',
      a: 'Trước tiên tính: nếu tổng read là 100.000 QPS, hit 80% ⇒ 20.000 QPS vào DB. Để DB xuống dưới 15.000, cần hit ratio ≥ 85%. Ba hướng: (1) Tăng TTL cho các key ít đổi — thường là cách rẻ nhất và hiệu quả nhất; (2) tăng dung lượng cache (nếu đang evict do thiếu RAM — kiểm tra evicted_keys trong Redis); (3) tối ưu key design để cache được nhiều hơn (ví dụ cache cả object thay vì từng field). Song song, giảm tải DB bằng read replica và thêm index cho các query chậm. Không nên chỉ tăng cache blindly — nếu eviction rate cao do working set quá lớn, thêm RAM chỉ là giải pháp tạm.'
    },
    {
      q: 'Vì sao "exactly-once delivery" là bất khả thi trong hệ phân tán, nhưng "exactly-once processing" lại làm được?',
      a: 'Delivery là việc của mạng: producer gửi message, không nhận được ack (do mạng đứt), không thể biết consumer đã nhận hay chưa — nếu gửi lại có thể trùng, nếu không gửi có thể mất. Định lý two generals nói rằng không có giao thức nào giải quyết được điều này trên mạng không tin cậy. Nhưng <em>processing</em> là việc của application: nếu consumer ghi kèm idempotency key vào một bảng có unique constraint (hoặc dùng upsert, hoặc state machine có điều kiện), thì dù message đến 2 lần, kết quả cuối cùng vẫn như đến 1 lần. Đó là lý do Kafka "exactly-once" thực chất là "effectively-once" trong phạm vi transaction của nó (read-process-write trong cùng transaction + offset commit atomic).'
    },
    {
      q: 'Thiết kế tìm kiếm cho 10 triệu sản phẩm, 50.000 query/giây. Bạn chọn gì và tại sao?',
      a: 'Elasticsearch (hoặc OpenSearch) cluster với index được shard theo category hoặc theo hash product_id. Lý do: (1) inverted index cho phép full-text search + BM25 ranking, thứ SQL LIKE không làm được ở quy mô này; (2) sharding cho phép scale ngang — 10 triệu document với ~1KB text mỗi cái ≈ 10–30GB index, chia 5 shard × 2 replica là thoải mái; (3) 50.000 QPS đọc cần nhiều replica — mỗi shard 2–3 replica để phân tán read. Về đồng bộ: dùng CDC (Debezium đọc Postgres WAL) → Kafka → consumer index vào ES, chấp nhận độ trễ 1–3 giây. Với filter (category, price range) dùng ES filter context (cache được, không tính điểm) thay vì query context. Cuối cùng, thêm Redis cache cho các query phổ biến nhất (top 1000 search terms) để giảm tải ES.'
    },
    {
      q: 'Bạn dùng CDN cho API trả danh sách sản phẩm với Cache-Control: public, s-maxage=60. Một user báo thấy giá cũ sau khi admin sửa giá. Bạn debug thế nào?',
      a: 'Đây là hành vi đúng theo thiết kế — TTL 60s nghĩa là có thể stale tới 60 giây. Nhưng nếu stale lâu hơn, kiểm tra: (1) CDN có đang cache theo <code>Vary</code> header nào không (ví dụ Vary: Accept-Language tạo nhiều bản cache); (2) purge theo tag đã gửi chưa — nếu admin sửa giá phải gọi purge với <code>Cache-Tag: product-42</code>; (3) browser cache với <code>max-age</code> có lớn hơn s-maxage không, khiến user thấy bản cũ dù CDN đã refresh; (4) response có bị cache bởi tầng khác (service worker, proxy công ty) không. Cách phòng ngừa đúng: với dữ liệu giá, dùng <code>s-maxage=30</code> + purge theo tag khi có thay đổi, và thêm <code>stale-while-revalidate</code> để tránh user phải chờ. Với dữ liệu tồn kho/giá chính xác tuyệt đối, không cache ở CDN mà dùng API riêng + WebSocket/SSE push update.'
    },
    {
      q: 'Khi nào bạn KHÔNG nên dùng message queue?',
      a: 'Bốn trường hợp: (1) Khi user cần kết quả ngay trong request — queue chỉ chuyển sang polling, không giảm latency thực; (2) khi nghiệp vụ cần tính nhất quán mạnh và đơn giản (ví dụ trừ tiền trong cùng transaction), queue tạo ra eventual consistency phức tạp hơn nhiều so với một transaction DB; (3) khi volume thấp (dưới vài trăm message/giây) — vận hành Kafka/RabbitMQ tốn công hơn giá trị mang lại, một bảng <code>jobs</code> trong Postgres + worker polling là đủ; (4) khi team chưa có kinh nghiệm vận hành — queue hỏng âm thầm (lag tăng, DLQ đầy) và khó debug hơn nhiều so với một lời gọi hàm đồng bộ. Trong phỏng vấn, nêu được "khi nào không dùng" luôn ghi điểm cao hơn "khi nào dùng".'
    }
  ]
};

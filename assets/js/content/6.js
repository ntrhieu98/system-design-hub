/* ============================================================
   Module 6 — Cloud & Kiến trúc hiện đại
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[6] = {
  title: 'Module 6 — Cloud & Kiến trúc hiện đại',
  lead: 'Đến đây bạn đã biết các khối rời. Câu hỏi của module này là: <span class="kw">ghép chúng thành một hệ thống vận hành được</span> — chia service thế nào cho đúng, deploy ra sao để không sập, đo độ tin cậy bằng gì, và tại sao hoá đơn cloud lại cao hơn dự kiến 4 lần. Đây là phần biến người biết system design thành người <em>làm được</em> system design.',

  keywords: [
    { term: 'Microservices vs Modular Monolith', def: 'Microservices: mỗi service deploy độc lập, giao tiếp qua mạng. Modular monolith: một deployable, module tách biệt rõ ràng. Với team < 20 người, modular monolith gần như luôn thắng về chi phí và tốc độ.' },
    { term: 'Service boundary', def: 'Ranh giới nơi một thay đổi nghiệp vụ chỉ chạm một service. Sai boundary = mỗi feature phải deploy 3 service + coordination. Chia theo bounded context (DDD), không theo tầng kỹ thuật.' },
    { term: 'Distributed monolith', def: 'Anti-pattern: tách thành nhiều service nhưng vẫn gọi đồng bộ chéo, deploy cùng nhau, dùng chung DB. Tệ hơn monolith vì có mọi nhược điểm của cả hai.' },
    { term: 'Container & image', def: 'Image: filesystem bất biến (layers). Container: process cô lập chạy từ image. Build một lần, chạy mọi nơi — hết "trên máy tôi chạy được".' },
    { term: 'Kubernetes control plane', def: 'API server + etcd (state) + scheduler (chọn node) + controller manager (reconcile vòng lặp). Bạn khai báo trạng thái mong muốn, control plane liên tục đưa thực tế về đó.' },
    { term: 'Reconcile loop', def: 'Vòng lặp vô hạn: đọc desired state → so sánh với actual → hành động. Đây là mô hình tư duy của cloud-native: khai báo, không ra lệnh. Tự phục hồi miễn phí.' },
    { term: 'Readiness vs Liveness', def: 'Readiness: đủ điều kiện nhận traffic chưa (fail → rút khỏi LB, không restart). Liveness: còn sống không (fail → restart). Nhầm hai cái này gây restart loop hoặc nhận traffic khi chưa sẵn sàng.' },
    { term: 'HPA & VPA', def: 'HPA scale theo số replica dựa trên metric (CPU, RPS, queue depth). VPA điều chỉnh resource request/limit. HPA theo CPU thường sai — nên theo RPS hoặc queue lag.' },
    { term: 'Service mesh', def: 'Sidecar proxy (Envoy) cạnh mỗi pod, xử lý mTLS, retry, timeout, circuit breaker, tracing — không cần sửa code. Istio/Linkerd. Cái giá: +1 hop, +50–100MB RAM/pod, +độ phức tạp vận hành.' },
    { term: 'SLO & error budget', def: 'SLI đo được → SLO mục tiêu → error budget = 100% − SLO. Hết budget thì dừng feature, dồn vào reliability. Biến "chất lượng" từ cảm tính thành quyết định có số.' },
    { term: 'Golden signals', def: 'Latency, traffic, errors, saturation. Bốn metric tối thiểu cho mọi service. Thiếu saturation, bạn không biết khi nào hệ thống sắp chạm trần.' },
    { term: 'Multi-region active-active', def: 'Mọi region phục vụ ghi và đọc. Cần giải quyết xung đột (CRDT/LWW) và routing (GeoDNS/anycast). Rất đắt — chỉ dùng khi cần latency toàn cầu hoặc chịu mất region.' },
    { term: 'Active-passive (failover)', def: 'Một region chính nhận traffic, region phụ chạy nóng chờ. Failover có thể mất dữ liệu (async replication) và mất 1–5 phút. Đơn giản hơn active-active rất nhiều.' },
    { term: 'Cell-based architecture', def: 'Chia hệ thống thành các cell độc lập (mỗi cell phục vụ một tập user). Một cell hỏng chỉ ảnh hưởng 1/N user thay vì toàn bộ. Đây là cách các hệ thống lớn giới hạn blast radius.' },
    { term: 'Blast radius', def: 'Phạm vi ảnh hưởng khi một thành phần hỏng. Thiết kế tốt là thiết kế để blast radius nhỏ và biết trước. Bulkhead, cell, AZ isolation đều là công cụ giảm blast radius.' },
    { term: 'Cost per request', def: 'Chi phí thực cho một request = (compute + storage + egress + managed service) / số request. Không đo được con số này thì không tối ưu được chi phí — chỉ cắt giảm cảm tính.' }
  ],

  sections: [
    {
      id: 'monolith', num: '6.1', title: 'Monolith, microservices và cái bẫy distributed monolith',
      html: `
        <p>Không có câu trả lời đúng phổ quát. Có câu trả lời đúng <span class="kw">cho bối cảnh của bạn</span> — và người phỏng vấn giỏi sẽ kiểm tra bạn có biết bối cảnh nào phù hợp với cái gì.</p>

        <h3>Bảng so sánh thật, không lý tưởng hoá</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tiêu chí</th><th>Modular monolith</th><th>Microservices</th></tr></thead>
            <tbody>
              <tr><td>Thời gian ra feature đầu tiên</td><td><span class="kw-g">Nhanh</span> — 1 repo, 1 deploy, không cần hạ tầng mạng</td><td>Chậm — cần CI/CD, service discovery, observability trước khi có feature</td></tr>
              <tr><td>Giao dịch nhất quán</td><td><span class="kw-g">ACID miễn phí</span> — cùng một DB</td><td>Saga/2PC, eventual consistency, phức tạp hơn nhiều</td></tr>
              <tr><td>Scale</td><td>Scale cả khối (dù chỉ 1 module nóng)</td><td><span class="kw-g">Scale riêng</span> phần nóng</td></tr>
              <tr><td>Ranh giới team</td><td>Dễ xung đột khi team &gt; 30 người</td><td><span class="kw-g">Team tự chủ</span>, deploy độc lập</td></tr>
              <tr><td>Debug một request</td><td>1 stack trace, 1 log file</td><td>Cần distributed tracing, correlation ID — nếu không có thì gần như mù</td></tr>
              <tr><td>Blast radius của một bug</td><td><span class="kw-r">Toàn hệ thống</span></td><td>Thường chỉ 1 service (nếu không có coupling)</td></tr>
              <tr><td>Chi phí hạ tầng</td><td>Thấp</td><td>Cao hơn 2–4× (nhiều pod, mesh, observability, egress nội bộ)</td></tr>
              <tr><td>Chi phí tổ chức</td><td>Thấp</td><td><span class="kw-r">Cao</span> — cần platform team, on-call, runbook cho từng service</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Ngưỡng thực dụng</div>
            <p>Team &lt; 10 người, sản phẩm chưa fit: <strong>monolith</strong>, đừng bàn. 10–30 người: <strong>modular monolith</strong> với boundary rõ (mỗi module có schema riêng, không JOIN chéo). 30–100 người: tách 3–8 service theo bounded context thật sự khác biệt (ví dụ search, payment, notification). Trên 100 người: microservices gần như bắt buộc vì lý do tổ chức, không phải kỹ thuật. Câu nói ghi điểm: "Microservices là giải pháp cho vấn đề <em>tổ chức</em>, không phải vấn đề <em>kỹ thuật</em>. Nếu team chưa có vấn đề tổ chức, microservices chỉ thêm vấn đề kỹ thuật."</p>
          </div>
        </div>

        <h3>Distributed monolith — anti-pattern tốn kém nhất</h3>
        <p>Bạn tách 12 service, nhưng: chúng gọi nhau đồng bộ theo chuỗi, deploy cùng lúc, dùng chung một DB, và một thay đổi schema phải sửa 5 service. Kết quả: bạn có <strong>tất cả nhược điểm</strong> của cả hai mô hình.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="So sánh distributed monolith với gọi đồng bộ chuỗi và dùng chung database so với microservices đúng với giao tiếp bất đồng bộ">
            <defs>
              <marker id="m6a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m6ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
              </marker>
              <marker id="m6ag" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#10b981"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#ef4444">✗ DISTRIBUTED MONOLITH</text>

            <rect x="16" y="36" width="92" height="46" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="62" y="64" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">svc A</text>
            <rect x="128" y="36" width="92" height="46" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="174" y="64" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">svc B</text>
            <rect x="240" y="36" width="92" height="46" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="286" y="64" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">svc C</text>
            <rect x="352" y="36" width="92" height="46" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="398" y="64" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">svc D</text>

            <path d="M108,59 L126,59" stroke="#ef4444" stroke-width="2" marker-end="url(#m6ar)"/>
            <path d="M220,59 L238,59" stroke="#ef4444" stroke-width="2" marker-end="url(#m6ar)"/>
            <path d="M332,59 L350,59" stroke="#ef4444" stroke-width="2" marker-end="url(#m6ar)"/>

            <rect x="16" y="100" width="428" height="40" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="32" y="125" font-family="JetBrains Mono, monospace" font-size="9" fill="#ef4444">một DB chung — mọi service đọc/ghi cùng schema</text>
            <path d="M62,82 L62,98" stroke="#ef4444" stroke-width="2"/>
            <path d="M174,82 L174,98" stroke="#ef4444" stroke-width="2"/>
            <path d="M286,82 L286,98" stroke="#ef4444" stroke-width="2"/>
            <path d="M398,82 L398,98" stroke="#ef4444" stroke-width="2"/>

            <text x="16" y="168" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">1 request = A→B→C→D đồng bộ = 4× latency + 4× khả năng lỗi</text>
            <text x="16" y="184" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Đổi schema = deploy 4 service cùng lúc. Không thể rollback riêng lẻ.</text>

            <line x1="16" y1="204" x2="744" y2="204" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>

            <text x="16" y="230" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#10b981">✓ MICROSERVICES ĐÚNG — async + DB riêng</text>

            <rect x="16" y="244" width="104" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="68" y="272" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">order svc</text>
            <rect x="148" y="244" width="104" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="200" y="272" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">payment svc</text>
            <rect x="280" y="244" width="112" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="336" y="272" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">inventory svc</text>
            <rect x="420" y="244" width="120" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="480" y="272" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">notify svc</text>

            <rect x="16" y="304" width="90" height="34" rx="6" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="61" y="326" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">DB order</text>
            <rect x="148" y="304" width="104" height="34" rx="6" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="200" y="326" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">DB payment</text>
            <rect x="280" y="304" width="112" height="34" rx="6" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="336" y="326" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">DB inventory</text>
            <rect x="420" y="304" width="120" height="34" rx="6" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="480" y="326" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">DB notify</text>

            <path d="M68,290 L68,302" stroke="#505a68" stroke-width="1.5"/>
            <path d="M200,290 L200,302" stroke="#505a68" stroke-width="1.5"/>
            <path d="M336,290 L336,302" stroke="#505a68" stroke-width="1.5"/>
            <path d="M480,290 L480,302" stroke="#505a68" stroke-width="1.5"/>

            <rect x="560" y="244" width="60" height="94" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="590" y="282" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">Kafka</text>
            <text x="590" y="300" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">event bus</text>

            <path d="M120,266 L558,266" stroke="#10b981" stroke-width="2" marker-end="url(#m6ag)"/>
            <path d="M558,278 L252,278" stroke="#10b981" stroke-width="2" marker-end="url(#m6ag)"/>
            <path d="M558,292 L392,292" stroke="#10b981" stroke-width="2" marker-end="url(#m6ag)"/>

            <rect x="640" y="244" width="104" height="94" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="692" y="278" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Mỗi service</text>
            <text x="692" y="294" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">deploy riêng</text>
            <text x="692" y="308" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">rollback riêng</text>
            <text x="692" y="322" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">scale riêng</text>

            <text x="16" y="368" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Order publish "OrderCreated" → payment và inventory tự consume. Không chờ nhau, không biết nhau.</text>
            <text x="16" y="386" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Một service chết không kéo service khác sập — chỉ lag tăng, xử lý khi nó sống lại.</text>
          </svg>
          <div class="diagram-cap">Hình 6.1 — Cùng là "12 service" nhưng khác hoàn toàn về bản chất</div>
        </div>

        <h3>Bốn câu hỏi để tìm service boundary</h3>
        <ol class="list-num">
          <li><strong>Dữ liệu nào phải thay đổi cùng nhau trong một transaction?</strong> Nếu hai thứ luôn phải ACID cùng nhau, chúng thuộc cùng một service. Ranh giới transaction là ranh giới service mạnh nhất.</li>
          <li><strong>Team nào sẽ thay đổi nó?</strong> Nếu cùng một team sửa cả hai, gộp lại. Tách service để hai team khác nhau deploy độc lập — đó là mục đích chính.</li>
          <li><strong>Tần suất thay đổi và scaling có khác nhau không?</strong> Search cần scale 100× so với profile → tách. Notification cần deploy 10 lần/ngày trong khi billing deploy 1 lần/tháng → tách.</li>
          <li><strong>Nếu tách sai thì sao?</strong> Tiêu chí quyết định: nếu tách rồi mà mỗi feature vẫn phải deploy 2 service cùng lúc, bạn đã tách sai — gộp lại (điều này hoàn toàn hợp lệ và nên làm).</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Chia theo tầng kỹ thuật là sai lầm phổ biến</div>
            <p>Tách thành <code>user-service</code>, <code>order-service</code>, <code>payment-service</code> là đúng — đó là bounded context. Tách thành <code>api-service</code>, <code>business-logic-service</code>, <code>data-access-service</code> là sai — mỗi feature phải sửa cả ba, và mỗi request đi qua ba hop mạng vô nghĩa. Đây là lỗi kiến trúc kinh điển của người mới học microservices. Quy tắc: <strong>service theo chiều dọc (nghiệp vụ), không theo chiều ngang (tầng kỹ thuật)</strong>.</p>
          </div>
        </div>
      `
    },

    {
      id: 'containers', num: '6.2', title: 'Container & Kubernetes — mô hình khai báo',
      html: `
        <p>Sự thay đổi tư duy lớn nhất khi lên cloud-native không phải công nghệ mà là <span class="kw">khai báo thay vì ra lệnh</span>: bạn nói "tôi muốn 3 replica đang chạy", hệ thống tự lo phần còn lại. Kiểm tra nó đang chạy và sửa khi sai — đó là <span class="kw-y">reconcile loop</span>.</p>

        <h3>Container vs VM</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tiêu chí</th><th>VM</th><th>Container</th></tr></thead>
            <tbody>
              <tr><td>Khởi động</td><td>30s – 2 phút (boot OS)</td><td><span class="kw-g">0,5 – 5s</span></td></tr>
              <tr><td>Kích thước</td><td>GB (cả OS)</td><td>10–500 MB (chỉ app + lib)</td></tr>
              <tr><td>Cô lập</td><td><span class="kw-g">Mạnh</span> (hypervisor, kernel riêng)</td><td>Yếu hơn (chung kernel, namespace + cgroup)</td></tr>
              <tr><td>Mật độ</td><td>Vài chục/host</td><td>Hàng trăm/host</td></tr>
              <tr><td>Phù hợp</td><td>Workload tin cậy thấp, cần kernel riêng, Windows</td><td>Hầu hết microservices, batch job, CI</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Image layers và tại sao build lại nhanh</div>
            <p>Image là chồng layer bất biến. Dockerfile dòng nào cũng tạo một layer; nếu dòng đó và mọi dòng trước không đổi, layer được lấy từ cache. Vì vậy thứ tự Dockerfile quan trọng: <strong>copy <code>package.json</code> và chạy install TRƯỚC, copy source code SAU</strong>. Nếu copy source trước, mỗi lần sửa một dòng code là phải cài lại toàn bộ dependency — build từ 10s thành 5 phút. Đây là tối ưu #1 cho DX mà nhiều team vẫn làm sai.</p>
          </div>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">DOCKERFILE</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># Multi-stage: image cuối không chứa build tool</span>
<span class="c-key">FROM</span> node:22-alpine <span class="c-key">AS</span> build
<span class="c-key">WORKDIR</span> /app
<span class="c-com"># 1. Dependency trước — cache được khi chỉ đổi code</span>
<span class="c-key">COPY</span> package.json pnpm-lock.yaml ./
<span class="c-key">RUN</span> corepack enable &amp;&amp; pnpm install --frozen-lockfile
<span class="c-com"># 2. Source sau</span>
<span class="c-key">COPY</span> . .
<span class="c-key">RUN</span> pnpm build

<span class="c-key">FROM</span> node:22-alpine
<span class="c-key">WORKDIR</span> /app
<span class="c-key">RUN</span> addgroup -S app &amp;&amp; adduser -S app -G app
<span class="c-key">COPY</span> --from=build --chown=app:app /app/dist ./dist
<span class="c-key">COPY</span> --from=build --chown=app:app /app/node_modules ./node_modules
<span class="c-com"># Không chạy root — bắt buộc cho production</span>
<span class="c-key">USER</span> app
<span class="c-key">EXPOSE</span> 3000
<span class="c-com"># Exec form: signal (SIGTERM) tới đúng process, không qua shell</span>
<span class="c-key">CMD</span> [<span class="c-str">"node"</span>, <span class="c-str">"dist/server.js"</span>]</code></pre>
        </div>

        <h3>Kubernetes — bốn khái niệm đủ dùng</h3>
        <ul class="list-bullet">
          <li><span class="kw">Pod:</span> đơn vị nhỏ nhất, chứa 1+ container chia sẻ network namespace. Thường 1 container chính + sidecar. Pod là <em>ephemeral</em> — không bao giờ giả định nó tồn tại.</li>
          <li><span class="kw">Deployment:</span> quản lý replica của pod, hỗ trợ rolling update và rollback. Đây là thứ bạn dùng cho stateless app.</li>
          <li><span class="kw">Service:</span> tên DNS + load balancing ổn định cho tập pod luôn thay đổi (ClusterIP, NodePort, LoadBalancer).</li>
          <li><span class="kw">StatefulSet:</span> cho workload cần identity ổn định (DB, Kafka broker) — pod giữ tên, PVC giữ volume, khởi động theo thứ tự.</li>
        </ul>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">YAML</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-key">apiVersion</span>: apps/v1
<span class="c-key">kind</span>: Deployment
<span class="c-key">metadata</span>:
  <span class="c-key">name</span>: order-api
<span class="c-key">spec</span>:
  <span class="c-key">replicas</span>: <span class="c-num">3</span>
  <span class="c-key">strategy</span>:
    <span class="c-key">type</span>: RollingUpdate
    <span class="c-key">rollingUpdate</span>: { <span class="c-key">maxSurge</span>: <span class="c-num">1</span>, <span class="c-key">maxUnavailable</span>: <span class="c-num">0</span> }  <span class="c-com"># không giảm capacity</span>
  <span class="c-key">selector</span>: { <span class="c-key">matchLabels</span>: { <span class="c-key">app</span>: order-api } }
  <span class="c-key">template</span>:
    <span class="c-key">metadata</span>: { <span class="c-key">labels</span>: { <span class="c-key">app</span>: order-api } }
    <span class="c-key">spec</span>:
      <span class="c-key">terminationGracePeriodSeconds</span>: <span class="c-num">30</span>
      <span class="c-key">containers</span>:
        - <span class="c-key">name</span>: api
          <span class="c-key">image</span>: registry/order-api:1.4.2      <span class="c-com"># tag cố định, không dùng :latest</span>
          <span class="c-key">ports</span>: [{ <span class="c-key">containerPort</span>: <span class="c-num">3000</span> }]
          <span class="c-key">resources</span>:
            <span class="c-key">requests</span>: { <span class="c-key">cpu</span>: <span class="c-num">200m</span>, <span class="c-key">memory</span>: <span class="c-num">256Mi</span> }   <span class="c-com"># scheduler dùng để chọn node</span>
            <span class="c-key">limits</span>:   { <span class="c-key">cpu</span>: <span class="c-num">1000m</span>, <span class="c-key">memory</span>: <span class="c-num">512Mi</span> }  <span class="c-com"># vượt memory → OOMKilled</span>
          <span class="c-key">readinessProbe</span>:                       <span class="c-com"># fail → rút khỏi Service</span>
            <span class="c-key">httpGet</span>: { <span class="c-key">path</span>: /health/ready, <span class="c-key">port</span>: <span class="c-num">3000</span> }
            <span class="c-key">initialDelaySeconds</span>: <span class="c-num">5</span>
            <span class="c-key">periodSeconds</span>: <span class="c-num">5</span>
          <span class="c-key">livenessProbe</span>:                        <span class="c-com"># fail → restart container</span>
            <span class="c-key">httpGet</span>: { <span class="c-key">path</span>: /health/live, <span class="c-key">port</span>: <span class="c-num">3000</span> }
            <span class="c-key">periodSeconds</span>: <span class="c-num">10</span>
            <span class="c-key">failureThreshold</span>: <span class="c-num">3</span>
          <span class="c-key">lifecycle</span>:
            <span class="c-key">preStop</span>:
              <span class="c-key">exec</span>: { <span class="c-key">command</span>: [<span class="c-str">"sh"</span>, <span class="c-str">"-c"</span>, <span class="c-str">"sleep 5"</span>] }  <span class="c-com"># chờ LB cập nhật</span></code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Ba lỗi Kubernetes làm sập production nhiều nhất</div>
            <p><strong>1. Không có <code>preStop</code> sleep:</strong> khi pod bị xoá, K8s gửi SIGTERM và rút pod khỏi Service <em>gần như đồng thời</em>. Nhưng load balancer cần 1–5 giây để cập nhật. Trong khoảng đó, traffic vẫn được đẩy tới pod đang tắt → <span class="kw-r">502 hàng loạt mỗi lần deploy</span>. Sửa: thêm <code>preStop: sleep 5</code>. <strong>2. Liveness probe kiểm tra dependency:</strong> nếu <code>/health/live</code> ping DB, DB chậm 30s → tất cả pod bị restart <em>cùng lúc</em> → toàn hệ thống sập vì một DB chậm. Liveness chỉ nên kiểm tra process còn phản hồi, không kiểm tra dependency. <strong>3. CPU limit quá thấp:</strong> CPU limit gây throttling, không chỉ giới hạn mà còn làm chậm đột ngột. Với app latency-sensitive, đặt CPU limit = 2–3× request hoặc bỏ limit (chỉ đặt request). Đây là chủ đề gây tranh cãi nhưng với hầu hết workload, <code>request</code> là đủ để scheduler hoạt động đúng.</p>
          </div>
        </div>

        <h3>Autoscaling — metric nào mới đúng</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách scale</th><th>Metric</th><th>Vấn đề</th></tr></thead>
            <tbody>
              <tr><td>HPA theo CPU</td><td><code>cpu utilization 70%</code></td><td>CPU không tương quan với tải thật với app I/O-bound. App chờ DB ở 15% CPU sẽ không scale dù latency tăng.</td></tr>
              <tr><td><span class="kw-g">HPA theo RPS</span></td><td>requests per second per pod</td><td>Tốt nhất cho API — tương quan trực tiếp. Cần Prometheus adapter.</td></tr>
              <tr><td><span class="kw-g">KEDA theo queue</span></td><td>queue depth / lag</td><td>Đúng cho worker. Scale theo Kafka lag là chuẩn mực.</td></tr>
              <tr><td>Scale theo lịch</td><td>Cron</td><td>Hiệu quả cho traffic biết trước (giờ làm việc). Kết hợp với HPA, không thay thế.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Scale-out không cứu được app bị nghẽn ở DB</div>
            <p>Nếu bottleneck là DB connection pool (ví dụ max 100 connection, mỗi pod giữ 10), thì scale từ 5 lên 20 pod sẽ làm 200 connection cùng tranh 100 slot → <strong>tệ hơn trước</strong>: nhiều pod hơn, mỗi pod chờ lâu hơn, timeout nhiều hơn. Đây là lý do phải biết bottleneck thật trước khi bật autoscaling. Kiểm tra: tăng pod gấp đôi, nếu throughput không tăng mà latency tăng → nghẽn ở tài nguyên chia sẻ (DB, Redis, downstream API). Giải pháp đúng là connection pooler (PgBouncer), cache, hoặc đọc từ replica — không phải thêm pod.</p>
          </div>
        </div>
      `
    },

    {
      id: 'mesh', num: '6.3', title: 'Service mesh, API gateway và biên hệ thống',
      html: `
        <p>Ba thành phần này hay bị nhầm với nhau. Phân biệt rõ: <span class="kw">API gateway</span> ở rìa (bắc-nam), <span class="kw">service mesh</span> ở bên trong (đông-tây), <span class="kw">Ingress/LB</span> là tầng thấp hơn của rìa.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="Phân biệt API gateway ở rìa với service mesh bên trong và các tầng của biên hệ thống">
            <defs>
              <marker id="m6b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#8b95a3">BẮC–NAM (client → hệ thống)</text>
            <text x="500" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#8b95a3">ĐÔNG–TÂY (service → service)</text>

            <rect x="16" y="36" width="86" height="46" rx="7" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="59" y="64" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Internet</text>

            <rect x="126" y="36" width="100" height="46" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="176" y="56" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">CDN + WAF</text>
            <text x="176" y="72" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">DDoS, cache tĩnh</text>

            <rect x="250" y="36" width="110" height="46" rx="7" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="305" y="56" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Load Balancer</text>
            <text x="305" y="72" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">L4, TLS terminate</text>

            <rect x="384" y="36" width="120" height="46" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="444" y="52" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">API Gateway</text>
            <text x="444" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">auth, rate limit,</text>
            <text x="444" y="77" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">routing, transform</text>

            <path d="M102,59 L124,59" stroke="#505a68" stroke-width="2" marker-end="url(#m6b)"/>
            <path d="M226,59 L248,59" stroke="#505a68" stroke-width="2" marker-end="url(#m6b)"/>
            <path d="M360,59 L382,59" stroke="#505a68" stroke-width="2" marker-end="url(#m6b)"/>

            <rect x="530" y="36" width="214" height="52" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="637" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Service mesh (Istio/Linkerd)</text>
            <text x="637" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">mTLS, retry, timeout, circuit breaker</text>

            <line x1="16" y1="106" x2="744" y2="106" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>

            <rect x="384" y="122" width="120" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="444" y="150" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">order svc</text>

            <rect x="384" y="200" width="120" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="444" y="228" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">payment svc</text>

            <rect x="384" y="278" width="120" height="46" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="444" y="306" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">notify svc</text>

            <path d="M444,82 L444,120" stroke="#505a68" stroke-width="2" marker-end="url(#m6b)"/>
            <path d="M444,168 L444,198" stroke="#505a68" stroke-width="2" marker-end="url(#m6b)"/>
            <path d="M444,246 L444,276" stroke="#505a68" stroke-width="2" marker-end="url(#m6b)"/>

            <rect x="524" y="122" width="220" height="52" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="634" y="142" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#3f3f3f">sidecar: envoy</text>
            <text x="634" y="160" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">mỗi pod có 1 proxy, chặn mọi traffic</text>

            <rect x="524" y="200" width="220" height="52" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="634" y="220" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#3f3f3f">sidecar: envoy</text>
            <text x="634" y="238" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">retry policy + timeout ở đây, không ở code</text>

            <rect x="16" y="140" width="340" height="102" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="164" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">API Gateway làm gì (và không làm gì)</text>
            <text x="34" y="184" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">✓ terminated auth, rate limit, routing</text>
            <text x="34" y="200" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">✓ request/response transform, versioning</text>
            <text x="34" y="216" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">✗ KHÔNG chứa business logic</text>
            <text x="34" y="232" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">✗ KHÔNG gọi DB, KHÔNG orchestrate</text>

            <rect x="16" y="262" width="340" height="102" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="286" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Khi nào cần service mesh</text>
            <text x="34" y="306" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">✓ &gt; 20 service và cần mTLS toàn bộ</text>
            <text x="34" y="322" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">✓ Cần canary/thay đổi traffic động</text>
            <text x="34" y="338" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">✓ Nhiều team, nhiều ngôn ngữ</text>
            <text x="34" y="354" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">✗ &lt; 10 service: dùng library là đủ</text>
          </svg>
          <div class="diagram-cap">Hình 6.2 — Gateway ở rìa xử lý "ai được vào"; mesh ở trong xử lý "service nói chuyện với nhau thế nào"</div>
        </div>

        <h3>Những gì mesh cho bạn miễn phí — và cái giá</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Khả năng</th><th>Không mesh</th><th>Có mesh</th></tr></thead>
            <tbody>
              <tr><td>mTLS mọi chiều</td><td>Cấu hình từng service, từng ngôn ngữ</td><td>Tự động, không cần code</td></tr>
              <tr><td>Retry / timeout / circuit breaker</td><td>Mỗi service tự implement (hoặc dùng lib riêng)</td><td>Khai báo policy ở CRD</td></tr>
              <tr><td>Traffic splitting (canary 5%)</td><td>Sửa LB/service config</td><td>VirtualService weight: 5/95</td></tr>
              <tr><td>Distributed tracing</td><td>Tự inject header, tự propagate</td><td>Tự động từ sidecar</td></tr>
              <tr><td>Chi phí</td><td>0</td><td>+1 hop (~1–2ms), +50–100MB RAM/pod, +1 hệ thống phải vận hành</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Service mesh làm tăng độ phức tạp debug</div>
            <p>Khi request fail, bạn phải kiểm tra thêm một tầng: sidecar có drop không? mTLS có lỗi cert không? policy có chặn không? Với team chưa có người vận hành K8s thành thạo, mesh biến sự cố đơn giản thành sự cố nhiều tầng. Đánh giá thực dụng: nếu team &lt; 10 service và chưa có platform team, hãy dùng library (Resilience4j, gRPC interceptor) hoặc để orchestrator (K8s NetworkPolicy + Ingress) xử lý. Thêm mesh khi bạn đã có vấn đề mà mesh giải quyết — không phải để "hiện đại".</p>
          </div>
        </div>

        <h3>Ambient mesh — hướng đi mới</h3>
        <p>Istio ambient mode (và Linkerd không sidecar) chuyển proxy từ per-pod sang per-node (ztunnel) + per-service khi cần L7. Kết quả: giảm 90% RAM overhead, giảm latency, nhưng vẫn có mTLS và L4 policy. Với L7 (retry, header routing) thì vẫn cần waypoint proxy nhưng chỉ cho service cần. Đây là hướng đi rõ ràng của 2024–2026 vì nó giải quyết đúng nhược điểm lớn nhất của mesh cổ điển. Trong phỏng vấn, nhắc đến điều này cho thấy bạn cập nhật.</p>
      `
    },

    {
      id: 'sre', num: '6.4', title: 'SRE — SLO, error budget và on-call',
      html: `
        <p>SRE không phải "đội vận hành". Nó là cách áp dụng tư duy kỹ thuật vào vận hành, với một công cụ trung tâm: <span class="kw">error budget</span> — biến "hệ thống có đủ tốt không" thành câu hỏi có số.</p>

        <h3>SLI → SLO → SLA → error budget</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Khái niệm</th><th>Định nghĩa</th><th>Ví dụ cụ thể</th></tr></thead>
            <tbody>
              <tr><td><strong>SLI</strong></td><td>Số đo thực tế</td><td>"Tỉ lệ request <code>/checkout</code> trả 200 trong &lt; 500ms" = 99,95%</td></tr>
              <tr><td><strong>SLO</strong></td><td>Mục tiêu nội bộ cho SLI</td><td>"99,9% trong cửa sổ 28 ngày"</td></tr>
              <tr><td><strong>SLA</strong></td><td>Cam kết pháp lý với khách</td><td>"99,5%, vi phạm → hoàn 10% phí"</td></tr>
              <tr><td><strong>Error budget</strong></td><td>100% − SLO</td><td>0,1% của 28 ngày = <strong>40 phút 19 giây</strong> downtime được phép</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Bảng quy đổi nhanh — học thuộc</div>
            <p><strong>99%</strong> / 30 ngày = 7 giờ 18 phút. <strong>99,9%</strong> = 43 phút 50 giây. <strong>99,95%</strong> = 21 phút 55 giây. <strong>99,99%</strong> = 4 phút 23 giây. <strong>99,999%</strong> = 26 giây. Đây là con số nên nhớ vì nó xuất hiện trong hầu hết buổi phỏng vấn khi bàn về reliability. Và một hệ thống gồm 5 service nối tiếp, mỗi cái 99,9%, cho SLI tổng chỉ <strong>99,5%</strong> (0,999⁵) — tức 3,6 giờ/tháng. Đó là lý do "chuỗi phụ thuộc" là kẻ thù của reliability.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 380" role="img" aria-label="Error budget theo thời gian với các sự cố tiêu thụ budget và quyết định đóng băng feature">
            <defs>
              <marker id="m6c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">28 NGÀY — BUỘC PHẢI CÓ 99,9% ⇒ 40 PHÚT BUDGET</text>

            <rect x="16" y="34" width="728" height="80" rx="9" fill="#f8fafc" stroke="#151515" stroke-width="2"/>
            <line x1="16" y1="74" x2="744" y2="74" stroke="#e7ebf1" stroke-width="1"/>

            <rect x="16" y="34" width="180" height="80" rx="9" fill="#dcfce7" fill-opacity="0.7" stroke="none"/>
            <text x="106" y="106" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">tuần 1 — tiêu 2 phút</text>

            <rect x="220" y="34" width="120" height="80" rx="4" fill="#fee2e2" fill-opacity="0.8" stroke="none"/>
            <text x="280" y="106" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">sự cố A</text>
            <text x="280" y="118" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">18 phút</text>

            <rect x="380" y="34" width="90" height="80" rx="4" fill="#fee2e2" fill-opacity="0.8" stroke="none"/>
            <text x="425" y="106" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">B: 12 phút</text>

            <rect x="510" y="34" width="234" height="80" rx="9" fill="#fef3c7" fill-opacity="0.6" stroke="none"/>
            <text x="627" y="106" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#b45309">còn 8 phút budget</text>

            <text x="16" y="152" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="#505a68">Đã tiêu: 32/40 phút (80%)</text>

            <rect x="16" y="166" width="728" height="14" rx="7" fill="#eef2f6" stroke="#151515" stroke-width="1.5"/>
            <rect x="16" y="166" width="582" height="14" rx="7" fill="#fb923c" stroke="#151515" stroke-width="1.5"/>
            <text x="606" y="178" font-family="JetBrains Mono, monospace" font-size="9" fill="#fb923c">80%</text>

            <rect x="16" y="200" width="352" height="76" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="34" y="224" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Khi budget &lt; 25% còn lại</text>
            <text x="34" y="246" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ Đóng băng feature mới</text>
            <text x="34" y="262" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ Dồn toàn lực vào reliability</text>
            <text x="34" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Đây là quy tắc tổ chức, không phải kỹ thuật.</text>

            <rect x="384" y="200" width="360" height="76" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="402" y="224" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Khi budget còn nhiều</text>
            <text x="402" y="246" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ Đẩy feature nhanh hơn, chấp nhận rủi ro</text>
            <text x="402" y="262" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ Có thể chạy chaos experiment</text>
            <text x="402" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">Reliability không phải "càng cao càng tốt".</text>

            <rect x="16" y="292" width="728" height="72" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Vì sao SLO 100% là sai lầm</text>
            <text x="34" y="338" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Chi phí tăng phi tuyến: từ 99,9% lên 99,99% tốn gấp 10× công sức (redundancy, multi-region, testing). Không user nào phân biệt được 99,99% và 99,999%.</text>
            <text x="34" y="356" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Và nếu SLO = 100%, error budget = 0 → mọi deploy đều "vi phạm" → quy tắc mất ý nghĩa. SLO phải đủ thấp để đạt được, đủ cao để user hài lòng.</text>
          </svg>
          <div class="diagram-cap">Hình 6.3 — Error budget biến reliability thành quyết định kinh doanh, không phải tranh luận cảm tính</div>
        </div>

        <h3>Chọn SLI nào — ba loại</h3>
        <ol class="list-num">
          <li><strong>Request-based:</strong> tỉ lệ request thành công / tổng request. Dễ đo, đúng cho API. Nhược điểm: không phản ánh user không gọi được (vì app crash trước khi gửi request).</li>
          <li><strong>Window-based:</strong> tỉ lệ thời gian hệ thống "tốt" (ví dụ &lt; 1% request lỗi trong mỗi phút). Gần với trải nghiệm người dùng hơn request-based.</li>
          <li><strong>User-journey-based:</strong> tỉ lệ user hoàn thành được flow (đăng nhập → tìm → mua). Đúng nhất nhưng khó đo, cần instrumentation đặc biệt.</li>
        </ol>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">PROMQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># SLI: tỉ lệ request /checkout thành công trong 5 phút</span>
<span class="c-key">sum</span>(rate(http_requests_total{route=<span class="c-str">"/checkout"</span>, status!~<span class="c-str">"5.."</span>}[<span class="c-num">5m</span>]))
/
<span class="c-key">sum</span>(rate(http_requests_total{route=<span class="c-str">"/checkout"</span>}[<span class="c-num">5m</span>]))

<span class="c-com"># Multi-window, multi-burn-rate alert (Google SRE workbook)</span>
<span class="c-com"># Cửa sổ ngắn bắt sự cố đột ngột, cửa sổ dài tránh false positive</span>

<span class="c-com"># Burn rate = mức tiêu budget so với tốc độ bình thường</span>
<span class="c-com"># 14.4x trong 1h + 5m  → đốt hết budget 30 ngày trong 2 ngày ⇒ PAGE</span>
<span class="c-key">sum</span>(rate(http_requests_total{status=~<span class="c-str">"5.."</span>}[<span class="c-num">1h</span>]))
/ <span class="c-key">sum</span>(rate(http_requests_total[<span class="c-num">1h</span>])) &gt; (<span class="c-num">14.4</span> * <span class="c-num">0.001</span>)

<span class="c-com"># 6x trong 6h → đốt hết trong 5 ngày ⇒ TICKET (không đánh thức ai lúc 3h sáng)</span>
<span class="c-key">sum</span>(rate(http_requests_total{status=~<span class="c-str">"5.."</span>}[<span class="c-num">6h</span>]))
/ <span class="c-key">sum</span>(rate(http_requests_total[<span class="c-num">6h</span>])) &gt; (<span class="c-num">6</span> * <span class="c-num">0.001</span>)

<span class="c-com"># Latency SLI: p99 dưới 500ms (dùng histogram bucket, không dùng average)</span>
histogram_quantile(<span class="c-num">0.99</span>,
  <span class="c-key">sum</span> <span class="c-key">by</span> (le) (rate(http_request_duration_seconds_bucket[<span class="c-num">5m</span>]))
) &gt; <span class="c-num">0.5</span></code></pre>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Ba nguyên tắc alerting để không bị báo động giả</div>
            <p><strong>1. Alert theo triệu chứng, không theo nguyên nhân.</strong> Alert "CPU &gt; 80%" là nguyên nhân — có thể hoàn toàn bình thường. Alert "error rate &gt; 1%" là triệu chứng người dùng đang đau. Chỉ page khi có triệu chứng; nguyên nhân để dashboard.<strong> 2. Mỗi alert phải có runbook.</strong> Nếu bạn không viết được "khi alert này cháy, làm 3 bước sau", alert đó chưa sẵn sàng — nó sẽ chỉ làm người trực hoang mang.<strong> 3. Alert phải actionable.</strong> Nếu alert cháy và câu trả lời là "chờ nó tự hết", xoá alert đi. Mỗi alert giả làm giảm độ tin cậy vào toàn bộ hệ thống alert — đến lúc có sự cố thật, người trực sẽ bỏ qua.</p>
          </div>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">On-call bền vững — những con số</div>
            <p>Một rotation bền vững: tối đa <strong>2 sự cố/12h shift</strong>, tối đa <strong>1 tuần on-call mỗi 4–6 tuần</strong>, và <strong>không quá 25% thời gian</strong> dành cho vận hành (Google SRE: 50% là trần, 25% là mục tiêu). Nếu on-call liên tục bị đánh thức, đó là bug của hệ thống, không phải của người trực. Chỉ số cần theo dõi: <strong>số trang/tuần</strong>, <strong>tỉ lệ false positive</strong>, <strong>thời gian khôi phục trung bình (MTTR)</strong>. Và quy tắc quan trọng: sau mỗi sự cố, viết <strong>blameless postmortem</strong> với action item có owner và deadline — nếu không có action item, sự cố đó sẽ lặp lại.</p>
          </div>
        </div>
      `
    },

    {
      id: 'multi-region', num: '6.5', title: 'Multi-region — active-passive, active-active và cell',
      html: `
        <p>Multi-region là quyết định đắt nhất trong toàn bộ thiết kế hệ thống. Trước khi bàn, hãy trả lời: <span class="kw">bạn cần nó vì latency, vì compliance, hay vì chịu được mất region?</span> Ba lý do này dẫn đến ba thiết kế khác nhau và ba mức chi phí khác nhau.</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Mô hình</th><th>RPO</th><th>RTO</th><th>Chi phí</th><th>Khi nào dùng</th></tr></thead>
            <tbody>
              <tr><td><strong>Backup & restore</strong></td><td>24h</td><td>4–24h</td><td>$</td><td>Hầu hết hệ thống — <span class="kw-g">bắt đầu ở đây</span></td></tr>
              <tr><td><strong>Pilot light</strong></td><td>~1 phút</td><td>30–60 phút</td><td>$$</td><td>DB replica chạy nhưng app tắt; bật khi cần</td></tr>
              <tr><td><strong>Warm standby</strong></td><td>giây</td><td>1–5 phút</td><td>$$$</td><td>App chạy ở scale nhỏ, sẵn sàng scale lên</td></tr>
              <tr><td><strong>Active-passive (hot)</strong></td><td>0–giây</td><td>&lt; 1 phút</td><td>$$$$</td><td>Cần failover nhanh, chấp nhận region phụ idle</td></tr>
              <tr><td><strong>Active-active</strong></td><td>0 (nếu đồng bộ) hoặc vài giây</td><td>0</td><td>$$$$$</td><td>Latency toàn cầu hoặc cần chịu mất region tức thời</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">RPO và RTO — hai chữ phải phân biệt</div>
            <p><strong>RPO</strong> (Recovery Point Objective): mất tối đa bao nhiêu <em>dữ liệu</em> (tính bằng thời gian). RPO = 1 phút nghĩa là có thể mất 1 phút giao dịch cuối. <strong>RTO</strong> (Recovery Time Objective): mất tối đa bao nhiêu <em>thời gian</em> để phục hồi. RTO = 30 phút nghĩa là hệ thống có thể chết 30 phút. Với thanh toán: RPO phải = 0 (không mất giao dịch), RTO có thể 15 phút. Với feed: RPO = 5 phút chấp nhận được, RTO = 1 phút. Hai con số này quyết định kiến trúc, không phải ngược lại.</p>
          </div>
        </div>

        <h3>Active-active — cái bẫy của "chỉ cần thêm region"</h3>
        <p>Active-active nghe đơn giản: deploy ở 2 region, dùng GeoDNS chia traffic. Nhưng khi cả hai region đều nhận ghi cho cùng dữ liệu, bạn có bài toán <span class="kw-r">xung đột ghi xuyên region</span> — và latency giữa region (50–200ms) khiến mọi giải pháp đồng bộ đều đắt.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 420" role="img" aria-label="Ba cách bố trí multi-region: active-passive, active-active theo user partition, và cell-based architecture">
            <defs>
              <marker id="m6d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">1. ACTIVE–PASSIVE (hot standby)</text>
            <rect x="16" y="34" width="168" height="66" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="100" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Region A — ACTIVE</text>
            <text x="100" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">100% traffic</text>
            <text x="100" y="90" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">leader cho writes</text>

            <rect x="200" y="34" width="168" height="66" rx="8" fill="#f8fafc" stroke="#8b95a3" stroke-width="2" stroke-dasharray="5 3"/>
            <text x="284" y="58" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#8b95a3">Region B — STANDBY</text>
            <text x="284" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">0% traffic</text>
            <text x="284" y="90" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">replica, chỉ đọc</text>

            <path d="M184,58 L198,58" stroke="#10b981" stroke-width="2" marker-end="url(#m6d)"/>
            <text x="190" y="122" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">async repl</text>

            <rect x="392" y="34" width="352" height="66" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="410" y="56" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Failover: GeoDNS đổi A record + promote replica</text>
            <text x="410" y="74" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Thời gian: 1–5 phút (DNS TTL + promote + warm up)</text>
            <text x="410" y="90" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Rủi ro: mất ghi cuối (async), DNS còn cache ở ISP</text>

            <line x1="16" y1="150" x2="744" y2="150" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>

            <text x="16" y="176" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">2. ACTIVE–ACTIVE theo partition user (thực dụng nhất)</text>
            <rect x="16" y="188" width="168" height="80" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="100" y="210" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Region A</text>
            <text x="100" y="228" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">users hash &lt; 50%</text>
            <text x="100" y="244" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">owns writes cho nửa này</text>
            <text x="100" y="260" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">+ đọc cho 100%</text>

            <rect x="200" y="188" width="168" height="80" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="284" y="210" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Region B</text>
            <text x="284" y="228" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">users hash ≥ 50%</text>
            <text x="284" y="244" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">owns writes cho nửa kia</text>
            <text x="284" y="260" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#10b981">+ đọc cho 100%</text>

            <rect x="392" y="188" width="352" height="80" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="410" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Không có xung đột vì mỗi user chỉ ghi ở 1 region</text>
            <text x="410" y="228" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Routing: GeoDNS/anycast đưa user về region "nhà" của họ.</text>
            <text x="410" y="244" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Nếu region nhà chết → override routing, nhận write ở region kia</text>
            <text x="410" y="260" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">(chấp nhận latency cao hơn, không nhất quán lâu dài).</text>

            <line x1="16" y1="290" x2="744" y2="290" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>

            <text x="16" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">3. CELL-BASED — giới hạn blast radius</text>
            <rect x="16" y="328" width="110" height="60" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="71" y="352" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">cell 1</text>
            <text x="71" y="366" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">user 1–10M</text>
            <rect x="140" y="328" width="110" height="60" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="195" y="352" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">cell 2</text>
            <text x="195" y="366" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">user 10–20M</text>
            <rect x="264" y="328" width="110" height="60" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="319" y="352" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">cell 3</text>
            <text x="319" y="366" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">user 20–30M</text>
            <rect x="388" y="328" width="110" height="60" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="443" y="352" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#ef4444">cell 4 ✗</text>
            <text x="443" y="366" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#ef4444">hỏng → 10M user</text>

            <rect x="516" y="328" width="228" height="60" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="534" y="350" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" fill="#151515">Mỗi cell là một stack đầy đủ</text>
            <text x="534" y="366" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">app + DB + cache, độc lập hoàn toàn.</text>
            <text x="534" y="380" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#8b95a3">Blast radius = 1 cell thay vì toàn hệ thống.</text>
          </svg>
          <div class="diagram-cap">Hình 6.4 — Active-active theo partition user an toàn hơn nhiều so với active-active ghi chung</div>
        </div>

        <h3>Vì sao active-active ghi chung cực khó</h3>
        <ul class="list-bullet">
          <li><strong>Latency đồng bộ:</strong> để hai region cùng nhất quán, mỗi write phải chờ region kia ack → +100–200ms cho <em>mọi</em> write. Nếu bạn cần cross-region consensus (Spanner), mỗi commit mất 100ms+.</li>
          <li><strong>Xung đột:</strong> hai user ở hai region sửa cùng một document → phải LWW (mất dữ liệu) hoặc CRDT (chỉ áp dụng được cho một số kiểu dữ liệu).</li>
          <li><strong>Deadlock phân tán:</strong> transaction chạm hai region có thể deadlock, phát hiện chậm và đắt.</li>
          <li><strong>Clock skew:</strong> hai region lệch đồng hồ → LWW sai. Cần TrueTime (Spanner) hoặc HLC + uncertainty window.</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Câu trả lời thực dụng cho 90% trường hợp</div>
            <p>"Tôi dùng <strong>active-passive với warm standby</strong> ở region phụ: app chạy 10% scale, DB là read replica. Failover mất 2–5 phút, RPO ~1 giây với semi-sync. Điều này đủ cho hầu hết SLA. Nếu cần latency toàn cầu, tôi đặt <strong>read replica + CDN ở các region khác</strong> — đọc gần user, ghi vẫn về một region. Chỉ khi yêu cầu là 'chịu được mất region trong 0 giây' hoặc 'ghi phải &lt; 50ms toàn cầu' tôi mới cân nhắc active-active, và khi đó tôi dùng <strong>partition theo user</strong> để tránh xung đột — mỗi user chỉ ghi ở một region." Đây là câu trả lời của người đã làm thật.</p>
          </div>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Failover chưa được diễn tập là failover không tồn tại</div>
            <p>Đây là bài học đau nhất của multi-region. Kiến trúc có thể đúng trên giấy nhưng failover thất bại vì: DNS TTL 3600s khiến traffic vẫn về region chết 1 giờ; capacity region phụ không đủ (chạy 10% scale, không kịp scale trong 5 phút); secret/config region phụ lỗi thời; hoặc đơn giản là không ai biết quy trình. Quy tắc: <strong>diễn tập failover mỗi quý</strong>, chạy <strong>game day</strong> với traffic thật (hoặc một phần), đo RTO thật. Và luôn có <strong>"failback plan"</strong> — quay lại region chính cũng là một sự cố cần kế hoạch. Nhiều công ty failover thành công nhưng sập khi failback vì region chính đã có dữ liệu phân kỳ.</p>
          </div>
        </div>
      `
    },

    {
      id: 'cost', num: '6.6', title: 'Cost optimization — kỹ thuật như một bài toán kinh tế',
      html: `
        <p>Ở quy mô lớn, chi phí cloud thường là khoản chi lớn thứ hai sau lương. Và nghịch lý: kiến trúc "đúng kỹ thuật" có thể tốn gấp 5 lần. Bài toán tối ưu chi phí là bài toán <span class="kw">đo lường trước, cắt sau</span>.</p>

        <h3>Chi phí thật nằm ở đâu</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Thành phần</th><th>Tỉ lệ điển hình</th><th>Ghi chú</th></tr></thead>
            <tbody>
              <tr><td>Compute (VM/pod)</td><td>30–45%</td><td>Thường bị lãng phí 30–50% do over-provision</td></tr>
              <tr><td><strong>Egress / data transfer</strong></td><td>10–25%</td><td><span class="kw-r">Khoản bị đánh giá thấp nhất</span> — cross-AZ, ra internet, giữa region</td></tr>
              <tr><td>Storage</td><td>10–20%</td><td>Tăng đơn điệu, không ai xoá</td></tr>
              <tr><td>Managed services (DB, cache, queue)</td><td>15–30%</td><td>Phần lớn tốn kém nhất theo đơn vị</td></tr>
              <tr><td>Observability</td><td>5–15%</td><td><span class="kw-r">Tăng nhanh nhất</span> — log/metrics volume không ai kiểm soát</td></tr>
              <tr><td>Idle / orphaned</td><td>5–15%</td><td>Volume không gắn, IP không dùng, snapshot cũ, môi trường dev quên tắt</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Con số làm bạn giật mình: cross-AZ</div>
            <p>Trong AWS, traffic cross-AZ tốn ~$0,01/GB mỗi chiều. Một service gọi DB 1.000 lần/s với response 10KB = 10 MB/s = <strong>25 TB/tháng</strong>. Cross-AZ hai chiều = 50 TB × $0,02 = <strong>$1.000/tháng</strong> chỉ cho việc "nói chuyện giữa các AZ" của <em>một</em> service. Với 20 service, đó là $20.000/tháng không tạo ra giá trị nào cho user. Đây là lý do <strong>zone-aware routing</strong> (route request tới replica cùng AZ) là tối ưu chi phí quan trọng, không chỉ là tối ưu latency.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="Bốn đòn tối ưu chi phí theo thứ tự hiệu quả: xoá lãng phí, right-sizing, pricing model và kiến trúc">
            <defs>
              <marker id="m6e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">BỐN ĐÒN THEO THỨ TỰ HIỆU QUẢ — làm từ trái sang</text>

            <rect x="16" y="36" width="174" height="150" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="103" y="60" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">1. XOÁ LÃNG PHÍ</text>
            <text x="103" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">giảm 5–20%, 1 tuần</text>
            <text x="30" y="102" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• volume không gắn</text>
            <text x="30" y="118" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• IP/ELB không dùng</text>
            <text x="30" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• snapshot &gt; 90 ngày</text>
            <text x="30" y="150" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• dev/staging chạy 24/7</text>
            <text x="30" y="166" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• log retention vô hạn</text>

            <rect x="206" y="36" width="174" height="150" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="293" y="60" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">2. RIGHT-SIZING</text>
            <text x="293" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#5294ff">giảm 20–40%, 1 tháng</text>
            <text x="220" y="102" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• CPU thật &lt; 20% ⇒ giảm</text>
            <text x="220" y="118" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• memory thật &lt; 40% ⇒ giảm</text>
            <text x="220" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• đặt request đúng cho K8s</text>
            <text x="220" y="150" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• dùng ARM (Graviton) −20%</text>
            <text x="220" y="166" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• đo p95, không đo peak</text>

            <rect x="396" y="36" width="174" height="150" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="483" y="60" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">3. PRICING MODEL</text>
            <text x="483" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#b45309">giảm 30–60%, ngay</text>
            <text x="410" y="102" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Savings Plan 1–3 năm: −40%</text>
            <text x="410" y="118" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• Spot cho batch/CI: −70%</text>
            <text x="410" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• S3 tiering (Glacier): −80%</text>
            <text x="410" y="150" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• reserved DB instance: −35%</text>
            <text x="410" y="166" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• không có workload tĩnh ⇒</text>
            <text x="410" y="178" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">  Savings Plan cam kết sai = lỗ</text>

            <rect x="586" y="36" width="158" height="150" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="665" y="60" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">4. KIẾN TRÚC</text>
            <text x="665" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8c4fff">giảm 50%+, 6 tháng</text>
            <text x="600" y="102" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• cache giảm egress DB</text>
            <text x="600" y="118" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• zone-aware routing</text>
            <text x="600" y="134" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• batch thay vì per-request</text>
            <text x="600" y="150" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• archive sang object store</text>
            <text x="600" y="166" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">• giảm telemetry volume</text>

            <rect x="16" y="204" width="360" height="90" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="34" y="228" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Ba thứ thường bị bỏ quên nhất</text>
            <text x="34" y="250" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">1. Observability: log 100% request với full body →</text>
            <text x="34" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">   vài TB/ngày, tốn hơn cả compute. Sample 1–10%.</text>
            <text x="34" y="284" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">2. Cross-AZ traffic: bật zone-aware routing.</text>

            <rect x="392" y="204" width="352" height="90" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="410" y="228" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515"> 3. Môi trường non-prod</text>
            <text x="410" y="250" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Dev/staging chạy 24/7 với size bằng production là</text>
            <text x="410" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">lãng phí 20–30% hoá đơn. Lịch tắt 19h–7h và</text>
            <text x="410" y="282" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">cuối tuần giảm 60% mà không ai phàn nàn.</text>

            <rect x="16" y="310" width="728" height="76" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="334" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Đo chi phí theo đơn vị nghiệp vụ — nguyên tắc quan trọng nhất</text>
            <text x="34" y="356" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Không ai tối ưu được "hoá đơn $50k". Hãy quy về: <strong>cost per 1.000 request</strong>, <strong>cost per active user</strong>, <strong>cost per order</strong>.</text>
            <text x="34" y="374" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Khi có con số đó, team mới thấy tác động của việc thêm 1 query N+1 hoặc cache hit ratio giảm 5%. Đây là gắn tag resource theo team/service (cost allocation tags) ngay từ đầu.</text>
          </svg>
          <div class="diagram-cap">Hình 6.5 — Tối ưu chi phí: làm từ trái sang, đừng bắt đầu bằng việc đổi kiến trúc</div>
        </div>

        <h3>Những quyết định kiến trúc tác động chi phí nhiều nhất</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Quyết định</th><th>Tác động chi phí</th><th>Ghi chú</th></tr></thead>
            <tbody>
              <tr><td>Chatty API (N+1 qua mạng)</td><td><span class="kw-r">Rất lớn</span> — mỗi round-trip tốn latency + egress</td><td>Gộp bằng batch API hoặc GraphQL/field selection</td></tr>
              <tr><td>Không cache</td><td>Lớn — DB phải to hơn, thêm replica</td><td>Cache là tối ưu chi phí, không chỉ latency</td></tr>
              <tr><td>Log/metrics không sample</td><td>Lớn và tăng nhanh</td><td>Sample traces 1–10%, log chỉ giữ 7–30 ngày</td></tr>
              <tr><td>Multi-region active-active</td><td><span class="kw-r">2–3×</span> toàn bộ</td><td>Chỉ khi thật cần; warm standby rẻ hơn 60%</td></tr>
              <tr><td>Managed service thay vì tự vận hành</td><td>Thường <span class="kw-g">rẻ hơn</span> khi tính lương người vận hành</td><td>RDS đắt hơn EC2 + Postgres ~2×, nhưng rẻ hơn 0,5 FTE</td></tr>
              <tr><td>Chọn đúng storage tier</td><td>Rất lớn — S3 Standard vs Glacier = 10×</td><td>Lifecycle policy ngay từ ngày đầu</td></tr>
              <tr><td>Serverless cho traffic bursty</td><td><span class="kw-g">Rẻ hơn</span> khi tải thấp, <span class="kw-r">đắt hơn</span> khi tải cao liên tục</td><td>Lambda rẻ dưới ~10% utilization; trên đó container rẻ hơn</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Đừng tối ưu chi phí bằng cách giảm reliability</div>
            <p>Có một ranh giới rõ: cắt lãng phí là tốt, cắt redundancy là nguy hiểm. Bỏ read replica, giảm từ 3 AZ xuống 2, tắt backup cross-region — những thứ này tiết kiệm 20–30% nhưng biến một sự cố nhỏ thành thảm hoạ. Quy tắc: <strong>tối ưu chi phí trên phần thừa, không tối ưu trên phần bảo vệ</strong>. Và luôn tính chi phí của downtime: nếu 1 giờ downtime tốn $50k doanh thu + mất uy tín, thì tiết kiệm $2k/tháng bằng cách bỏ redundancy là quyết định tồi. Con số nên có trong đầu khi tranh luận: chi phí downtime thường gấp 10–100× chi phí hạ tầng tiết kiệm được.</p>
          </div>
        </div>
      `
    }
,

    {
      id: 'event-driven', num: '6.7', title: 'Event-driven architecture — khi nào và khi nào không',
      html: `
        <p>Event-driven là mô hình mặc định của kiến trúc hiện đại, và cũng là nguồn gốc của nhiều hệ thống không ai hiểu nổi. Khác biệt cốt lõi so với gọi hàm: <span class="kw">producer không biết ai sẽ xử lý, và không chờ kết quả</span>.</p>

        <h3>Event notification vs event-carried state vs event sourcing</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Kiểu</th><th>Nội dung message</th><th>Consumer làm gì</th><th>Coupling</th></tr></thead>
            <tbody>
              <tr><td><strong>Notification</strong></td><td>Chỉ id + loại sự kiện</td><td>Gọi lại API để lấy dữ liệu</td><td>Cao — consumer phụ thuộc API producer</td></tr>
              <tr><td><strong>Event-carried state</strong></td><td>Toàn bộ dữ liệu cần thiết</td><td>Dùng trực tiếp, không gọi lại</td><td><span class="kw-g">Thấp</span> — consumer tự chủ</td></tr>
              <tr><td><strong>Event sourcing</strong></td><td>Chuỗi event là nguồn sự thật</td><td>Replay để dựng trạng thái</td><td>Thấp, nhưng phức tạp: cần versioning, snapshot</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Notification event tạo ra cascade phụ thuộc ngầm</div>
            <p>Nếu mỗi event chỉ chứa <code>order_id</code> và mọi consumer gọi lại <code>GET /orders/{id}</code>, bạn đã tạo ra <strong>fan-out đọc</strong> vào service producer: 20 consumer × 1 event = 20 lần gọi API. Khi order service chậm, 20 consumer cùng chậm, và hàng đợi tích tụ. Đây là "event-driven" trên danh nghĩa nhưng thực chất là <span class="kw-r">synchronous coupling</span> che bằng Kafka. Ưu tiên <strong>event-carried state</strong>: đưa đủ dữ liệu vào event để consumer không phải gọi lại. Cái giá là event to hơn (vài KB) và phải xử lý schema evolution — nhưng rẻ hơn nhiều so với cascade.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="So sánh event notification gây fan-out đọc với event-carried state tự chủ và mô hình outbox">
            <defs>
              <marker id="m6f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m6fr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#ef4444">✗ NOTIFICATION EVENT — fan-out đọc trở lại</text>

            <rect x="16" y="36" width="110" height="46" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="71" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">order svc</text>
            <text x="71" y="72" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">publish {id}</text>

            <rect x="160" y="36" width="80" height="46" rx="7" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="200" y="64" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">Kafka</text>

            <rect x="274" y="20" width="96" height="30" rx="6" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="322" y="40" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#151515">notify</text>
            <rect x="274" y="56" width="96" height="30" rx="6" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="322" y="76" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#151515">search index</text>
            <rect x="274" y="92" width="96" height="30" rx="6" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="322" y="112" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#151515">analytics</text>

            <path d="M126,59 L158,59" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>
            <path d="M240,59 L258,59 L258,35 L272,35" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>
            <path d="M240,59 L258,59 L258,71 L272,71" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>
            <path d="M240,59 L258,59 L258,107 L272,107" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>

            <path d="M322,20 C322,4 100,4 76,34" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#m6fr)"/>
            <path d="M276,56 C260,44 120,20 80,34" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#m6fr)"/>
            <path d="M276,92 C250,70 130,30 84,36" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#m6fr)"/>
            <text x="150" y="140" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#ef4444">3 consumer × mỗi event = 3 lần GET /orders/{id} → cascade</text>

            <line x1="16" y1="160" x2="744" y2="160" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>

            <text x="16" y="186" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#10b981">✓ EVENT-CARRIED STATE — consumer tự chủ</text>

            <rect x="16" y="200" width="150" height="72" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="91" y="222" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">order svc</text>
            <text x="91" y="238" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">BEGIN</text>
            <text x="91" y="250" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">  insert order</text>
            <text x="91" y="262" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">  insert outbox</text>

            <rect x="190" y="200" width="110" height="72" rx="7" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="245" y="222" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">outbox</text>
            <text x="245" y="238" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">cùng transaction</text>
            <text x="245" y="252" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">với business data</text>

            <rect x="324" y="200" width="110" height="72" rx="7" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="379" y="222" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">relay worker</text>
            <text x="379" y="238" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">poll / CDC</text>
            <text x="379" y="252" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">publish + mark</text>

            <rect x="458" y="200" width="286" height="72" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="476" y="222" font-family="Plus Jakarta Sans, sans-serif" font-size="8" font-weight="800" fill="#151515">Event chứa đủ dữ liệu</text>
            <text x="476" y="238" font-family="JetBrains Mono, monospace" font-size="7" fill="#151515">{v:2, order_id, user_id, total, items[..], ts}</text>
            <text x="476" y="254" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#505a68">Consumer chỉ cần đọc, không gọi lại API.</text>
            <text x="476" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="7" fill="#10b981">Không cascade. Producer chết → consumer vẫn chạy.</text>

            <path d="M166,236 L188,236" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>
            <path d="M300,236 L322,236" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>
            <path d="M434,236 L456,236" stroke="#505a68" stroke-width="2" marker-end="url(#m6f)"/>

            <rect x="16" y="292" width="728" height="94" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Vì sao outbox chứ không phải "gọi Kafka sau khi commit"</text>
            <text x="34" y="338" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Nếu gọi Kafka <em>sau</em> khi COMMIT: nếu process crash giữa COMMIT và publish → event mất vĩnh viễn, consumer không bao giờ biết. Nếu gọi <em>trước</em> COMMIT: event có thể publish nhưng transaction rollback → consumer xử lý dữ liệu không tồn tại.</text>
            <text x="34" y="358" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Outbox giải quyết cả hai: business data và event intent nằm trong <strong>cùng một transaction</strong>. Chỉ có hai khả năng: cả hai cùng tồn tại, hoặc cả hai cùng không. Relay worker gửi với retry vô hạn (at-least-once), consumer phải idempotent.</text>
            <text x="34" y="378" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Đây là pattern bắt buộc cho mọi microservices publish event từ DB. Không có nó, bạn có eventual consistency "có thể mất event".</text>
          </svg>
          <div class="diagram-cap">Hình 6.6 — Event mang dữ liệu (không chỉ id), và outbox để publish an toàn</div>
        </div>

        <h3>Event sourcing — mạnh nhưng đắt</h3>
        <p>Thay vì lưu trạng thái hiện tại, lưu <em>chuỗi sự kiện</em> đã dẫn đến trạng thái đó. Trạng thái = replay toàn bộ event (hoặc snapshot + event sau đó).</p>
        <ul class="list-check">
          <li><strong>Lợi:</strong> audit log hoàn hảo (miễn phí), có thể "time travel" xem trạng thái tại bất kỳ thời điểm nào, có thể thêm projection mới bằng cách replay lại, và debug được "tại sao trạng thái này lại như vậy".</li>
          <li><strong>Giá:</strong> mọi thay đổi schema phải tương thích ngược vĩnh viễn (event cũ phải replay được mãi); query trạng thái phải qua projection (thêm độ trễ và hệ thống); snapshot + compaction phức tạp; và <span class="kw-r">GDPR xoá dữ liệu cực khó</span> vì bạn không được xoá lịch sử.</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Khi nào KHÔNG nên event-driven</div>
            <p>Bốn trường hợp: <strong>(1)</strong> Khi user cần kết quả ngay và đơn giản — một hàm gọi đồng bộ rõ ràng hơn nhiều so với "publish rồi chờ webhook". <strong>(2)</strong> Khi cần transaction ACID đơn giản — event-driven biến một transaction thành Saga phức tạp. <strong>(3)</strong> Khi team chưa có observability tốt — debug hệ event-driven không có distributed tracing là ác mộng: bạn không biết event đã đi đâu, bị consume chưa, hay rơi vào DLQ. <strong>(4)</strong> Khi volume thấp — một bảng <code>jobs</code> trong Postgres + worker polling đơn giản hơn Kafka 100 lần và đủ cho &lt; 1.000 event/s. Trong phỏng vấn, nêu được "khi nào không" luôn ăn điểm hơn liệt kê tính năng.</p>
          </div>
        </div>
      `
    },

    {
      id: 'deployment', num: '6.8', title: 'Deployment & release — đưa code lên mà không gây sự cố',
      html: `
        <p>Phần lớn sự cố production đến từ <span class="kw-r">thay đổi</span>, không phải từ tải. Vì vậy kỹ thuật release quan trọng ngang kiến trúc. Mục tiêu: <span class="kw">giảm blast radius của mỗi lần deploy và có thể quay lại trong 60 giây</span>.</p>

        <h3>Năm chiến lược release</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chiến lược</th><th>Cách làm</th><th>Rollback</th><th>Dùng khi</th></tr></thead>
            <tbody>
              <tr><td><strong>Recreate</strong></td><td>Tắt hết, bật mới</td><td>Chậm (deploy lại)</td><td>Dev/staging, hoặc app không chạy song song được</td></tr>
              <tr><td><strong>Rolling</strong></td><td>Thay dần từng pod</td><td>Vài phút</td><td>Mặc định cho stateless service</td></tr>
              <tr><td><strong>Blue-green</strong></td><td>Hai môi trường, switch traffic</td><td><span class="kw-g">Tức thời</span> (switch lại)</td><td>Cần rollback nhanh, DB migration tương thích</td></tr>
              <tr><td><strong>Canary</strong></td><td>1–5% traffic vào version mới, theo dõi, tăng dần</td><td>Rất nhanh</td><td>Thay đổi rủi ro, cần đo thực tế</td></tr>
              <tr><td><strong>Feature flag</strong></td><td>Code lên nhưng tắt, bật dần theo user/segment</td><td><span class="kw-g">Tắt cờ, không cần deploy</span></td><td>Tính năng mới, A/B test, kill switch</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="So sánh rolling update, canary và feature flag với cách kiểm soát blast radius">
            <defs>
              <marker id="m6g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">ROLLING — 5% rủi ro trong 100% thời gian</text>
            <rect x="16" y="34" width="728" height="34" rx="7" fill="#eef2f6" stroke="#151515" stroke-width="2"/>
            <rect x="16" y="34" width="50" height="34" rx="7" fill="#fb923c" stroke="#151515" stroke-width="2"/>
            <rect x="72" y="34" width="50" height="34" rx="7" fill="#fb923c" stroke="#151515" stroke-width="2"/>
            <rect x="128" y="34" width="50" height="34" rx="7" fill="#fb923c" stroke="#151515" stroke-width="2"/>
            <text x="380" y="56" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">mỗi pod mới nhận traffic ngay khi ready — lỗi ảnh hưởng ngay 1/N user</text>

            <text x="16" y="102" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">CANARY — 5% rủi ro lúc đầu, tăng dần khi có bằng chứng</text>
            <rect x="16" y="114" width="728" height="34" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <rect x="16" y="114" width="36" height="34" rx="7" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="34" y="136" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">5%</text>
            <text x="380" y="136" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">so sánh error rate / p99 của canary vs baseline — tự động rollback nếu lệch</text>

            <text x="16" y="182" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">FEATURE FLAG — deploy và release tách rời</text>
            <rect x="16" y="194" width="230" height="46" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="131" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" font-weight="800" fill="#151515">deploy (code lên production)</text>
            <text x="131" y="230" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">flag = OFF, 0 user thấy</text>

            <rect x="270" y="194" width="230" height="46" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="385" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" font-weight="800" fill="#151515">release (bật theo % user)</text>
            <text x="385" y="230" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">1% → 10% → 50% → 100%</text>

            <rect x="524" y="194" width="220" height="46" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="634" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" font-weight="800" fill="#151515">kill switch</text>
            <text x="634" y="230" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="8" fill="#505a68">tắt trong 5 giây, không cần deploy</text>

            <path d="M246,217 L268,217" stroke="#505a68" stroke-width="2" marker-end="url(#m6g)"/>
            <path d="M500,217 L522,217" stroke="#505a68" stroke-width="2" marker-end="url(#m6g)"/>

            <rect x="16" y="262" width="360" height="124" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="34" y="286" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Expand–Contract cho migration</text>
            <text x="34" y="308" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Đổi tên cột <code>name</code> → <code>full_name</code>:</text>
            <text x="34" y="324" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">1. ADD cột mới (nullable)</text>
            <text x="34" y="338" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">2. deploy code ghi CẢ HAI</text>
            <text x="34" y="352" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">3. backfill dữ liệu cũ (batch)</text>
            <text x="34" y="366" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">4. deploy code đọc cột mới</text>
            <text x="34" y="380" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">5. DROP cột cũ (sau 2 tuần)</text>

            <rect x="392" y="262" width="352" height="124" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="410" y="286" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Vì sao không thể "deploy + migrate cùng lúc"</text>
            <text x="410" y="308" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Trong rolling deploy, version cũ và mới chạy</text>
            <text x="410" y="324" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">CÙNG LÚC. Nếu migration xoá cột, version cũ</text>
            <text x="410" y="340" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">sẽ crash ngay khi query → sập giữa deploy.</text>
            <text x="410" y="362" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Quy tắc: mọi migration phải tương thích với</text>
            <text x="410" y="378" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">CẢ version trước và sau. Đó là expand-contract.</text>
          </svg>
          <div class="diagram-cap">Hình 6.7 — Giảm blast radius: canary và feature flag cho code, expand-contract cho schema</div>
        </div>

        <h3>Ba thứ phải tách rời</h3>
        <ul class="list-bullet">
          <li><strong>Deploy ≠ Release.</strong> Deploy là đưa code lên server; release là cho user dùng. Tách bằng feature flag → deploy 20 lần/ngày an toàn, release khi sẵn sàng.</li>
          <li><strong>Schema migration ≠ code deploy.</strong> Như hình trên: expand-contract để cả hai version cùng chạy được.</li>
          <li><strong>Config ≠ build.</strong> Cùng một image chạy ở dev/staging/prod, khác nhau chỉ ở config (env var, secret). Nếu build riêng cho prod, bạn không test đúng thứ sẽ chạy.</li>
        </ul>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">YAML</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com"># Argo Rollouts: canary tự động với phân tích metric</span>
<span class="c-key">apiVersion</span>: argoproj.io/v1alpha1
<span class="c-key">kind</span>: Rollout
<span class="c-key">metadata</span>: { <span class="c-key">name</span>: order-api }
<span class="c-key">spec</span>:
  <span class="c-key">replicas</span>: <span class="c-num">10</span>
  <span class="c-key">strategy</span>:
    <span class="c-key">canary</span>:
      <span class="c-key">steps</span>:
        - <span class="c-key">setWeight</span>: <span class="c-num">5</span>          <span class="c-com"># 5% traffic</span>
        - <span class="c-key">pause</span>: { <span class="c-key">duration</span>: <span class="c-num">2m</span> }  <span class="c-com"># đo metric 2 phút</span>
        - <span class="c-key">analysis</span>:                <span class="c-com"># tự rollback nếu fail</span>
            <span class="c-key">templates</span>: [{ <span class="c-key">templateName</span>: success-rate }]
        - <span class="c-key">setWeight</span>: <span class="c-num">25</span>
        - <span class="c-key">pause</span>: { <span class="c-key">duration</span>: <span class="c-num">5m</span> }
        - <span class="c-key">setWeight</span>: <span class="c-num">50</span>
        - <span class="c-key">pause</span>: {}
        - <span class="c-key">setWeight</span>: <span class="c-num">100</span>
<span class="c-com">---</span>
<span class="c-com"># AnalysisTemplate: điều kiện để tiếp tục</span>
<span class="c-key">kind</span>: AnalysisTemplate
<span class="c-key">spec</span>:
  <span class="c-key">metrics</span>:
    - <span class="c-key">name</span>: success-rate
      <span class="c-key">interval</span>: <span class="c-num">30s</span>
      <span class="c-key">failureLimit</span>: <span class="c-num">2</span>              <span class="c-com"># 2 lần fail → abort</span>
      <span class="c-key">successCondition</span>: <span class="c-str">"result[0] >= 0.995"</span>
      <span class="c-key">provider</span>:
        <span class="c-key">prometheus</span>:
          <span class="c-key">query</span>: |
            sum(rate(http_requests_total{job="canary",status!~"5.."}[2m]))
            / sum(rate(http_requests_total{job="canary"}[2m]))</code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Canary không có baseline là canary vô dụng</div>
            <p>Nhiều team bật canary 5% rồi "chờ xem có lỗi không". Nhưng nếu bạn không so sánh với baseline (95% còn lại) một cách tự động, bạn sẽ không phát hiện: error rate tăng từ 0,1% lên 0,4% (vẫn "trông ổn" nhưng gấp 4 lần), p99 tăng 80ms, hay CPU cao hơn 30%. Canary đúng phải có <strong>phân tích so sánh</strong>: error rate canary vs stable, latency p99 canary vs stable, và ngưỡng cụ thể. Và phải <strong>tự động abort</strong> — nếu cần người quyết định, sự cố đã lan ra trước khi ai kịp xem dashboard. Đây là khác biệt giữa "có canary" và "canary hoạt động".</p>
          </div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Ba chỉ số của một quy trình release tốt</div>
            <p><strong>Deployment frequency:</strong> nhiều lần/ngày (không phải tháng). <strong>Lead time for changes:</strong> từ commit đến production &lt; 1 giờ. <strong>Change failure rate:</strong> &lt; 15% deploy gây sự cố, và <strong>MTTR &lt; 1 giờ</strong>. Bốn chỉ số này (từ DORA) tương quan trực tiếp với hiệu quả tổ chức — và nghịch lý là: deploy <em>thường xuyên hơn</em> với batch nhỏ lại <em>an toàn hơn</em> deploy lớn mỗi tháng, vì mỗi thay đổi nhỏ dễ khoanh vùng và rollback. Trong phỏng vấn, nếu được hỏi về vận hành, nêu DORA metrics thể hiện bạn hiểu cả khía cạnh tổ chức.</p>
          </div>
        </div>
      `
    }
  ],

  quiz: [
    {
      q: 'Team bạn có 8 kỹ sư, đang chạy một monolith 200k dòng code, deploy mất 40 phút và hay conflict. Sếp muốn chuyển sang microservices. Bạn tư vấn gì?',
      a: 'Trả lời thẳng: <strong>không nên</strong>, ít nhất chưa phải bây giờ. Lý do cụ thể: (1) với 8 người, vấn đề không phải "team không tự chủ" mà là "deploy chậm" — nguyên nhân có thể là test suite chậm, build không cache, hoặc thiếu CI/CD, không phải kiến trúc; (2) microservices với 8 người nghĩa là mỗi người phải on-call cho 2–3 service, viết runbook, quản lý 12 pipeline — năng lực kỹ thuật bị chia mỏng thay vì tập trung vào sản phẩm; (3) chi phí hạ tầng tăng 2–4× và bạn sẽ cần một platform team mà bạn không có. Đề xuất thay thế theo thứ tự: <strong>(a)</strong> sửa deploy: build cache, test song song, deploy 5 phút — thường giải quyết 80% nỗi đau; <strong>(b)</strong> modular hoá bên trong monolith — tách module với boundary rõ, mỗi module có schema riêng, cấm JOIN chéo, dùng event nội bộ; <strong>(c)</strong> khi có module thật sự cần scale khác biệt hoặc deploy tần suất khác biệt, tách <em>module đó</em> thành service đầu tiên (thường là search, notification, hoặc media processing — những cái ít phụ thuộc transaction). Câu chốt: "Microservices giải quyết vấn đề tổ chức ở quy mô 50+ người. Với 8 người, modular monolith cho bạn 80% lợi ích với 20% chi phí. Tôi sẽ tách 1–2 service khi có lý do cụ thể, không tách 12 service vì lý do ý thức hệ."'
    },
    {
      q: 'Sau mỗi lần deploy, bạn thấy khoảng 200 request bị 502 trong 5 giây. Hệ thống chạy Kubernetes. Chẩn đoán và sửa.',
      a: 'Đây là lỗi kinh điển của graceful shutdown. Nguyên nhân: khi pod bị xoá (rolling update), K8s gửi SIGTERM <em>và</em> đánh dấu pod "Terminating" gần như đồng thời. Pod bị rút khỏi endpoints của Service, nhưng: (a) kube-proxy/iptables cần thời gian cập nhật trên mọi node; (b) load balancer bên ngoài (ALB/NLB) cần 1–5s để health check và ngừng gửi traffic; (c) app nhận SIGTERM và tắt server ngay lập tức, đóng socket → connection đang mở bị reset. Kết quả: trong 2–5s, traffic vẫn được đẩy tới pod đã tắt → 502. Sửa theo thứ tự: <strong>(1)</strong> Thêm <code>preStop: exec: sleep 5</code> — pod sống thêm 5s sau khi bị đánh dấu Terminating, đủ để LB cập nhật. <strong>(2)</strong> App phải handle SIGTERM: ngừng nhận request mới, đợi request đang chạy xong (graceful shutdown), rồi mới exit. Với Node/Go/Java đều có API cho việc này. <strong>(3)</strong> Đặt <code>terminationGracePeriodSeconds: 30</code> lớn hơn tổng (preStop 5s + thời gian drain). <strong>(4)</strong> Readiness probe phải fail ngay khi nhận SIGTERM để rút khỏi Service sớm nhất. Đo lại: sau khi sửa, số 502 mỗi deploy phải về 0. Nếu còn, kiểm tra connection keep-alive của client — client có thể giữ connection tới pod đã chết (cần retry idempotent ở client).'
    },
    {
      q: 'Bạn đặt SLO 99,9% cho API checkout. Tháng này đã tiêu 35/43 phút budget. Bạn làm gì và tại sao không chỉ "cố gắng hơn"?',
      a: 'Con số 35/43 phút = 81% budget đã dùng, còn 8 phút cho 20 ngày còn lại. Hành động cụ thể: <strong>(1) Đóng băng feature rủi ro</strong> (thay đổi schema, thay đổi dependency, migration lớn) — không đóng băng toàn bộ, nhưng mọi thay đổi phải qua review reliability. Đây chính là mục đích của error budget: nó biến "nên chậm lại hay không" từ tranh luận thành quy tắc. <strong>(2) Tìm nguyên nhân tiêu budget</strong> — 35 phút đó đến từ đâu? Nếu là 1 sự cố 30 phút, đó là vấn đề khác với 30 sự cố 1 phút. Sự cố lớn → cần action item cụ thể (thêm redundancy, sửa quy trình deploy). Nhiều sự cố nhỏ → vấn đề chất lượng phát hành hoặc dependency không ổn định. <strong>(3) Ưu tiên theo đòn bẩy</strong>: nếu nguyên nhân là deploy, thêm canary + auto-rollback. Nếu là DB, thêm cache/replica. Nếu là dependent service, thêm circuit breaker. <strong>(4) Báo cáo minh bạch</strong> với stakeholder — không phải để xin lỗi mà để cùng quyết định trade-off. Về câu "sao không cố gắng hơn": vì reliability không phải nỗ lực, mà là <em>đầu tư có địa chỉ</em>. "Cố gắng hơn" dẫn đến làm thêm giờ, mệt mỏi, và thường làm tăng sai sót. Error budget tồn tại để bạn nói "không" với feature một cách có căn cứ, và nói "có" với công việc reliability mà không phải biện minh cảm tính.'
    },
    {
      q: 'Bạn thiết kế hệ thống multi-region. Sếp hỏi "bao lâu thì failover xong?". Bạn trả lời thế nào và cần đo gì?',
      a: 'Trả lời trung thực: <strong>phụ thuộc vào mô hình, và số trên giấy khác số thật</strong>. Cụ thể: (1) <strong>Active-passive với warm standby</strong>: 2–5 phút trên lý thuyết, nhưng chia nhỏ: DNS TTL (60s nếu đặt thấp) + health check phát hiện (10–30s) + quyết định (con người: 1–5 phút, hoặc tự động: 0) + promote DB replica (10–60s) + app warm up (JIT, connection pool, cache: 30–120s). Tổng thực tế 3–8 phút. (2) <strong>Active-active partition theo user</strong>: failover gần như tức thời vì region kia đã chạy, nhưng vẫn cần đổi routing (30–60s) và chịu latency cao hơn. Cần đo: <strong>RTO thật</strong> bằng cách chạy game day mỗi quý, đo từ lúc inject failure đến lúc SLI trở lại bình thường — không phải đến lúc "config đã đổi". Cần đo thêm: <strong>RPO thật</strong> = replication lag tại thời điểm failover (dùng semi-sync để biết con số); <strong>capacity region phụ</strong> — nếu chạy 10% scale, mất bao lâu để scale lên 100% (thường 5–15 phút, có thể lâu hơn RTO!); và <strong>failback</strong> — quay lại mất bao lâu, có mất dữ liệu không. Điểm quan trọng nhất để nói: "Tôi không trả lời bằng một con số trên giấy. Tôi trả lời bằng con số đo được từ lần diễn tập gần nhất, kèm điều kiện giả định (traffic level, giờ trong ngày, region nào chết)." Điều này thể hiện bạn đã vận hành thật.'
    },
    {
      q: 'Hoá đơn cloud của bạn tăng 40% trong 3 tháng dù traffic chỉ tăng 10%. Bạn điều tra theo thứ tự nào?',
      a: 'Điều tra theo thứ tự từ nguyên nhân phổ biến nhất: <strong>(1) Egress và cross-AZ</strong> — traffic tăng 10% nhưng nếu kiến trúc thay đổi (thêm service, thêm replica, thêm chatty call), cross-AZ có thể tăng 100%+. Kiểm tra data transfer by service/AZ. Đây là nguyên nhân số 1 khi chi phí tăng nhanh hơn traffic. <strong>(2) Observability</strong> — log/metrics volume thường tăng mà không ai để ý: thêm debug log, thêm label high-cardinality, retention không đổi. Kiểm tra chi phí theo dịch vụ log/metrics. <strong>(3) Storage tích luỹ</strong> — không ai xoá, mỗi tháng tăng thêm. Kiểm tra tổng dung lượng theo tháng, tìm volume/snapshot mồ côi. <strong>(4) Idle resources</strong> — autoscaling cấu hình sai (min replicas tăng), instance không ai tắt, môi trường dev. <strong>(5) Managed service tier</strong> — ai đó nâng instance class hoặc bật tính năng đắt (multi-AZ, provisioned IOPS). <strong>(6) Thay đổi kiến trúc có chủ ý</strong> — thêm region, thêm replica, migration. Hành động dài hạn: <strong>cost allocation tags</strong> bắt buộc cho mọi resource (team, service, env), dashboard cost per service, alert khi chi phí một service tăng &gt; 20% so với tuần trước, và định kỳ review "cost per 1.000 request". Con số cần nêu: với hầu hết hệ thống, 20–30% hoá đơn là lãng phí có thể cắt trong 2 tuần mà không giảm reliability.'
    },
    {
      q: 'Bạn có 3 service nối tiếp, mỗi cái SLO 99,9%. SLO tổng là bao nhiêu và bạn làm gì để cải thiện?',
      a: 'SLO tổng = 0,999³ = <strong>99,7%</strong> (giảm từ 43 phút xuống <strong>2 giờ 10 phút</strong> downtime/tháng). Đây là hiệu ứng "chuỗi phụ thuộc" — nó giải thích tại sao thêm service luôn làm giảm reliability nếu không thêm redundancy. Bốn cách cải thiện, theo thứ tự hiệu quả: <strong>(1) Giảm số hop đồng bộ</strong> — nếu 3 service nối tiếp nghĩa là mỗi request đi qua 3 lần, hãy xem có service nào có thể gộp lại hoặc chuyển sang async. Async không làm tăng SLO của luồng chính (bạn không chờ), nhưng làm giảm blast radius. <strong>(2) Đặt SLO khác nhau theo tầng</strong> — service nội bộ có thể có SLO 99,5% nếu nó có fallback; không cần mọi service đều 99,9%. <strong>(3) Loại bỏ phụ thuộc cứng</strong> — nếu service 3 chết mà service 1 vẫn trả được kết quả (degraded), SLO tổng không bị ảnh hưởng. Đây là graceful degradation, hiệu quả hơn mọi nỗ lực tăng SLO từng service. <strong>(4) Nếu phải giữ chuỗi, tăng SLO từng service</strong> — nhưng chi phí tăng phi tuyến: từ 99,9% lên 99,95% tốn gấp 3–5× công sức. Điểm cần nói trong phỏng vấn: "Tôi sẽ không cố đưa cả 3 service lên 99,99% — tôi sẽ tìm cách để request không phải chờ cả 3, và định nghĩa SLO theo hành trình người dùng thay vì theo từng service."'
    }
  ]
};

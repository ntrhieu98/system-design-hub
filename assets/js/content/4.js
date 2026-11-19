/* ============================================================
   Module 4 — Hệ thống phân tán
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[4] = {
  title: 'Module 4 — Hệ thống phân tán',
  lead: 'Khi hệ thống có hơn một máy, mọi giả định đơn giản đều sụp đổ: mạng có thể đứt, đồng hồ lệch nhau, một tiến trình có thể "chết" mà thực ra vẫn đang chạy và ghi dữ liệu. Module này trang bị những mô hình đúng để suy luận — <span class="kw">consensus</span>, <span class="kw">fencing</span>, <span class="kw-y">idempotency</span> — và những pattern thực dụng để sống chung với sự không chắc chắn thay vì cố loại bỏ nó.',

  keywords: [
    { term: 'Failure model', def: 'Cách bạn giả định hệ thống hỏng. Crash-stop (chết hẳn, dễ), crash-recovery (chết rồi sống lại, mất RAM), omission (mất message), Byzantine (nói dối/bị compromise). Mọi thuật toán đều giả định một model cụ thể — dùng sai model là vô nghĩa.' },
    { term: 'Fault vs Failure', def: 'Fault: một thành phần hỏng (1 ổ đĩa chết). Failure: hệ thống ngừng phục vụ đúng. Hệ thống tốt là hệ thống chịu được fault mà không thành failure — redundancy + detection + recovery.' },
    { term: 'FLP impossibility', def: 'Trong hệ bất đồng bộ hoàn toàn, không có thuật toán đồng thuận nào vừa an toàn vừa đảm bảo kết thúc khi có dù chỉ 1 tiến trình chết. Thực tế lách bằng timeout (partial synchrony) — đánh đổi liveness lấy safety.' },
    { term: 'CAP theorem', def: 'Khi có network partition, bạn chỉ chọn được Consistency hoặc Availability. C (linearizability) không phải "ACID C" (nhất quán trong 1 DB). P không phải "chọn được" — mạng sẽ partition, bạn chỉ chọn phản ứng.' },
    { term: 'PACELC', def: 'Mở rộng CAP: nếu Partition → chọn A hoặc C (PAC); Else (bình thường) → chọn Latency hoặc Consistency (ELC). Phần ELC mới là thứ ảnh hưởng 99,9% thời gian hệ thống chạy.' },
    { term: 'Linearizability', def: 'Mọi thao tác trông như xảy ra tức thời tại một điểm giữa lúc gọi và lúc trả về, và mọi client thấy cùng một thứ tự. Mạnh nhất, đắt nhất — cần consensus hoặc single leader.' },
    { term: 'Raft', def: 'Thuật toán consensus dễ hiểu: bầu leader bằng term + majority vote, replicate log, commit khi đa số đã ghi. Leader lease + pre-vote tránh split brain. etcd, Consul, CockroachDB, TiKV dùng Raft.' },
    { term: 'Term & log index', def: 'Term: số nhiệm kỳ tăng dần, dùng để từ chối message từ leader cũ. Log index: vị trí entry trong log. Cặp (term, index) xác định duy nhất một entry — nền tảng của mọi so sánh "mới hơn/cũ hơn".' },
    { term: 'Split brain', def: 'Hai node cùng nghĩ mình là leader và cùng nhận ghi. Dữ liệu phân kỳ không merge được. Chống bằng majority quorum + fencing token, không bao giờ bằng "ping nhanh hơn thì thắng".' },
    { term: 'Fencing token', def: 'Số epoch tăng dần cấp cho mỗi leader. Storage từ chối mọi write có epoch nhỏ hơn epoch lớn nhất đã thấy. Leader cũ dù còn sống cũng không ghi được — đây là cách duy nhất thật sự an toàn.' },
    { term: '2PC (two-phase commit)', def: 'Prepare → tất cả đồng ý → Commit. Đảm bảo atomic nhưng blocking: nếu coordinator chết sau prepare, participant giữ lock vô hạn. Cần coordinator HA + timeout + recovery log.' },
    { term: 'Saga', def: 'Chuỗi local transaction, mỗi bước có compensating action để hoàn tác. Không atomic, chỉ eventual. Dùng cho workflow dài (đặt vé, thanh toán) nơi 2PC không khả thi vì lock quá lâu.' },
    { term: 'Idempotency key', def: 'Client sinh UUID cho mỗi ý định (không phải mỗi lần gửi). Server lưu key + kết quả; gặp lại key thì trả kết quả cũ thay vì thực thi lần nữa. Bắt buộc cho mọi API ghi tiền.' },
    { term: 'Circuit breaker', def: 'Đếm lỗi của dependency; vượt ngưỡng thì mở mạch, fail fast thay vì chờ timeout. Nửa mở để thử lại. Ngăn lỗi lan truyền (cascading failure) và giải phóng thread/connection.' },
    { term: 'Bulkhead', def: 'Cô lập tài nguyên theo nhóm: mỗi dependency có thread pool/connection pool riêng. Một dependency chậm không ăn hết pool của toàn service. Đặt tên theo khoang tàu — thủng một khoang không chìm cả tàu.' },
    { term: 'Observability', def: 'Ba trụ: metrics (số), logs (sự kiện rời rạc), traces (đường đi của 1 request qua N service). Thiếu traces là mù khi debug hệ phân tán — không thể suy luận từ log rời rạc.' }
  ],

  sections: [
    {
      id: 'fallacies', num: '4.1', title: 'Tám ngộ nhận chết người & mô hình lỗi',
      html: `
        <p>Peter Deutsch đúc kết tám ngộ nhận mà mọi kỹ sư mới làm hệ phân tán đều mắc. Chúng không sai vì lý thuyết — chúng sai vì <span class="kw">đúng 99% thời gian</span>, và 1% còn lại tạo ra sự cố production.</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Ngộ nhận</th><th>Thực tế</th><th>Hệ quả nếu tin</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Mạng luôn tin cậy</td><td>Packet mất, trễ, nhân đôi, đảo thứ tự</td><td>Không có retry/idempotency → mất hoặc trùng dữ liệu</td></tr>
              <tr><td>2</td><td>Latency bằng 0</td><td>Cross-AZ ~0,5ms, cross-region 50–200ms</td><td>Chatty API: 50 call × 5ms = 250ms chỉ để nói chuyện nội bộ</td></tr>
              <tr><td>3</td><td>Băng thông vô hạn</td><td>1 Gbps = 125 MB/s; cross-AZ tính tiền</td><td>Broadcast lớn, fan-out không giới hạn, hoá đơn egress</td></tr>
              <tr><td>4</td><td>Mạng an toàn</td><td>Zero trust: mọi traffic phải xác thực</td><td>Bị lateral movement sau khi một pod bị chiếm</td></tr>
              <tr><td>5</td><td>Topology không đổi</td><td>Autoscaling, pod restart, IP đổi liên tục</td><td>Hard-code IP; DNS cache TTL dài gây lỗi sau deploy</td></tr>
              <tr><td>6</td><td>Chỉ có một admin</td><td>Nhiều team, nhiều tool cùng đổi cấu hình</td><td>Cấu hình bị ghi đè, không ai biết ai đổi gì</td></tr>
              <tr><td>7</td><td>Chi phí vận chuyển bằng 0</td><td>Serialization, egress, cross-AZ đều tốn</td><td>Chọn JSON cho 1M message/s thay vì Protobuf</td></tr>
              <tr><td>8</td><td>Mạng đồng nhất</td><td>MTU, IPv6, proxy, TLS termination khác nhau</td><td>Bug chỉ xuất hiện ở một AZ hoặc sau một load balancer</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Đồng hồ nói dối — ví dụ cụ thể nhất</h3>
        <p>Hai node NTP sync. Node A có đồng hồ nhanh 30ms. Client ghi <code>x=1</code> vào A lúc <code>10:00:00.000</code> (giờ thật <code>09:59:59.970</code>), rồi ghi <code>x=2</code> vào B lúc <code>10:00:00.010</code> (giờ thật <code>10:00:00.010</code>). Dùng LWW theo timestamp: bản ghi <code>x=1</code> thắng dù nó xảy ra <em>trước</em>. Không có lỗi nào được báo — chỉ là dữ liệu sai.</p>
        <ul class="list-bullet">
          <li><strong>Đồng hồ vật lý</strong> (wall clock) không đơn điệu: NTP chỉnh lùi được, VM live-migration làm nhảy, leap second. Không bao giờ dùng để sắp thứ tự event.</li>
          <li><strong>Đồng hồ đơn điệu</strong> (<code>performance.now</code>, <code>clock_gettime(CLOCK_MONOTONIC)</code>) chỉ dùng đo khoảng thời gian, không so giữa hai máy.</li>
          <li><strong>Lamport clock</strong> cho thứ tự nhân quả (nếu A → B thì L(A) &lt; L(B)) nhưng không so được hai event độc lập.</li>
          <li><strong>Vector clock</strong> phát hiện được xung đột thật nhưng kích thước tăng theo số node — không scale cho 1000 node.</li>
          <li><strong>HLC (Hybrid Logical Clock)</strong> là thực dụng nhất: kết hợp vật lý + logic để giữ thứ tự nhân quả, vẫn gần giờ thật để debug. CockroachDB, MongoDB dùng.</li>
        </ul>

        <div class="diagram">
          <svg viewBox="0 0 760 330" role="img" aria-label="So sánh ba mức độ mô hình lỗi từ crash-stop đến Byzantine và chi phí tương ứng">
            <defs>
              <marker id="m4a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="20" y="26" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Mô hình lỗi — càng giả định ít, càng đắt</text>

            <rect x="20" y="44" width="232" height="112" rx="10" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="136" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Crash-stop</text>
            <text x="136" y="92" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Node chết và im lặng mãi mãi</text>
            <text x="136" y="112" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Dễ nhất để suy luận</text>
            <text x="136" y="136" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#10b981">Raft, Paxos, 2PC</text>

            <rect x="264" y="44" width="232" height="112" rx="10" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="380" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Crash-recovery</text>
            <text x="380" y="92" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Chết rồi sống lại, mất RAM,</text>
            <text x="380" y="112" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">giữ được disk</text>
            <text x="380" y="136" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#b45309">Cần WAL + replay</text>

            <rect x="508" y="44" width="232" height="112" rx="10" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="624" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Byzantine</text>
            <text x="624" y="92" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Node nói dối, gửi message sai,</text>
            <text x="624" y="112" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">bị compromise</text>
            <text x="624" y="136" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#ef4444">Cần 3f+1 node</text>

            <path d="M252,100 L262,100" stroke="#505a68" stroke-width="2" marker-end="url(#m4a)"/>
            <path d="M496,100 L506,100" stroke="#505a68" stroke-width="2" marker-end="url(#m4a)"/>

            <rect x="20" y="180" width="720" height="60" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="38" y="204" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Trong phỏng vấn, hãy nói rõ model bạn giả định</text>
            <text x="38" y="224" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">"Tôi giả định crash-recovery và mạng có thể partition, không giả định Byzantine vì các node nằm trong VPC do ta kiểm soát." — một câu như vậy thể hiện chiều sâu hơn 10 phút vẽ diagram.</text>

            <rect x="20" y="252" width="352" height="60" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="38" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Fault ≠ Failure</text>
            <text x="38" y="296" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">1 ổ đĩa chết = fault. Hệ thống vẫn phục vụ = chưa failure.</text>

            <rect x="388" y="252" width="352" height="60" rx="9" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="406" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Cascading failure</text>
            <text x="406" y="296" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">Một service chậm → thread pool đầy → cả hệ thống sập.</text>
          </svg>
          <div class="diagram-cap">Hình 4.1 — Chọn mô hình lỗi quyết định thuật toán và chi phí hạ tầng</div>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Timeout là công cụ, không phải giải pháp</div>
            <p>Timeout là cách duy nhất để một hệ bất đồng bộ đưa ra quyết định, nhưng nó <strong>luôn đoán sai một phần</strong>: timeout quá ngắn → coi node sống là chết, gây failover không cần thiết; quá dài → chờ đợi trong vô vọng. Quy tắc thực dụng: đặt timeout theo <code>p99.9</code> của dependency, không theo trung bình; dùng <strong>exponential backoff + jitter</strong> khi retry (không có jitter, 10.000 client retry cùng lúc tạo ra <span class="kw-r">thundering herd</span> đánh sập dependency vừa hồi phục); và giới hạn số lần retry (3 là đủ; retry vô hạn biến lỗi tạm thời thành lỗi vĩnh viễn).</p>
          </div>
        </div>
      `
    },

    {
      id: 'cap', num: '4.2', title: 'CAP, PACELC và sự thật bị hiểu sai nhiều nhất',
      html: `
        <p>CAP được trích dẫn nhiều nhất và hiểu sai nhiều nhất trong toàn bộ ngành. Định lý nói: khi xảy ra <span class="kw">network partition</span>, một hệ phân tán <strong>không thể</strong> đồng thời đảm bảo Consistency (linearizability) và Availability. Không có partition thì không phải chọn.</p>

        <h3>Ba chữ cái — định nghĩa chính xác</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chữ</th><th>Nghĩa chính xác</th><th>Hiểu sai phổ biến</th></tr></thead>
            <tbody>
              <tr><td><strong>C</strong></td><td><em>Linearizability</em>: mọi read thấy write gần nhất đã hoàn thành, toàn cục, theo thời gian thực</td><td>"ACID C" (ràng buộc dữ liệu trong 1 DB) — khác hoàn toàn</td></tr>
              <tr><td><strong>A</strong></td><td>Mọi request tới node còn sống đều nhận được response <em>không lỗi</em> (không cam kết dữ liệu mới nhất)</td><td>"Hệ thống luôn chạy" — không, chỉ là "không trả lỗi"</td></tr>
              <tr><td><strong>P</strong></td><td>Mạng chia cắt khiến các node không nói chuyện được</td><td>"Chọn P hay không" — P xảy ra ngoài ý muốn, không phải lựa chọn</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">"Chọn 2 trong 3" là câu trả lời của người chưa hiểu CAP</div>
            <p>P không phải thứ bạn chọn — mạng sẽ partition dù bạn muốn hay không. Vì vậy lựa chọn thật sự chỉ là: <strong>khi có partition, bạn hy sinh C hay A?</strong> Hệ thống CP (HDFS, etcd, Spanner) từ chối phục vụ khi mất quorum. Hệ thống AP (Cassandra, DynamoDB, Riak) vẫn phục vụ nhưng có thể trả dữ liệu cũ. Và trong 99,9% thời gian không có partition, câu hỏi CAP <em>không áp dụng gì cả</em> — đó là lúc PACELC phát huy tác dụng.</p>
          </div>
        </div>

        <h3>PACELC — mô hình hữu ích hơn nhiều</h3>
        <p><strong>P</strong>artition → <strong>A</strong> hoặc <strong>C</strong>; <strong>E</strong>lse → <strong>L</strong> hoặc <strong>C</strong>. Nhánh ELC mô tả hành vi hằng ngày, khi mọi thứ bình thường: bạn vẫn phải chọn giữa <em>latency</em> và <em>consistency</em>.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 380" role="img" aria-label="Cây quyết định PACELC phân loại các cơ sở dữ liệu theo hành vi khi có partition và khi bình thường">
            <defs>
              <marker id="m4b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="286" y="14" width="188" height="46" rx="9" fill="#151515" stroke="#151515" stroke-width="2"/>
            <text x="380" y="43" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#f4d77c">Có partition?</text>

            <path d="M330,60 C300,80 220,80 190,104" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4b)"/>
            <path d="M430,60 C460,80 540,80 570,104" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4b)"/>
            <text x="228" y="86" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="#10b981">CÓ</text>
            <text x="530" y="86" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="#ef4444">KHÔNG</text>

            <rect x="60" y="108" width="260" height="46" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="190" y="130" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Hy sinh Availability → CP</text>
            <text x="190" y="146" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">từ chối phục vụ khi mất quorum</text>

            <rect x="440" y="108" width="260" height="46" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="570" y="130" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Hy sinh Consistency → AP</text>
            <text x="570" y="146" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">vẫn trả lời, có thể dữ liệu cũ</text>

            <path d="M150,154 C120,176 100,180 90,204" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4b)"/>
            <path d="M230,154 C260,176 280,180 290,204" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4b)"/>
            <path d="M530,154 C500,176 480,180 470,204" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4b)"/>
            <path d="M610,154 C640,176 660,180 670,204" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4b)"/>

            <rect x="16" y="208" width="148" height="72" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="90" y="232" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">PC / EC</text>
            <text x="90" y="250" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">etcd, ZooKeeper</text>
            <text x="90" y="266" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Spanner, Cockroach</text>

            <rect x="180" y="208" width="148" height="72" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="254" y="232" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">PC / EL</text>
            <text x="254" y="250" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">MongoDB (w:1)</text>
            <text x="254" y="266" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Postgres async replica</text>

            <rect x="360" y="208" width="148" height="72" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="434" y="232" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">PA / EL</text>
            <text x="434" y="250" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Cassandra, Riak</text>
            <text x="434" y="266" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">DynamoDB (default)</text>

            <rect x="524" y="208" width="220" height="72" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="634" y="232" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">PA / EC</text>
            <text x="634" y="250" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Hiếm: vẫn phục vụ nhưng</text>
            <text x="634" y="266" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">đọc luôn từ leader (Spanner read-only)</text>

            <rect x="16" y="300" width="728" height="66" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="324" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Điểm mấu chốt trong phỏng vấn</text>
            <text x="34" y="344" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Đừng hỏi "chọn C hay A". Hãy hỏi "với entity này, khi mất kết nối giữa 2 DC, ta muốn từ chối ghi hay chấp nhận dữ liệu phân kỳ?".</text>
            <text x="34" y="360" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Với số dư tài khoản: từ chối. Với lượt like: chấp nhận, merge sau. Hai entity trong cùng hệ thống có thể chọn khác nhau.</text>
          </svg>
          <div class="diagram-cap">Hình 4.2 — PACELC: nhánh E (bình thường) mới là nhánh quyết định trải nghiệm người dùng</div>
        </div>

        <h3>Năm mức nhất quán — ngôn ngữ chung để nói chuyện</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mức</th><th>Đảm bảo</th><th>Chi phí</th><th>Ví dụ dùng</th></tr></thead>
            <tbody>
              <tr><td><strong>Linearizable</strong></td><td>Như một máy duy nhất, thời gian thực</td><td>Cao nhất: cần consensus hoặc leader đơn</td><td>Số dư, khoá phân tán, bầu leader</td></tr>
              <tr><td><strong>Sequential</strong></td><td>Mọi client thấy cùng một thứ tự, không cần đúng thời gian thực</td><td>Cao</td><td>Log system, event ordering</td></tr>
              <tr><td><strong>Causal</strong></td><td>Giữ nhân quả: không thấy trả lời trước câu hỏi</td><td>Trung bình (vector clock/HLC)</td><td>Bình luận, chat, tài liệu cộng tác</td></tr>
              <tr><td><strong>Read-your-writes</strong></td><td>User thấy ghi của chính mình</td><td>Thấp (sticky routing)</td><td>Profile, giỏ hàng</td></tr>
              <tr><td><strong>Eventual</strong></td><td>Sẽ hội tụ nếu ngừng ghi</td><td>Thấp nhất</td><td>Like count, view count, recommendation</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Câu trả lời ăn điểm</div>
            <p>"Với phần thanh toán tôi chọn CP: khi mất quorum tôi từ chối ghi thay vì chấp nhận rủi ro trừ tiền hai lần. Với phần feed và like tôi chọn AP: dữ liệu trễ 2 giây không ảnh hưởng gì, nhưng không thể để user không load được feed. Nghĩa là tôi dùng hai store khác nhau cho hai nhóm entity, và chấp nhận rằng <em>không có nhất quán mạnh xuyên suốt hai store</em> — tôi dùng Saga/outbox để bù trừ." Đây là câu trả lời của người đã vận hành thật.</p>
          </div>
        </div>
      `
    },

    {
      id: 'consensus', num: '4.3', title: 'Raft — consensus giải thích bằng ví dụ',
      html: `
        <p>Consensus là bài toán: <em>N node phải đồng ý về một chuỗi giá trị, ngay cả khi một số node chết</em>. Raft làm được điều đó và được thiết kế để con người hiểu được (khác Paxos). Hiểu Raft, bạn hiểu cách etcd giữ cluster state, cách CockroachDB giữ transaction, và cách Kubernetes chọn leader.</p>

        <h3>Ba trạng thái, một nhiệm kỳ</h3>
        <ul class="list-bullet">
          <li><strong>Follower:</strong> nhận log từ leader, trả lời request vote. Trạng thái mặc định.</li>
          <li><strong>Candidate:</strong> hết election timeout mà không nghe leader → tự tăng <code>term</code>, xin vote.</li>
          <li><strong>Leader:</strong> nhận đa số vote → gửi heartbeat, nhận mọi write, replicate log.</li>
        </ul>
        <p>Mọi message đều mang <code>term</code>. Node nhận message có term nhỏ hơn → từ chối và trả về term hiện tại. Node thấy term lớn hơn → cập nhật và trở thành follower. Đây là cơ chế duy nhất để loại bỏ leader cũ mà không cần đồng hồ chung.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 430" role="img" aria-label="Quá trình bầu leader Raft từ follower qua candidate sang leader với yêu cầu vote và heartbeat">
            <defs>
              <marker id="m4c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="270" y="16" width="220" height="62" rx="10" fill="#dbeeff" stroke="#151515" stroke-width="2"/>
            <text x="380" y="42" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">FOLLOWER</text>
            <text x="380" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">election timeout 150–300ms</text>

            <rect x="540" y="176" width="200" height="62" rx="10" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="640" y="202" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">CANDIDATE</text>
            <text x="640" y="222" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">term++, xin vote</text>

            <rect x="270" y="176" width="220" height="62" rx="10" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="380" y="202" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">LEADER</text>
            <text x="380" y="222" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">heartbeat mỗi 50ms</text>

            <rect x="20" y="176" width="200" height="62" rx="10" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="120" y="202" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">TIMEOUT</text>
            <text x="120" y="222" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">bầu lại, jitter tránh</text>

            <path d="M270,52 C240,80 200,120 160,174" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m4c)"/>
            <text x="196" y="106" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">không nghe heartbeat</text>

            <path d="M220,196 L268,200" stroke="#505a68" stroke-width="2" marker-end="url(#m4c)"/>
            <text x="244" y="186" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">đa số vote</text>

            <path d="M490,207 L538,207" stroke="#505a68" stroke-width="2" marker-end="url(#m4c)"/>
            <text x="514" y="197" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">3/5 vote</text>

            <path d="M380,176 L378,80" stroke="#10b981" stroke-width="2" marker-end="url(#m4c)"/>
            <text x="392" y="128" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">heartbeat (giữ follower)</text>

            <path d="M640,238 C640,280 500,290 440,290" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#m4c)"/>
            <text x="500" y="306" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">không đủ vote → timeout → bầu lại</text>

            <rect x="20" y="326" width="356" height="88" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="38" y="348" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Log replication: cơ chế cốt lõi</text>
            <text x="38" y="368" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">AppendEntries(term, prevIndex, prevTerm,</text>
            <text x="38" y="382" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">  entries[], commitIndex)</text>
            <text x="38" y="400" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Follower từ chối nếu prevTerm lệch → leader lùi lại sửa.</text>

            <rect x="388" y="326" width="356" height="88" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="406" y="348" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Commit khi nào?</text>
            <text x="406" y="368" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Khi entry đã được ghi bởi đa số node VÀ</text>
            <text x="406" y="384" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">ít nhất 1 entry của term hiện tại cũng vậy.</text>
            <text x="406" y="402" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Chỉ đếm đa số là chưa đủ — đây là bug kinh điển.</text>
          </svg>
          <div class="diagram-cap">Hình 4.3 — Raft: state machine với term làm bộ lọc thời gian và majority làm thẩm quyền</div>
        </div>

        <h3>Bốn luật bất biến của Raft</h3>
        <ol class="list-num">
          <li><strong>Election Safety:</strong> mỗi term có tối đa 1 leader. Suy ra từ việc mỗi node vote 1 lần/term và cần đa số.</li>
          <li><strong>Leader Append-Only:</strong> leader không bao giờ sửa hay xoá entry của mình, chỉ append.</li>
          <li><strong>Log Matching:</strong> nếu hai log có cùng (index, term) thì mọi entry trước đó giống nhau. Đây là điều làm cho việc so sánh log trở nên đơn giản.</li>
          <li><strong>Leader Completeness:</strong> nếu một entry đã commit ở term T thì mọi leader ở term &gt; T đều có entry đó. Suy ra từ điều kiện vote: candidate chỉ được vote nếu log của nó "ít nhất bằng" — nghĩa là không ai thiếu dữ liệu đã commit có thể thắng cử.</li>
        </ol>

        <h3>Ba vấn đề thực tế khi triển khai Raft</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Vấn đề</th><th>Triệu chứng</th><th>Giải pháp</th></tr></thead>
            <tbody>
              <tr><td><strong>Split vote</strong></td><td>Nhiều candidate cùng tranh, không ai đủ đa số, bầu lại liên tục</td><td>Election timeout ngẫu nhiên (150–300ms) — jitter phá vỡ đối xứng</td></tr>
              <tr><td><strong>Disruptive server</strong></td><td>Node bị network partition lâu, quay lại với term rất cao, phá cluster đang ổn định</td><td><strong>Pre-vote</strong>: hỏi "nếu tôi tranh cử, bạn có vote không?" trước khi thực sự tăng term. etcd bật mặc định</td></tr>
              <tr><td><strong>Leader lease & stale read</strong></td><td>Leader cũ (đã bị partition) vẫn trả read vì nó tưởng mình là leader</td><td>Leader phải gia hạn lease bằng heartbeat đa số; read chỉ phục vụ khi còn lease. Hoặc dùng ReadIndex/lease read</td></tr>
            </tbody>
          </table>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">GO</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Vòng lặp bầu chọn — phần cốt lõi, đơn giản hoá</span>
<span class="c-key">func</span> (n *Node) runElection() {
    n.state = Candidate
    n.currentTerm++
    votes := <span class="c-num">1</span> <span class="c-com">// tự bỏ phiếu cho mình</span>

    <span class="c-key">for</span> _, peer := <span class="c-key">range</span> n.peers {
        <span class="c-key">go func</span>(p Peer) {
            resp := p.RequestVote(RequestVoteArgs{
                Term:         n.currentTerm,
                CandidateID:  n.id,
                LastLogIndex: n.log.LastIndex(),
                LastLogTerm:  n.log.LastTerm(),
            })
            <span class="c-key">if</span> resp.Term &gt; n.currentTerm {
                n.becomeFollower(resp.Term) <span class="c-com">// có term mới hơn → nhường</span>
                <span class="c-key">return</span>
            }
            <span class="c-key">if</span> resp.VoteGranted {
                n.voteMu.Lock()
                votes++
                <span class="c-key">if</span> votes &gt; n.clusterSize/<span class="c-num">2</span> &amp;&amp; n.state == Candidate {
                    n.becomeLeader() <span class="c-com">// đa số → leader</span>
                }
                n.voteMu.Unlock()
            }
        }(peer)
    }
}</code></pre>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Tại sao luôn dùng số node lẻ?</div>
            <p>Với N=4, đa số là 3, nghĩa là chịu được 1 node chết — giống hệt N=3 nhưng tốn thêm 1 máy và làm tăng latency ghi (chờ nhiều ack hơn). N=5 chịu được 2 node chết. Vì vậy cấu hình chuẩn là 3 hoặc 5, không bao giờ 4 hay 6. Và <strong>đừng bao giờ</strong> đặt 3 node Raft trong 2 AZ: nếu AZ chứa 2 node chết, bạn mất quorum dù còn 1 node sống. Luôn trải trên 3 AZ, hoặc chấp nhận 2 AZ với 2+2+1 (và hiểu rằng mất AZ lớn là mất quorum).</p>
          </div>
        </div>
      `
    },

    {
      id: 'transactions', num: '4.4', title: '2PC, Saga và bài toán giao dịch phân tán',
      html: `
        <p>Trong một DB, <code>BEGIN ... COMMIT</code> cho bạn ACID. Khi dữ liệu nằm ở hai service (order ở DB A, inventory ở DB B), bạn không có <code>COMMIT</code> xuyên service. Đây là bài toán <span class="kw">distributed transaction</span>, và mọi giải pháp đều có giá.</p>

        <h3>2PC — atomic nhưng blocking</h3>
        <div class="diagram">
          <svg viewBox="0 0 760 360" role="img" aria-label="Hai giai đoạn của two-phase commit với coordinator và ba participant, kèm trạng thái blocking">
            <defs>
              <marker id="m4d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="20" width="180" height="60" rx="9" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="106" y="46" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Coordinator</text>
            <text x="106" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">ghi decision vào log</text>

            <rect x="300" y="20" width="130" height="60" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="365" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">P1</text>
            <text x="365" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">order DB</text>

            <rect x="452" y="20" width="130" height="60" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="517" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">P2</text>
            <text x="517" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">inventory DB</text>

            <rect x="604" y="20" width="140" height="60" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="674" y="46" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">P3</text>
            <text x="674" y="66" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">payment DB</text>

            <text x="16" y="110" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#5294ff">PHASE 1 — PREPARE</text>
            <path d="M196,44 L298,44" stroke="#505a68" stroke-width="2" marker-end="url(#m4d)"/>
            <path d="M196,56 L450,56" stroke="#505a68" stroke-width="2" marker-end="url(#m4d)"/>
            <path d="M196,68 L602,68" stroke="#505a68" stroke-width="2" marker-end="url(#m4d)"/>
            <text x="230" y="36" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#151515">"chuẩn bị?"</text>

            <rect x="300" y="96" width="444" height="42" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="316" y="114" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="700" fill="#151515">Participant: ghi undo/redo vào log, LẤY LOCK, trả "yes"</text>
            <text x="316" y="130" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Từ đây đến khi commit, dữ liệu bị khoá — không ai đọc/ghi được</text>

            <text x="16" y="176" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#10b981">PHASE 2 — COMMIT</text>
            <path d="M196,196 L740,196" stroke="#10b981" stroke-width="2" marker-end="url(#m4d)" stroke-dasharray="7 4"/>
            <text x="210" y="188" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">tất cả "yes" → quyết định COMMIT, gửi cho mọi participant</text>

            <rect x="16" y="222" width="352" height="118" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="34" y="244" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Nếu coordinator chết sau PREPARE</text>
            <text x="34" y="264" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Participant đã giữ lock và không biết</text>
            <text x="34" y="280" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">phải commit hay abort. Nó chờ… vô hạn.</text>
            <text x="34" y="300" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">→ khoá bị treo, throughput sụp, phải</text>
            <text x="34" y="316" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">dùng heuristics (đoán) — có thể sai.</text>

            <rect x="388" y="222" width="356" height="118" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="406" y="244" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Cách giảm đau</text>
            <text x="406" y="264" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">1. Coordinator HA (Raft) + decision log bền</text>
            <text x="406" y="280" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">2. Timeout + abort nếu quá hạn</text>
            <text x="406" y="296" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">3. Giữ transaction ngắn (&lt; 100ms)</text>
            <text x="406" y="312" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">4. Chỉ dùng trong 1 cluster (Spanner, TiDB</text>
            <text x="406" y="328" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">   dùng 2PC + consensus, tránh được treo)</text>
          </svg>
          <div class="diagram-cap">Hình 4.4 — 2PC đảm bảo atomic nhưng không đảm bảo tiến triển (liveness)</div>
        </div>

        <h3>Saga — eventual consistency có bù trừ</h3>
        <p>Thay vì khoá mọi thứ và commit một lần, Saga chia thành N local transaction. Nếu bước thứ k thất bại, chạy <span class="kw">compensating action</span> cho các bước 1..k-1 để hoàn tác về mặt nghiệp vụ.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 320" role="img" aria-label="Saga đặt hàng gồm bốn bước và các hành động bù trừ khi bước thanh toán thất bại">
            <defs>
              <marker id="m4e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m4er" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
              </marker>
            </defs>
            <rect x="16" y="30" width="150" height="66" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="91" y="52" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">T1</text>
            <text x="91" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Create order</text>
            <text x="91" y="86" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">orders: PENDING</text>

            <rect x="196" y="30" width="150" height="66" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="271" y="52" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">T2</text>
            <text x="271" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Reserve stock</text>
            <text x="271" y="86" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">inventory -= 1</text>

            <rect x="376" y="30" width="150" height="66" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="451" y="52" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">T3</text>
            <text x="451" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Charge card</text>
            <text x="451" y="86" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">payment: captured</text>

            <rect x="556" y="30" width="188" height="66" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="650" y="52" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">T4</text>
            <text x="650" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#ef4444">Ship order ✗</text>
            <text x="650" y="86" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">kho hết hàng thật</text>

            <path d="M166,63 L194,63" stroke="#505a68" stroke-width="2" marker-end="url(#m4e)"/>
            <path d="M346,63 L374,63" stroke="#505a68" stroke-width="2" marker-end="url(#m4e)"/>
            <path d="M526,63 L554,63" stroke="#505a68" stroke-width="2" marker-end="url(#m4e)"/>

            <text x="16" y="140" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#ef4444">HÀNH ĐỘNG BÙ TRỪ — chạy ngược</text>

            <rect x="376" y="158" width="150" height="66" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="451" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">C3</text>
            <text x="451" y="198" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Refund card</text>
            <text x="451" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">payment: refunded</text>

            <rect x="196" y="158" width="150" height="66" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="271" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">C2</text>
            <text x="271" y="198" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Release stock</text>
            <text x="271" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">inventory += 1</text>

            <rect x="16" y="158" width="150" height="66" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="91" y="180" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#8b95a3">C1</text>
            <text x="91" y="198" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Cancel order</text>
            <text x="91" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">status: CANCELLED</text>

            <path d="M620,96 C620,130 540,140 528,156" fill="none" stroke="#ef4444" stroke-width="2" marker-end="url(#m4er)"/>
            <path d="M376,191 L348,191" stroke="#ef4444" stroke-width="2" marker-end="url(#m4er)"/>
            <path d="M196,191 L168,191" stroke="#ef4444" stroke-width="2" marker-end="url(#m4er)"/>

            <rect x="556" y="158" width="188" height="66" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="650" y="182" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Bắt buộc:</text>
            <text x="650" y="200" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">compensation idempotent +</text>
            <text x="650" y="216" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">có thể fail → retry vô hạn</text>

            <rect x="16" y="248" width="728" height="60" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="272" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Saga không phải "rollback"</text>
            <text x="34" y="292" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Không có trạng thái nào bị "xoá" — mọi bước đều đã được người khác nhìn thấy. Refund không xoá giao dịch, release stock không xoá lịch sử kho. Đây là bù trừ nghiệp vụ, không phải ACID.</text>
          </svg>
          <div class="diagram-cap">Hình 4.5 — Saga: mỗi bước tiến có một bước lùi tương ứng, và bước lùi cũng có thể thất bại</div>
        </div>

        <h3>So sánh — chọn cái nào</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tiêu chí</th><th>2PC / XA</th><th>Saga</th><th>Outbox + event</th></tr></thead>
            <tbody>
              <tr><td>Atomicity</td><td>Có, thật sự</td><td>Không — eventual</td><td>Không — eventual</td></tr>
              <tr><td>Isolation</td><td>Có (lock)</td><td>Không — người khác thấy trạng thái trung gian</td><td>Không</td></tr>
              <tr><td>Blocking khi lỗi</td><td><span class="kw-r">Có, có thể vô hạn</span></td><td>Không</td><td>Không</td></tr>
              <tr><td>Độ trễ</td><td>2 round-trip + lock time</td><td>N × latency mỗi bước</td><td>1 write + async</td></tr>
              <tr><td>Phù hợp</td><td>Shard trong cùng cluster, transaction ngắn</td><td>Workflow dài, nhiều service, cần bù trừ nghiệp vụ</td><td>Đồng bộ trạng thái, event-driven, không cần rollback</td></tr>
              <tr><td>Ví dụ</td><td>Spanner, TiDB, SQL Server distributed tx</td><td>Đặt vé, đặt hàng, onboarding</td><td>Thông báo, index search, analytics</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Trạng thái trung gian phải được thiết kế</div>
            <p>Với Saga, người dùng có thể thấy "đơn PENDING" trong 3 giây, hoặc thấy hàng đã trừ kho nhưng đơn chưa xác nhận. Đây không phải bug — nhưng <strong>UI phải được thiết kế cho nó</strong>: hiển thị "đang xử lý", khoá nút mua lại, và có job đối soát để phát hiện đơn kẹt. Nếu bạn không nói được "người dùng thấy gì trong lúc chờ", thiết kế Saga của bạn chưa xong. Bài học từ thực tế: hầu hết sự cố Saga không phải ở thuật toán, mà ở chỗ thiếu job đối soát nên đơn kẹt hàng tuần không ai biết.</p>
          </div>
        </div>
      `
    }
    ,

    {
      id: 'resilience', num: '4.5', title: 'Circuit breaker, bulkhead, retry — sống chung với lỗi',
      html: `
        <p>Trong hệ phân tán, lỗi không phải ngoại lệ — nó là trạng thái bình thường. Câu hỏi không phải "làm sao để không lỗi" mà là <span class="kw">"làm sao để một lỗi cục bộ không lan thành sập toàn hệ thống"</span>.</p>

        <h3>Cascading failure — cơ chế sụp đổ</h3>
        <ol class="list-num">
          <li>Service B chậm (do DB khoá, GC pause, node quá tải).</li>
          <li>Service A gọi B, mỗi request giữ 1 thread/connection trong 30s timeout.</li>
          <li>Thread pool của A đầy sau vài giây vì request đến nhanh hơn request hoàn thành.</li>
          <li>A không phục vụ được <em>bất kỳ</em> endpoint nào — kể cả endpoint không liên quan đến B.</li>
          <li>Service C gọi A cũng đầy theo. Toàn hệ thống sập vì <strong>một</strong> service chậm.</li>
        </ol>
        <p>Điểm mấu chốt: <span class="kw-r">B không cần chết</span>. Chỉ cần chậm 3× là đủ để kéo cả hệ thống xuống. Đây là lý do timeout và circuit breaker không phải "tối ưu" mà là yêu cầu bắt buộc.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 340" role="img" aria-label="Ba trạng thái của circuit breaker closed open half-open và ngưỡng chuyển đổi">
            <defs>
              <marker id="m4f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="30" y="52" width="200" height="90" rx="10" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="130" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">CLOSED</text>
            <text x="130" y="98" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">gọi bình thường</text>
            <text x="130" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">đếm lỗi trong cửa sổ 10s</text>
            <text x="130" y="134" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#10b981">error rate &lt; 50%</text>

            <rect x="290" y="52" width="200" height="90" rx="10" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="390" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">OPEN</text>
            <text x="390" y="98" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">fail fast, không gọi</text>
            <text x="390" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">trả fallback ngay lập tức</text>
            <text x="390" y="134" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#ef4444">chờ 30s</text>

            <rect x="550" y="52" width="190" height="90" rx="10" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="645" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">HALF-OPEN</text>
            <text x="645" y="98" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">cho 5 request thử</text>
            <text x="645" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">thành công → CLOSED</text>
            <text x="645" y="134" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#b45309">lỗi → OPEN lại</text>

            <path d="M230,80 L286,80" stroke="#505a68" stroke-width="2" marker-end="url(#m4f)"/>
            <text x="258" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">lỗi &gt; ngưỡng</text>

            <path d="M490,80 L546,80" stroke="#505a68" stroke-width="2" marker-end="url(#m4f)"/>
            <text x="518" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#b45309">hết 30s</text>

            <path d="M645,142 C645,180 130,180 130,144" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#m4f)"/>
            <text x="380" y="196" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">thử thành công</text>

            <rect x="30" y="216" width="352" height="108" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="48" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Bulkhead — cô lập tài nguyên</text>
            <text x="48" y="260" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Thread pool riêng cho từng dependency:</text>
            <text x="48" y="278" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">/search   → 20 thread</text>
            <text x="48" y="294" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">/payment  → 50 thread</text>
            <text x="48" y="310" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">/recommend→ 10 thread</text>

            <rect x="398" y="216" width="342" height="108" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="416" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Retry đúng cách</text>
            <text x="416" y="260" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">✓ Chỉ retry lỗi tạm thời (5xx, timeout, 429)</text>
            <text x="416" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">✓ Exponential backoff + full jitter</text>
            <text x="416" y="292" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">✓ Tối đa 3 lần, có deadline tổng</text>
            <text x="416" y="308" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">✗ Retry lỗi 4xx (400, 401, 404) — vô nghĩa</text>
            <text x="416" y="322" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">✗ Retry khi đã hết deadline của request</text>
          </svg>
          <div class="diagram-cap">Hình 4.6 — Circuit breaker là state machine; bulkhead là hàng rào tài nguyên; retry là thuốc, không phải thức ăn</div>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">JAVA</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// Resilience4j: cấu hình thực dụng cho production</span>
CircuitBreakerConfig cb = CircuitBreakerConfig.custom()
    .slidingWindowType(SlidingWindowType.COUNT_BASED)
    .slidingWindowSize(<span class="c-num">50</span>)                 <span class="c-com">// xét 50 request gần nhất</span>
    .minimumNumberOfCalls(<span class="c-num">20</span>)           <span class="c-com">// chưa đủ 20 thì chưa đánh giá</span>
    .failureRateThreshold(<span class="c-num">50</span>)             <span class="c-com">// &gt; 50% lỗi → OPEN</span>
    .slowCallDurationThreshold(Duration.ofSeconds(<span class="c-num">2</span>))
    .slowCallRateThreshold(<span class="c-num">80</span>)              <span class="c-com">// chậm cũng tính là lỗi</span>
    .waitDurationInOpenState(Duration.ofSeconds(<span class="c-num">30</span>))
    .permittedNumberOfCallsInHalfOpenState(<span class="c-num">5</span>)
    .build();

RetryConfig retry = RetryConfig.custom()
    .maxAttempts(<span class="c-num">3</span>)
    .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(
        <span class="c-num">100</span>, <span class="c-num">2.0</span>, <span class="c-num">0.5</span>))   <span class="c-com">// 100ms, 200ms, 400ms ± 50% jitter</span>
    .retryExceptions(IOException.class, TimeoutException.class)
    .ignoreExceptions(BadRequestException.class)  <span class="c-com">// 4xx không retry</span>
    .build();

TimeLimiterConfig tl = TimeLimiterConfig.custom()
    .timeoutDuration(Duration.ofMillis(<span class="c-num">800</span>))   <span class="c-com">// theo p99.9 của dependency</span>
    .build();</code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Retry storm — cách tự tay DDoS hệ thống của mình</div>
            <p>Ba lớp retry chồng nhau: client retry 3 lần, gateway retry 3 lần, service retry 3 lần → mỗi request thực tế tạo ra <strong>27 lần gọi</strong> xuống DB. Khi DB chậm, lượng gọi tăng 27× làm DB chậm hơn nữa — vòng xoáy tử thần. Quy tắc: <strong>chỉ retry ở một tầng duy nhất</strong> (thường là tầng gần client nhất hoặc tầng gọi ra ngoài hệ thống của bạn), và luôn dùng <em>retry budget</em>: giới hạn retry ở 10–20% tổng request, vượt thì bỏ. Envoy/Istio có sẵn cấu hình <code>retry_budget</code>.</p>
          </div>
        </div>

        <h3>Fallback — trả lời gì khi không gọi được</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tình huống</th><th>Fallback tốt</th><th>Fallback tệ</th></tr></thead>
            <tbody>
              <tr><td>Recommendation service chết</td><td>Trả danh sách "phổ biến" tĩnh, cache sẵn</td><td>Trả trang trắng, hoặc chờ 30s rồi lỗi</td></tr>
              <tr><td>Search index chết</td><td>Trả kết quả từ DB bằng LIKE trên top sản phẩm</td><td>Báo "hệ thống bảo trì" cho toàn site</td></tr>
              <tr><td>Payment gateway timeout</td><td>Đánh dấu PENDING, retry nền, thông báo "đang xử lý"</td><td>Báo thất bại — user thử lại và bị trừ tiền 2 lần</td></tr>
              <tr><td>Avatar service chết</td><td>Trả ảnh placeholder</td><td>Broken image icon</td></tr>
              <tr><td>View counter chết</td><td>Bỏ qua, hiển thị số cache cũ</td><td>Không load được trang video</td></tr>
            </tbody>
          </table>
        </div>
      `
    },

    {
      id: 'idempotency', num: '4.6', title: 'Idempotency & exactly-once — bài học tốn tiền nhất',
      html: `
        <p>Đây là phần mà sai sót gây thiệt hại tài chính trực tiếp. Một API thanh toán không idempotent + một lần retry = user bị trừ tiền hai lần. Không có cách nào "sửa" ngoài việc hoàn tiền và xin lỗi.</p>

        <h3>Vì sao "exactly-once delivery" là bất khả thi</h3>
        <p>Client gửi request, không nhận được response (mạng đứt sau khi server xử lý). Client có hai lựa chọn, cả hai đều sai:</p>
        <ul class="list-bullet">
          <li><strong>Gửi lại:</strong> nếu server đã xử lý → thực hiện 2 lần. (at-least-once)</li>
          <li><strong>Không gửi lại:</strong> nếu server chưa xử lý → mất. (at-most-once)</li>
        </ul>
        <p>Đây là biểu hiện của <span class="kw">two generals problem</span>: không có giao thức nào trên mạng không tin cậy đảm bảo được cả hai bên cùng biết trạng thái. Nhưng — và đây là điểm quan trọng — <strong>exactly-once *processing* làm được</strong>, vì nó không phụ thuộc vào mạng mà vào việc ghi có điều kiện ở phía nhận.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 350" role="img" aria-label="Luồng xử lý idempotency key với bảng dedupe và các trạng thái in-progress completed">
            <defs>
              <marker id="m4g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="30" width="150" height="70" rx="9" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="91" y="54" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Client</text>
            <text x="91" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">Idempotency-Key:</text>
            <text x="91" y="88" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">uuid-abc-123</text>

            <rect x="196" y="30" width="170" height="70" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="281" y="54" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">API Server</text>
            <text x="281" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">tra bảng dedupe</text>

            <rect x="396" y="30" width="180" height="70" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="486" y="54" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" font-weight="700" fill="#151515">idempotency_keys</text>
            <text x="486" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">UNIQUE(key, user_id)</text>
            <text x="486" y="90" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">status, response_body</text>

            <rect x="606" y="30" width="138" height="70" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="675" y="54" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Payment svc</text>
            <text x="675" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">thực thi 1 lần</text>

            <path d="M166,65 L194,65" stroke="#505a68" stroke-width="2" marker-end="url(#m4g)"/>
            <path d="M366,65 L394,65" stroke="#505a68" stroke-width="2" marker-end="url(#m4g)"/>
            <path d="M576,65 L604,65" stroke="#505a68" stroke-width="2" marker-end="url(#m4g)"/>

            <rect x="16" y="126" width="352" height="96" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="34" y="150" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Lần gọi 1 — key chưa tồn tại</text>
            <text x="34" y="170" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">INSERT ... status='in_progress'</text>
            <text x="34" y="186" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ thực thi payment → 'completed' + lưu response</text>
            <text x="34" y="206" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">✓ IPayment đã xong đúng 1 lần</text>

            <rect x="388" y="126" width="356" height="96" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="406" y="150" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Lần gọi 2 — cùng key (retry)</text>
            <text x="406" y="170" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">SELECT → status='completed'</text>
            <text x="406" y="186" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">→ trả lại response_body đã lưu, KHÔNG thực thi</text>
            <text x="406" y="206" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#10b981">✓ Client nhận cùng kết quả, không trừ tiền lần 2</text>

            <rect x="16" y="238" width="728" height="96" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="262" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Ba trạng thái, ba cách xử lý</text>
            <text x="34" y="284" font-family="JetBrains Mono, monospace" font-size="9" fill="#505a68">in_progress  → 409 Conflict "đang xử lý" (client chờ và thử lại sau 1s)</text>
            <text x="34" y="302" font-family="JetBrains Mono, monospace" font-size="9" fill="#10b981">completed    → 200 + response gốc (kể cả khi response gốc là lỗi 4xx)</text>
            <text x="34" y="320" font-family="JetBrains Mono, monospace" font-size="9" fill="#ef4444">failed       → cho phép thử lại với cùng key (hoặc yêu cầu key mới, tuỳ nghiệp vụ)</text>
          </svg>
          <div class="diagram-cap">Hình 4.7 — Idempotency key biến "at-least-once" thành "effectively-once" ở tầng ứng dụng</div>
        </div>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Bảng dedupe: tối giản và đúng</span>
<span class="c-key">CREATE TABLE</span> idempotency_keys (
  user_id       <span class="c-key">BIGINT</span>      <span class="c-key">NOT NULL</span>,
  key           <span class="c-key">TEXT</span>        <span class="c-key">NOT NULL</span>,
  request_hash  <span class="c-key">TEXT</span>        <span class="c-key">NOT NULL</span>,  <span class="c-com">-- phát hiện dùng lại key với body khác</span>
  status        <span class="c-key">TEXT</span>        <span class="c-key">NOT NULL</span>,  <span class="c-com">-- in_progress | completed | failed</span>
  response_code <span class="c-key">INT</span>,
  response_body <span class="c-key">JSONB</span>,
  created_at    <span class="c-key">TIMESTAMPTZ</span> <span class="c-key">DEFAULT</span> now(),
  expires_at    <span class="c-key">TIMESTAMPTZ</span> <span class="c-key">NOT NULL</span>,   <span class="c-com">-- TTL 24h, dọn bằng job</span>
  <span class="c-key">PRIMARY KEY</span> (user_id, key)
);

<span class="c-com">-- Bước 1: chiếm key (atomic nhờ PRIMARY KEY)</span>
<span class="c-key">INSERT INTO</span> idempotency_keys (user_id, key, request_hash, status, expires_at)
<span class="c-key">VALUES</span> (<span class="c-num">42</span>, <span class="c-str">'uuid-abc-123'</span>, <span class="c-str">'sha256:...'</span>, <span class="c-str">'in_progress'</span>, now() + <span class="c-key">interval</span> <span class="c-str">'24 hours'</span>)
<span class="c-key">ON CONFLICT</span> (user_id, key) <span class="c-key">DO NOTHING</span>
<span class="c-key">RETURNING</span> id;

<span class="c-com">-- Không có row trả về = key đã tồn tại → đọc và trả kết quả cũ</span>
<span class="c-com">-- Có row = ta thắng, được phép thực thi nghiệp vụ</span>

<span class="c-com">-- Bước 2: sau khi nghiệp vụ xong, ghi kết quả (cùng transaction với nghiệp vụ!)</span>
<span class="c-key">BEGIN</span>;
  <span class="c-key">UPDATE</span> accounts <span class="c-key">SET</span> balance = balance - <span class="c-num">99000</span> <span class="c-key">WHERE</span> id = <span class="c-num">42</span>;
  <span class="c-key">INSERT INTO</span> ledger (account_id, amount, ref) <span class="c-key">VALUES</span> (<span class="c-num">42</span>, -<span class="c-num">99000</span>, <span class="c-str">'uuid-abc-123'</span>);
  <span class="c-key">UPDATE</span> idempotency_keys <span class="c-key">SET</span> status = <span class="c-str">'completed'</span>,
         response_code = <span class="c-num">200</span>, response_body = <span class="c-str">'{"ok":true}'</span>
   <span class="c-key">WHERE</span> user_id = <span class="c-num">42</span> <span class="c-key">AND</span> key = <span class="c-str">'uuid-abc-123'</span>;
<span class="c-key">COMMIT</span>;</code></pre>
        </div>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Bốn cái bẫy của idempotency</div>
            <p><strong>1. Client tự sinh key mỗi lần retry:</strong> vô dụng hoàn toàn — key phải sinh một lần cho mỗi <em>ý định</em> nghiệp vụ (khi user bấm nút), rồi dùng lại cho mọi lần retry. <strong>2. Không có TTL:</strong> bảng phình vô hạn; đặt 24h và có job dọn. <strong>3. Không lưu response:</strong> lần retry thứ hai trả "đang xử lý" mãi mãi dù đã xong — phải lưu cả body. <strong>4. Không kiểm tra body hash:</strong> client lỡ dùng lại key cho request khác (bug) → bạn trả nhầm kết quả của giao dịch trước. Luôn so sánh hash và trả 422 nếu khác.</p>
          </div>
        </div>

        <h3>Idempotency tự nhiên — khi không cần key</h3>
        <p>Một số thao tác đã idempotent theo bản chất, không cần key:</p>
        <ul class="list-check">
          <li><code>SET balance = 100</code> (giá trị tuyệt đối) thay vì <code>balance += 10</code> (tương đối).</li>
          <li><code>PUT /users/42 {name: "An"}</code> thay vì <code>POST /users</code>.</li>
          <li><code>UPDATE orders SET status='shipped' WHERE id=1 AND status='packed'</code> — có điều kiện, lần 2 không match nên không đổi.</li>
          <li><code>DELETE FROM x WHERE id=1</code> — xoá 2 lần kết quả như nhau.</li>
          <li><code>ON CONFLICT DO NOTHING</code> / <code>UPSERT</code> thay vì INSERT thuần.</li>
        </ul>
        <p>Nhưng <code>balance += 10</code>, <code>POST /orders</code>, <code>count++</code> thì <strong>không</strong> — phải có key.</p>
      `
    },

    {
      id: 'locks', num: '4.7', title: 'Distributed lock — và vì sao nó thường sai',
      html: `
        <p>Distributed lock là một trong những thứ bị implement sai nhiều nhất. Vấn đề không phải ở <code>SETNX</code> mà ở chỗ: <span class="kw-r">bạn không biết mình còn giữ lock hay không</span>.</p>

        <h3>Phiên bản sai nhất — nhưng phổ biến nhất</h3>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">PSEUDOCODE</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">// ✗ SAI: ba lỗi cùng lúc</span>
<span class="c-key">if</span> redis.setnx(lock_key, <span class="c-str">"1"</span>):          <span class="c-com">// 1. không có TTL → deadlock nếu crash</span>
    do_work()                            <span class="c-com">// 2. có thể chạy lâu hơn TTL</span>
    redis.del(lock_key)                  <span class="c-com">// 3. xoá lock của NGƯỜI KHÁC</span></code></pre>
        </div>
        <p>Lỗi thứ ba là nghiêm trọng nhất. Kịch bản: client A lấy lock với TTL 10s, bị GC pause 15s, lock hết hạn, client B lấy lock, A tỉnh dậy và gọi <code>DEL</code> → <strong>xoá lock của B</strong>. Bây giờ cả A và B đều tin mình giữ lock.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">LUA</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- ✓ ĐÚNG hơn: TTL + kiểm tra owner khi xoá (atomic bằng Lua)</span>
<span class="c-com">-- Acquire: SET key value NX PX 10000</span>
<span class="c-com">--   value = UUID của lần acquire này (fencing token)</span>

<span class="c-com">-- Release: chỉ xoá nếu value khớp</span>
<span class="c-key">if</span> redis.call(<span class="c-str">"GET"</span>, KEYS[<span class="c-num">1</span>]) == ARGV[<span class="c-num">1</span>] <span class="c-key">then</span>
  <span class="c-key">return</span> redis.call(<span class="c-str">"DEL"</span>, KEYS[<span class="c-num">1</span>])
<span class="c-key">else</span>
  <span class="c-key">return</span> <span class="c-num">0</span>   <span class="c-com">-- không phải lock của mình, không xoá</span>
<span class="c-key">end</span>

<span class="c-com">-- Extend (watchdog): chỉ gia hạn nếu vẫn là owner</span>
<span class="c-key">if</span> redis.call(<span class="c-str">"GET"</span>, KEYS[<span class="c-num">1</span>]) == ARGV[<span class="c-num">1</span>] <span class="c-key">then</span>
  <span class="c-key">return</span> redis.call(<span class="c-str">"PEXPIRE"</span>, KEYS[<span class="c-num">1</span>], ARGV[<span class="c-num">2</span>])
<span class="c-key">end</span>
<span class="c-key">return</span> <span class="c-num">0</span></code></pre>
        </div>

        <h3>Nhưng ngay cả vậy vẫn chưa đủ — cần fencing</h3>
        <p>Vấn đề còn lại: A giữ lock, bị pause, lock hết hạn, B lấy lock và bắt đầu ghi. A tỉnh dậy <em>vẫn đang trong <code>do_work()</code></em> và cũng ghi. Lua script không cứu được vì A không gọi release — nó đang ghi dữ liệu.</p>
        <p>Giải pháp duy nhất đúng: <span class="kw">fencing token</span>. Mỗi lần acquire cấp một số tăng dần. Mọi write gửi kèm số đó; storage từ chối write có số nhỏ hơn số lớn nhất đã thấy.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 330" role="img" aria-label="Minh hoạ fencing token ngăn client cũ ghi dữ liệu sau khi lock hết hạn">
            <defs>
              <marker id="m4h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m4hr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
              </marker>
            </defs>
            <text x="16" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#8b95a3">THỜI GIAN →</text>

            <line x1="40" y1="90" x2="740" y2="90" stroke="#e7ebf1" stroke-width="2"/>

            <rect x="40" y="46" width="200" height="36" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="140" y="68" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">A giữ lock, token=33</text>

            <rect x="240" y="46" width="150" height="36" rx="7" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="315" y="68" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">A bị GC pause…</text>

            <rect x="390" y="46" width="180" height="36" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="480" y="68" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#ef4444">TTL hết, lock mở</text>

            <rect x="570" y="46" width="170" height="36" rx="7" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="655" y="68" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">B lấy lock, token=34</text>

            <rect x="40" y="110" width="350" height="36" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="215" y="132" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">A ghi với token=33 → storage CHẤP NHẬN (33 &gt; 0)</text>

            <rect x="390" y="110" width="350" height="36" rx="7" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="565" y="132" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">B ghi với token=34 → CHẤP NHẬN, max_token=34</text>

            <rect x="40" y="160" width="700" height="36" rx="7" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="390" y="182" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">A tỉnh dậy, ghi tiếp với token=33 → storage TỪ CHỐI (33 &lt; 34) ✗</text>

            <rect x="16" y="216" width="352" height="98" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Storage phải kiểm tra token</text>
            <text x="34" y="260" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Đây mới là điều thật sự bảo vệ.</text>
            <text x="34" y="278" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Redis/etcd chỉ giữ lock; quyết định</text>
            <text x="34" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">từ chối nằm ở tầng ghi dữ liệu.</text>

            <rect x="384" y="216" width="360" height="98" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="402" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Thực tế dễ dùng hơn</text>
            <text x="402" y="260" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Dùng conditional write: UPDATE ... WHERE</text>
            <text x="402" y="276" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">version = 5. Không khớp → không ghi.</text>
            <text x="402" y="292" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Đây là optimistic lock — đơn giản và</text>
            <text x="402" y="308" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">an toàn hơn nhiều so với distributed lock.</text>
          </svg>
          <div class="diagram-cap">Hình 4.8 — Fencing token: lock chỉ là tối ưu hoá, tính đúng đắn nằm ở tầng storage</div>
        </div>

        <h3>Khi nào thật sự cần distributed lock</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Nhu cầu</th><th>Nên dùng</th><th>Không nên dùng lock</th></tr></thead>
            <tbody>
              <tr><td>Chỉ một worker chạy cron job</td><td>Lock + lease (etcd/SQL <code>FOR UPDATE SKIP LOCKED</code>)</td><td>—</td></tr>
              <tr><td>Tránh 2 request xử lý cùng order</td><td><span class="kw-g">Conditional UPDATE / unique constraint</span></td><td>Distributed lock — chậm và có thể sai</td></tr>
              <tr><td>Tăng counter an toàn</td><td>Atomic increment (Redis INCR / SQL <code>+1</code>)</td><td>Lock — thừa và chậm</td></tr>
              <tr><td>Đảm bảo tuần tự giữa nhiều node</td><td>Partition theo key + single consumer (Kafka)</td><td>Lock — không đảm bảo được thứ tự</td></tr>
              <tr><td>Bầu leader</td><td>Raft lease (etcd election API)</td><td>Redis SETNX — không an toàn dưới partition</td></tr>
              <tr><td>Chống trùng khi tạo resource</td><td>Unique index + bắt lỗi duplicate</td><td>Check-then-act với lock</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Redlock — và tại sao nó gây tranh cãi</div>
            <p>Redlock cố làm lock an toàn bằng cách lấy lock trên N/2+1 Redis độc lập. Martin Kleppmann đã chỉ ra nó vẫn không an toàn khi có clock drift, GC pause, hoặc network delay — vì không có fencing token thì client cũ vẫn ghi được. Antirez (tác giả Redis) phản biện rằng Redlock có dùng thời gian lấy lock để phát hiện. Kết luận thực dụng cho phỏng vấn: <strong>đừng dùng distributed lock để bảo vệ tính đúng đắn của dữ liệu</strong>. Dùng nó như một tối ưu hoá (giảm việc trùng lặp), còn tính đúng đắn đặt ở tầng storage bằng conditional write, unique constraint, hoặc fencing token. Nếu bạn nói được câu này trong phỏng vấn, đó là dấu hiệu rất tốt.</p>
          </div>
        </div>
      `
    }
    ,
    {
      id: 'observability', num: '4.8', title: 'Observability — nhìn thấy hệ thống đang nghĩ gì',
      html: `
        <p>Trong hệ một máy, bạn debug bằng <code>print</code> và stack trace. Trong hệ 30 service, một request đi qua 12 service, 3 queue, 2 cache — <span class="kw">log rời rạc không đủ để suy luận</span>. Observability không phải "thêm dashboard"; nó là khả năng trả lời câu hỏi bạn chưa biết trước.</p>

        <h3>Ba trụ cột và câu hỏi chúng trả lời</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Trụ cột</th><th>Trả lời câu hỏi</th><th>Chi phí</th><th>Công cụ</th></tr></thead>
            <tbody>
              <tr><td><strong>Metrics</strong></td><td>"Hệ thống có đang khoẻ không? Từ khi nào?" — số liệu tổng hợp theo thời gian</td><td>Thấp (cardinality thấp)</td><td>Prometheus, CloudWatch, Datadog</td></tr>
              <tr><td><strong>Logs</strong></td><td>"Chính xác chuyện gì đã xảy ra với request này?" — sự kiện rời rạc</td><td>Cao (volume)</td><td>Loki, ELK, Splunk</td></tr>
              <tr><td><strong>Traces</strong></td><td>"Thời gian đi đâu? Service nào chậm?" — đường đi + timing</td><td>Trung bình (sampling)</td><td>Jaeger, Tempo, OpenTelemetry</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 400" role="img" aria-label="Một request đi qua bốn service với trace span hiển thị thời gian từng chặng">
            <defs>
              <marker id="m4i" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#8b95a3">MỘT REQUEST — trace_id = 7f3a9c</text>

            <rect x="16" y="34" width="180" height="46" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="106" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">API Gateway</text>

            <rect x="224" y="34" width="180" height="46" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="314" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Order Service</text>

            <rect x="432" y="34" width="160" height="46" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="512" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Payment</text>

            <rect x="620" y="34" width="126" height="46" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="683" y="62" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Inventory</text>

            <path d="M196,57 L222,57" stroke="#505a68" stroke-width="2" marker-end="url(#m4i)"/>
            <path d="M404,57 L430,57" stroke="#505a68" stroke-width="2" marker-end="url(#m4i)"/>
            <path d="M592,57 L618,57" stroke="#505a68" stroke-width="2" marker-end="url(#m4i)"/>

            <rect x="16" y="110" width="730" height="124" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="132" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Waterfall — mỗi thanh là một span</text>

            <rect x="34" y="144" width="700" height="16" rx="4" fill="#f4d77c" stroke="#151515" stroke-width="1.5"/>
            <text x="40" y="156" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">gateway · 420ms</text>

            <rect x="120" y="166" width="520" height="16" rx="4" fill="#e9f0fc" stroke="#151515" stroke-width="1.5"/>
            <text x="126" y="178" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">order-svc · 380ms</text>

            <rect x="180" y="188" width="300" height="16" rx="4" fill="#dcfce7" stroke="#151515" stroke-width="1.5"/>
            <text x="186" y="200" font-family="JetBrains Mono, monospace" font-size="8" fill="#151515">payment · 220ms</text>

            <rect x="500" y="210" width="130" height="16" rx="4" fill="#fee2e2" stroke="#151515" stroke-width="1.5"/>
            <text x="506" y="222" font-family="JetBrains Mono, monospace" font-size="8" fill="#ef4444">inventory · 95ms ← chậm bất thường</text>

            <text x="16" y="264" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Hai con số phải đọc đúng</text>

            <rect x="16" y="276" width="352" height="108" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="34" y="298" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">p50 vs p99</text>
            <text x="34" y="318" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">p50 = 200ms (một nửa nhanh hơn)</text>
            <text x="34" y="334" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">p99 = 3.200ms (1% user chờ 3,2s)</text>
            <text x="34" y="352" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">Với 10M user, p99 = 100.000 người</text>
            <text x="34" y="368" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">đang có trải nghiệm tệ mỗi ngày.</text>

            <rect x="384" y="276" width="362" height="108" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="402" y="298" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Tại sao KHÔNG dùng trung bình</text>
            <text x="402" y="318" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">99 request 10ms + 1 request 10s</text>
            <text x="402" y="334" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">→ trung bình = 110ms, trông "ổn"</text>
            <text x="402" y="350" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">nhưng p99 = 10s, thảm hoạ</text>
            <text x="402" y="370" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">Trung bình che giấu đuôi phân bố.</text>
          </svg>
          <div class="diagram-cap">Hình 4.9 — Trace biến "request chậm" thành "chặng thứ 4 chậm 95ms"</div>
        </div>

        <h3>Bốn tín hiệu vàng (Google SRE)</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tín hiệu</th><th>Định nghĩa</th><th>Ví dụ metric</th></tr></thead>
            <tbody>
              <tr><td><strong>Latency</strong></td><td>Thời gian phục vụ; tách success và failure</td><td><code>http_request_duration_seconds</code></td></tr>
              <tr><td><strong>Traffic</strong></td><td>Nhu cầu đặt lên hệ thống</td><td><code>http_requests_total</code></td></tr>
              <tr><td><strong>Errors</strong></td><td>Tỉ lệ request thất bại (5xx, exception, timeout)</td><td><code>http_requests_total{status=~"5.."}</code></td></tr>
              <tr><td><strong>Saturation</strong></td><td>Mức bão hoà tài nguyên</td><td>CPU, memory, connection pool, queue depth</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Cardinality bomb — cách tự làm sập Prometheus</div>
            <p>Metric có label <code>user_id</code>, <code>email</code>, <code>request_id</code>, hoặc <code>url</code> chứa path param sẽ tạo ra <strong>hàng triệu time series</strong>. Mỗi series tốn RAM và CPU; Prometheus chết vì OOM, và khi Prometheus chết bạn mất luôn khả năng quan sát trong lúc đang có sự cố. Quy tắc: label chỉ được chứa giá trị có cardinality thấp (&lt; 100). URL phải được normalize (<code>/users/:id</code> thay vì <code>/users/12345</code>). Muốn phân tích theo chiều cao cardinality → dùng logs hoặc traces, không dùng metrics.</p>
          </div>
        </div>

        <h3>SLI, SLO, SLA — ngôn ngữ để nói về độ tin cậy</h3>
        <ul class="list-bullet">
          <li><span class="kw">SLI</span> (Indicator): con số đo được. "Tỉ lệ request <code>/checkout</code> thành công dưới 300ms."</li>
          <li><span class="kw">SLO</span> (Objective): mục tiêu nội bộ cho SLI. "99,9% trong 30 ngày."</li>
          <li><span class="kw">SLA</span> (Agreement): cam kết với khách hàng, có phạt tiền. Thường thấp hơn SLO một chút để có đệm.</li>
          <li><span class="kw-y">Error budget</span>: 100% − SLO. Với SLO 99,9%/30 ngày = <strong>43 phút</strong> downtime được phép. Hết budget → đóng băng feature, dồn vào reliability. Đây là công cụ quản lý, không chỉ là số liệu.</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Nếu chỉ có 1 giờ để thêm observability</div>
            <p>Bật <strong>OpenTelemetry auto-instrumentation</strong> (1 dòng config cho Java/Go/Node/Python) — bạn có ngay traces + metrics HTTP/gRPC/DB miễn phí. Thêm <strong>structured logging dạng JSON</strong> với mandatory fields <code>trace_id</code>, <code>user_id</code>, <code>route</code>, <code>status</code>, <code>duration_ms</code>. Đặt <strong>3 alert</strong>: error rate &gt; 1%, p99 latency &gt; 1s, và saturation &gt; 80%. Ba thứ đó che được 80% sự cố thực tế. Đừng bắt đầu bằng việc xây dashboard đẹp.</p>
          </div>
        </div>
      `
    },

    {
      id: 'security', num: '4.9', title: 'Bảo mật trong hệ phân tán — zero trust & defence in depth',
      html: `
        <p>Bảo mật không phải một lớp ở rìa (firewall) mà là <span class="kw">nhiều lớp</span>, trong đó giả định rằng lớp ngoài cùng <em>sẽ</em> bị vượt qua. Zero trust nghĩa là: <span class="kw-r">không tin bất kỳ request nào chỉ vì nó đến từ trong mạng</span>.</p>

        <h3>Vòng đời một request — mỗi bước là một cơ hội</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Lớp</th><th>Kiểm soát</th><th>Nếu thiếu</th></tr></thead>
            <tbody>
              <tr><td><strong>Edge</strong></td><td>WAF, DDoS protection, rate limit theo IP</td><td>Bị flood, bị khai thác lỗ hổng web phổ biến</td></tr>
              <tr><td><strong>AuthN</strong></td><td>OIDC/OAuth2, MFA, session/token ngắn hạn</td><td>Không biết ai đang gọi</td></tr>
              <tr><td><strong>AuthZ</strong></td><td>RBAC/ABAC, kiểm tra ở <em>từng</em> service</td><td>IDOR: đổi <code>/orders/123</code> thành <code>/orders/124</code> đọc được đơn người khác</td></tr>
              <tr><td><strong>Service-to-service</strong></td><td>mTLS, SPIFFE identity, JWT ngắn hạn</td><td>Một pod bị chiếm → gọi được mọi service khác</td></tr>
              <tr><td><strong>Data at rest</strong></td><td>Mã hoá volume (KMS), mã hoá cột nhạy cảm</td><td>Lộ ổ đĩa/backup là lộ toàn bộ dữ liệu</td></tr>
              <tr><td><strong>Data in transit</strong></td><td>TLS 1.3 mọi nơi, kể cả trong VPC</td><td>Sniffing giữa pod</td></tr>
              <tr><td><strong>Secrets</strong></td><td>Vault/KMS, rotation tự động, không trong env/git</td><td>Secret lộ trong image hoặc log</td></tr>
              <tr><td><strong>Audit</strong></td><td>Log mọi thao tác admin/privileged, không sửa được</td><td>Không biết ai đã làm gì khi sự cố xảy ra</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 330" role="img" aria-label="Kiến trúc zero trust với các lớp kiểm soát từ edge qua authN authZ tới service mesh và dữ liệu">
            <defs>
              <marker id="m4j" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="16" y="22" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#8b95a3">MỖI ĐƯỜNG VIỀN LÀ MỘT LẦN KIỂM TRA — KHÔNG TIN AI</text>

            <rect x="16" y="40" width="728" height="200" rx="12" fill="#f8fafc" stroke="#8b95a3" stroke-width="2" stroke-dasharray="7 4"/>
            <text x="32" y="62" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#8b95a3">INTERNET (không tin)</text>

            <rect x="140" y="76" width="112" height="52" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="196" y="100" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">WAF + DDoS</text>
            <text x="196" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">rate limit IP</text>

            <rect x="276" y="76" width="112" height="52" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="332" y="100" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">AuthN</text>
            <text x="332" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">OIDC + MFA</text>

            <rect x="412" y="76" width="112" height="52" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="468" y="100" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">AuthZ</text>
            <text x="468" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">RBAC/ABAC</text>

            <rect x="548" y="76" width="180" height="52" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="638" y="100" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Service mesh</text>
            <text x="638" y="116" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">mTLS + SPIFFE ID</text>

            <path d="M252,102 L274,102" stroke="#505a68" stroke-width="2" marker-end="url(#m4j)"/>
            <path d="M388,102 L410,102" stroke="#505a68" stroke-width="2" marker-end="url(#m4j)"/>
            <path d="M524,102 L546,102" stroke="#505a68" stroke-width="2" marker-end="url(#m4j)"/>

            <rect x="140" y="152" width="260" height="66" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="156" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Service A → Service B</text>
            <text x="156" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">Kiểm tra lại AuthZ với resource cụ thể:</text>
            <text x="156" y="208" font-family="JetBrains Mono, monospace" font-size="9" fill="#151515">can(user, "read", order#123)?</text>

            <rect x="424" y="152" width="304" height="66" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="440" y="174" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">Dữ liệu</text>
            <text x="440" y="192" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">TLS in transit · KMS at rest · cột nhạy cảm mã hoá riêng</text>
            <text x="440" y="208" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#ef4444">Secrets từ Vault, rotate 30 ngày, không trong env</text>

            <rect x="16" y="256" width="352" height="60" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="34" y="280" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">IDOR — lỗ hổng phổ biến nhất</text>
            <text x="34" y="300" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Đổi id trong URL và đọc được dữ liệu người khác. Luôn kiểm tra ownership.</text>

            <rect x="384" y="256" width="362" height="60" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="402" y="280" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Least privilege cho service account</text>
            <text x="402" y="300" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Mỗi service chỉ có quyền trên bảng/topic nó thật sự cần.</text>
          </svg>
          <div class="diagram-cap">Hình 4.10 — Zero trust: mỗi bước là một lần xác thực, không có "vùng tin cậy"</div>
        </div>

        <h3>Ba lỗi bảo mật hay xuất hiện trong thiết kế</h3>
        <ol class="list-num">
          <li><strong>AuthZ chỉ ở gateway.</strong> Gateway kiểm tra "user đã đăng nhập chưa" nhưng không kiểm tra "user có quyền với resource này không". Khi service B nhận request nội bộ, nó tin tưởng hoàn toàn. Sửa: kiểm tra authorization ở <em>service sở hữu dữ liệu</em>, dùng token mang đủ claim hoặc gọi authz service.</li>
          <li><strong>JWT không kiểm tra <code>aud</code> và <code>iss</code>.</strong> Token của service A bị dùng để gọi service B. Sửa: mỗi service chỉ chấp nhận token có <code>aud</code> đúng mình, và verify signature với JWKS đúng issuer. Đặt TTL ngắn (5–15 phút) + refresh token.</li>
          <li><strong>Mã hoá nhưng không quản lý khoá.</strong> Mã hoá cột SSN bằng một key hard-code trong config. Khi key lộ, mọi dữ liệu lộ và bạn không thể rotate vì phải re-encrypt toàn bộ. Sửa: envelope encryption (KMS giữ master key, mỗi record có data key riêng), cột lưu <code>key_id</code> để rotate dần.</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Bảo mật trong phỏng vấn — nói 3 câu là đủ</div>
            <p>Đừng cố trình bày toàn bộ mô hình mối đe doạ. Chỉ cần: <strong>(1)</strong> "AuthN ở edge, AuthZ ở từng service với kiểm tra ownership." <strong>(2)</strong> "mTLS giữa các service, secret trong Vault có rotation, không bao giờ trong env hay image." <strong>(3)</strong> "Audit log bất biến cho mọi thao tác privileged, và PII được mã hoá ở cấp cột với key riêng để rotate được." Ba câu này che được phần lớn điểm bảo mật trong một buổi system design 45 phút — và quan trọng hơn, chúng đúng.</p>
          </div>
        </div>
      `
    }

  ],

  quiz: [
    {
      q: 'Bạn được hỏi thiết kế hệ thống đặt vé xem phim. Có 100 ghế, 50.000 người cùng bấm mua vé VIP cuối cùng. Làm sao đảm bảo không bán trùng?',
      a: 'Đây là bài toán "lost update" kinh điển, và có ba tầng bảo vệ nên dùng <em>cùng nhau</em>: (1) <strong>Conditional UPDATE ở DB</strong> — <code>UPDATE seats SET status=\'sold\', order_id=? WHERE id=? AND status=\'available\'</code> rồi kiểm tra <code>rowsAffected</code>. Nếu 0 thì ghế đã bị người khác lấy. Đây là tầng đúng đắn cuối cùng, không bao giờ bỏ. (2) <strong>Reservation có TTL</strong> — khi user vào bước thanh toán, đánh dấu <code>held_until = now() + 10 phút</code>. Job hoặc lazy check giải phóng ghế hết hạn. Tránh việc giỏ hàng treo giữ ghế vĩnh viễn. (3) <strong>Giảm tải trước khi vào DB</strong> — Redis giữ tập ghế còn trống, dùng Lua script atomic để "giữ chỗ" tạm; chỉ ~100–200 request thắng mới thực sự chạm DB. 50.000 request còn lại nhận "hết vé" ngay từ Redis mà không tạo áp lực DB. Ngoài ra: đặt rate limit theo user (1 người không thể giữ 50 ghế), dùng hàng đợi ảo (virtual waiting room) để làm phẳng traffic, và <strong>không dùng distributed lock cho từng ghế</strong> — 100 lock cho 50.000 request là tự sát về latency và vẫn có thể sai. Câu chốt: "Tính đúng đắn ở DB bằng conditional update; Redis chỉ để giảm tải."'
    },
    {
      q: 'Hệ thống của bạn dùng Saga 4 bước. Bước 3 (trừ tiền) thành công, bước 4 (giao hàng) thất bại, và hành động bù trừ của bước 3 (hoàn tiền) cũng thất bại vì payment gateway đang down. Bạn xử lý thế nào?',
      a: 'Đây là tình huống Saga không hoàn tất được và không có câu trả lời "tự động" — phải thiết kế trước. Cách xử lý đúng: (1) <strong>Compensation phải retry vô hạn với backoff</strong> — không có giới hạn số lần, vì bỏ cuộc nghĩa là user mất tiền. Lưu trạng thái <code>compensation_pending</code> bền vững và một worker riêng liên tục thử lại. (2) <strong>Idempotent compensation</strong> — refund với idempotency key để retry 100 lần vẫn chỉ hoàn 1 lần. (3) <strong>Hàng đợi chết + cảnh báo người</strong> — nếu quá 15 phút, escalate cho đội vận hành/đối soát tài chính, không im lặng. (4) <strong>Đối soát định kỳ</strong> — job hằng ngày so khớp ledger với sao kê payment gateway, phát hiện giao dịch treo. (5) <strong>Thiết kế lại thứ tự bước</strong> — đây là bài học lớn nhất: đặt bước khó bù trừ nhất (trừ tiền) <em>sau cùng</em>, hoặc dùng mô hình "authorize → capture" của payment gateway: authorize giữ tiền (không trừ thật, hết hạn tự huỷ sau 7 ngày), chỉ capture khi mọi bước khác xong. Với thẻ tín dụng, authorize/capture là cách chuẩn để tránh đúng tình huống này. Câu chốt trong phỏng vấn: "Saga cần một job đối soát, nếu không thì không ai biết có giao dịch treo."'
    },
    {
      q: 'Bạn cần đảm bảo chỉ một instance chạy job tổng hợp báo cáo mỗi đêm. Có 5 instance. Chọn cơ chế nào và vì sao?',
      a: 'Ba lựa chọn theo thứ tự ưu tiên: (1) <strong>Leader election bằng etcd/Consul (Raft-based)</strong> — an toàn nhất, vì lease được gia hạn qua consensus, không bị split brain khi partition. etcd có <code>election</code> API sẵn; khi instance mất lease, instance khác tiếp quản trong vài giây. (2) <strong>SQL advisory lock / <code>FOR UPDATE SKIP LOCKED</code></strong> — nếu bạn đã có Postgres, dùng <code>pg_try_advisory_lock(key)</code> hoặc một bảng <code>jobs</code> với <code>SELECT ... FOR UPDATE SKIP LOCKED</code>. Đơn giản, không thêm hạ tầng, đủ tốt cho hầu hết nhu cầu. (3) <strong>Kubernetes CronJob với <code>concurrencyPolicy: Forbid</code></strong> — nếu chạy trên K8s, đây là cách gọn nhất; K8s đảm bảo không có 2 Job cùng tên chạy đồng thời. Tránh: Redis SETNX thuần (không an toàn dưới partition, có thể split brain), hoặc "kiểm tra bảng xem đã chạy chưa" (check-then-act, race condition). Thêm hai chi tiết thực tế: (a) job phải <strong>idempotent</strong> dù đã có lock — vì lock có thể hết hạn giữa lúc chạy, và lần chạy trước có thể đã ghi một phần; (b) đặt <strong>alert khi job không chạy</strong> trong 26 giờ — im lặng thất bại là kiểu lỗi tệ nhất.'
    },
    {
      q: 'Service A gọi B, C, D song song. B bình thường, C chậm 5 giây, D chết. Timeout của A là 10s. Điều gì xảy ra và bạn sửa thế nào?',
      a: 'Vấn đề: A chờ cả ba (hoặc chờ đến khi tất cả trả về). C mất 5s mỗi request, D mất 10s rồi timeout. Với 200 RPS và mỗi request giữ thread 10s, A cần 2.000 thread đồng thời — thread pool mặc định (200) đầy trong 1 giây, sau đó A <strong>từ chối toàn bộ</strong> request kể cả những request chỉ cần B. Cụ thể các sửa: (1) <strong>Timeout riêng cho từng dependency</strong>, không dùng chung 10s: B 200ms, C 500ms, D 300ms — đặt theo p99.9 của từng cái. (2) <strong>Circuit breaker cho D</strong>: sau ~20 lỗi, mở mạch, fail fast trong 30s, không giữ thread nào. (3) <strong>Bulkhead</strong>: pool riêng cho từng dependency, C chậm không ăn pool của B. (4) <strong>Graceful degradation</strong>: nếu D chết, A vẫn trả kết quả dựa trên B và C, chỉ thiếu phần của D (ví dụ "recommendation tạm không khả dụng") thay vì lỗi cả trang. (5) <strong>Đặt deadline tổng cho request</strong> (gRPC deadline / context timeout): nếu request đã dùng 800ms thì không bắt đầu thêm call nào, kể cả khi từng call riêng còn hạn. Điểm quan trọng nhất để nêu: "A phải chịu được việc mất một dependency, không chỉ chịu được việc dependency trả lỗi nhanh."'
    },
    {
      q: 'Trong phỏng vấn, bạn được hỏi "chọn CP hay AP?". Hãy trả lời trong 60 giây.',
      a: 'Câu trả lời tốt: "Trước hết, tôi không chọn một lần cho cả hệ thống — tôi chọn theo từng nhóm dữ liệu, vì P chỉ áp dụng khi có partition, và phần lớn thời gian hệ thống không có partition nên PACELC mới là câu hỏi thật. Cụ thể với hệ thống này: <strong>phần thanh toán và tồn kho tôi chọn CP</strong> — khi mất kết nối giữa hai region, tôi thà từ chối ghi và trả lỗi 503 có thể retry, còn hơn cho phép bán một chiếc áo cuối cùng hai lần. Tôi implement bằng một leader region cho writes + Raft giữa 3 AZ, và failover có fencing token để không split brain. <strong>Phần feed, like, view count tôi chọn AP</strong> — dữ liệu trễ 2 giây không ảnh hưởng ai, nhưng không thể để user không mở được app. Tôi dùng Cassandra/DynamoDB với W=1, R=1 và chấp nhận đọc bản cũ, có read repair nền. <strong>Hệ quả tôi phải chấp nhận</strong>: hai nhóm này không nhất quán với nhau — một order có thể xuất hiện trong feed trước khi inventory commit. Tôi xử lý bằng outbox + event để trạng thái cuối cùng hội tụ, và UI hiển thị trạng thái \'đang xử lý\' cho khoảng thời gian đó. Nếu đề bài cần nhất quán xuyên suốt, tôi sẽ nói rõ rằng chi phí tăng đáng kể và đề xuất thu hẹp phạm vi transaction."'
    },
    {
      q: 'Bạn phát hiện trong log có 0,1% request bị trừ tiền hai lần. Nguyên nhân có thể là gì và bạn điều tra theo thứ tự nào?',
      a: 'Điều tra theo thứ tự từ ngoài vào trong: (1) <strong>Kiểm tra retry</strong> — client/gateway/service có retry không, và API thanh toán có idempotency key không. Đây là nguyên nhân của ~80% trường hợp. Nếu không có key hoặc client sinh key mới mỗi lần retry, tìm ra ngay. (2) <strong>Kiểm tra timeout</strong> — nếu timeout < thời gian xử lý thật, request "thất bại" với client nhưng thực ra đã thành công ở server; client retry → trừ 2 lần. So khớp: log có pattern "timeout rồi có 1 success sau đó"? (3) <strong>Kiểm tra duplicate message</strong> — nếu thanh toán đi qua queue/Kafka, consumer có idempotent không? Có ai rebalance partition gây replay không? (4) <strong>Kiểm tra failover</strong> — có lần nào leader DB failover trong khung giờ đó không? Nếu có, transaction đã commit trên leader cũ nhưng không replicate, client retry,... (5) <strong>Kiểm tra code</strong> — có path nào gọi <code>charge()</code> hai lần (ví dụ vừa trong handler vừa trong callback)? Có async retry library tự động không? Về phòng ngừa: đặt <strong>unique constraint trên (order_id, charge_type)</strong> ở bảng payment — đây là lưới an toàn cuối cùng, DB sẽ từ chối lần trừ thứ hai. Thêm alert khi phát hiện 2 payment cho cùng order (dùng streaming job so khớp liên tục, không chờ đối soát cuối ngày). Con số 0,1% rất đáng chú ý: nếu là race condition thuần, tỉ lệ thường thấp hơn nhiều; 0,1% gợi ý một điều kiện cụ thể (một loại timeout, một loại lỗi mạng, hoặc một khung giờ) — hãy group log theo loại lỗi và theo phút để tìm pattern.'
    }
  ]
};

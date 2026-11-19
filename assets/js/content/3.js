/* ============================================================
   Module 3 — Dữ liệu & Lưu trữ
   ============================================================ */
window.SD_CONTENT = window.SD_CONTENT || {};
window.SD_CONTENT[3] = {
  title: 'Module 3 — Dữ liệu & Lưu trữ',
  lead: 'Trong phỏng vấn, câu hỏi <em>"dữ liệu này lưu ở đâu?"</em> xuất hiện sớm hơn mọi câu hỏi về scale. Chọn sai storage thì mọi thứ phía sau — replication, sharding, caching — đều là vá víu. Module này đi từ <span class="kw">cơ chế bên trong</span> (B+ tree, LSM tree) đến <span class="kw-y">hệ quả vận hành</span> (replication lag, quorum, hotspot) để bạn chọn đúng và bảo vệ được lựa chọn đó bằng số liệu.',

  keywords: [
    { term: 'B+ tree', def: 'Cây cân bằng nhiều nhánh, mỗi node là một page 8–16KB, giá trị nằm ở leaf và các leaf nối nhau bằng linked list. Cập nhật tại chỗ (in-place) nên read rất ổn định O(log n), nhưng write là random I/O. Dùng trong Postgres, MySQL InnoDB, SQL Server.' },
    { term: 'LSM tree', def: 'Log-Structured Merge tree: ghi vào memtable + WAL, đầy thì flush thành SSTable bất biến, nền chạy compaction gộp các SSTable. Write tuần tự rất nhanh, read phải tra nhiều tầng nên cần bloom filter. Dùng trong RocksDB, Cassandra, ScyllaDB, HBase.' },
    { term: 'Write amplification', def: 'Số byte thực sự ghi xuống disk cho mỗi byte dữ liệu logic. LSM leveled compaction có thể 10–30×, B+ tree ~2–3× (data + WAL + index). Ảnh hưởng trực tiếp tuổi thọ SSD và throughput ghi.' },
    { term: 'Compaction', def: 'Tiến trình nền gộp SSTable, xoá bản ghi trùng/tombstone. Size-tiered (gộp file cùng cỡ) rẻ nhưng space amp cao; leveled (mỗi level gấp 10× level trước) read tốt hơn nhưng write amp cao.' },
    { term: 'Bloom filter', def: 'Cấu trúc bit xác suất trả lời "key này chắc chắn không có" hoặc "có thể có". Giúp LSM bỏ qua hàng chục SSTable khi đọc, đổi 1% false positive lấy ~10 bit/key.' },
    { term: 'Tombstone', def: 'Bản ghi đánh dấu đã xoá. Trong LSM, delete không xoá ngay mà ghi tombstone; dữ liệu chỉ biến mất sau compaction. Đây là lý do "xoá 1TB" đôi khi còn tốn thời gian hơn ghi.' },
    { term: 'Composite index & leftmost prefix', def: 'Index trên nhiều cột (a, b, c) sắp xếp theo a rồi b rồi c. Chỉ dùng được khi điều kiện bắt đầu từ cột trái nhất: WHERE a=? ✓, WHERE a=? AND b=? ✓, WHERE b=? ✗.' },
    { term: 'Covering index', def: 'Index chứa đủ mọi cột mà query cần, nên engine trả kết quả ngay từ index mà không đọc bảng (index-only scan). Nhanh hơn nhiều lần, đổi lại index to hơn và ghi chậm hơn.' },
    { term: 'Replication lag', def: 'Độ trễ giữa lúc leader commit và lúc follower áp dụng xong. Gây ra bất nhất quán đọc: user vừa ghi đã không thấy dữ liệu của mình. Đo bằng seconds_behind_master hoặc LSN/GTID gap.' },
    { term: 'Read-your-writes', def: 'Đảm bảo user luôn đọc được ghi của chính mình. Cách làm: route read của user đó về leader trong N giây sau khi ghi, hoặc lưu LSN mới nhất vào session và chỉ đọc replica đã vượt LSN đó.' },
    { term: 'Quorum R + W > N', def: 'Với N replica, ghi vào W node và đọc từ R node. Nếu R + W > N thì tập đọc và tập ghi luôn giao nhau ít nhất 1 node, nên đọc thấy bản ghi mới nhất. Với N=3: W=2, R=2.' },
    { term: 'Read repair & hinted handoff', def: 'Read repair: khi đọc thấy replica trả version cũ, ghi bản mới trở lại. Hinted handoff: node down thì node khác giữ "hint" và gửi lại khi node kia sống. Cả hai để chống lệch dữ liệu mà không cần consensus.' },
    { term: 'Sharding & hotspot', def: 'Chia dữ liệu theo key sang nhiều node. Hotspot xảy ra khi một key/prefix chiếm phần lớn lưu lượng (celebrity, ID tăng dần). Sửa bằng salt key, composite key, hoặc tách riêng shard cho key nóng.' },
    { term: 'CDC (Change Data Capture)', def: 'Đọc log thay đổi của DB (Postgres WAL, MySQL binlog) và phát thành stream. Không cần dual-write, không bỏ sót, có thứ tự — nền tảng để đồng bộ search index, cache, data warehouse.' }
  ],

  sections: [
    {
      id: 'overview', num: '3.1', title: 'Chọn đúng loại storage — bản đồ quyết định',
      html: `
        <p>Câu hỏi đầu tiên không phải "SQL hay NoSQL" mà là <span class="kw">"truy vấn sẽ trông như thế nào?"</span>. Người mới hay chọn storage theo độ hot của công nghệ; người có kinh nghiệm chọn theo <em>access pattern</em> và <em>tính chất nhất quán</em> mà nghiệp vụ chịu được.</p>

        <h3>Mười loại storage và vùng sử dụng thật</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Loại</th><th>Ví dụ</th><th>Mô hình dữ liệu</th><th>Dùng khi</th><th>Tránh khi</th></tr></thead>
            <tbody>
              <tr><td><strong>Relational (OLTP)</strong></td><td>PostgreSQL, MySQL</td><td>Bảng + ràng buộc + JOIN</td><td>Cần transaction, quan hệ phức tạp, báo cáo ad-hoc</td><td>Ghi &gt; 100k/s liên tục, dữ liệu phi cấu trúc</td></tr>
              <tr><td><strong>Document</strong></td><td>MongoDB, Couchbase</td><td>JSON lồng nhau</td><td>Schema thay đổi, đọc nguyên object theo id</td><td>Cần JOIN nhiều bảng, transaction nhiều document</td></tr>
              <tr><td><strong>Wide-column</strong></td><td>Cassandra, ScyllaDB, HBase</td><td>Row key → cột động</td><td>Ghi cực lớn, multi-DC, time-series theo key</td><td>Cần query linh hoạt, ad-hoc, aggregate phức tạp</td></tr>
              <tr><td><strong>Key-Value</strong></td><td>Redis, DynamoDB, etcd</td><td>key → value</td><td>Lookup O(1), session, cache, counter, lock</td><td>Cần scan theo range, cần nhiều index</td></tr>
              <tr><td><strong>Object / Blob</strong></td><td>S3, GCS, MinIO</td><td>Object bất biến + metadata</td><td>Ảnh, video, backup, log archive, data lake</td><td>Cần sửa 1 phần file, cần latency &lt; 10ms</td></tr>
              <tr><td><strong>Time-series</strong></td><td>TimescaleDB, InfluxDB, Prometheus</td><td>timestamp + tag + value</td><td>Metric, IoT, monitoring, downsampling</td><td>Dữ liệu có update, cần join phức tạp</td></tr>
              <tr><td><strong>Search index</strong></td><td>Elasticsearch, OpenSearch, Meilisearch</td><td>Inverted index + document</td><td>Full-text, fuzzy, facet, relevance ranking</td><td>Nguồn dữ liệu gốc (source of truth)</td></tr>
              <tr><td><strong>Graph</strong></td><td>Neo4j, Neptune</td><td>Node + edge có thuộc tính</td><td>Quan hệ sâu nhiều tầng (bạn của bạn, fraud ring)</td><td>Dữ liệu dạng bảng đơn giản, volume cực lớn</td></tr>
              <tr><td><strong>OLAP / Columnar</strong></td><td>ClickHouse, DuckDB, Snowflake, BigQuery</td><td>Cột, nén, vector hoá</td><td>Analytics scan hàng tỷ dòng, dashboard</td><td>Point update, transaction, độ trễ thấp từng dòng</td></tr>
              <tr><td><strong>Vector</strong></td><td>pgvector, Pinecone, Qdrant</td><td>Embedding + ANN index (HNSW/IVF)</td><td>Semantic search, RAG, recommendation</td><td>Cần lọc chính xác tuyệt đối theo điều kiện phức tạp</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 720 350" role="img" aria-label="Sơ đồ ánh xạ access pattern sang loại storage phù hợp">
            <defs>
              <marker id="m3a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="140" width="150" height="72" rx="10" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="91" y="168" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">Access pattern</text>
            <text x="91" y="188" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">(câu hỏi thật sự)</text>

            <path d="M166,176 C230,176 240,48 300,48" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3a)"/>
            <path d="M166,176 C230,176 240,132 300,132" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3a)"/>
            <path d="M166,176 C230,176 240,216 300,216" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3a)"/>
            <path d="M166,176 C230,176 240,300 300,300" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3a)"/>

            <rect x="300" y="20" width="404" height="58" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="316" y="42" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Lookup theo id, không cần JOIN</text>
            <text x="316" y="62" font-family="JetBrains Mono, monospace" font-size="11" fill="#505a68">→ KV (Redis/DynamoDB) hoặc Document</text>

            <rect x="300" y="104" width="404" height="58" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="316" y="126" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Quan hệ + ràng buộc + transaction</text>
            <text x="316" y="146" font-family="JetBrains Mono, monospace" font-size="11" fill="#505a68">→ Relational (Postgres/MySQL)</text>

            <rect x="300" y="188" width="404" height="58" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="316" y="210" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Append liên tục theo thời gian</text>
            <text x="316" y="230" font-family="JetBrains Mono, monospace" font-size="11" fill="#505a68">→ Time-series / Wide-column</text>

            <rect x="300" y="272" width="404" height="58" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="316" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Tìm theo từ khoá / ngữ nghĩa</text>
            <text x="316" y="314" font-family="JetBrains Mono, monospace" font-size="11" fill="#505a68">→ Search index / Vector DB</text>
          </svg>
          <div class="diagram-cap">Hình 3.1 — Bốn nhóm access pattern chiếm ~90% quyết định chọn storage</div>
        </div>

        <h3>Năm câu hỏi phải trả lời trước khi chọn</h3>
        <ol class="list-num">
          <li><strong>Tỉ lệ đọc/ghi là bao nhiêu?</strong> 100:1 (đọc nhiều) thiên về B+ tree + cache + read replica. 1:100 (ghi nhiều) thiên về LSM tree.</li>
          <li><strong>Cần nhất quán mức nào?</strong> Trừ tiền, tồn kho: cần strong consistency, ưu tiên DB quan hệ có transaction. Đếm view, gợi ý sản phẩm: eventual consistency được.</li>
          <li><strong>Có cần transaction nhiều entity không?</strong> Nếu có, SQL gần như bắt buộc — hoặc phải tự xây Saga (Module 4).</li>
          <li><strong>Query có biết trước không?</strong> NoSQL yêu cầu biết trước access pattern để thiết kế partition key. Nếu cần ad-hoc query, SQL/OLAP.</li>
          <li><strong>Dung lượng và tốc độ tăng?</strong> 10GB tăng 1GB/năm thì một Postgres là đủ trong nhiều năm. 10TB tăng 1TB/ngày thì phải nghĩ khác.</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Polyglot persistence — đúng nhưng đắt</div>
            <p>Dùng nhiều loại storage cho từng nhu cầu là hợp lý về kỹ thuật, nhưng mỗi loại thêm vào là thêm một hệ thống phải vận hành, backup, nâng cấp, monitoring, và <strong>thêm một nguồn bất nhất quán</strong> (đồng bộ giữa chúng ra sao?). Trong phỏng vấn, hãy nêu 2–3 loại có lý do rõ ràng thay vì liệt kê 7 loại. Nếu chưa có lý do chính đáng, <span class="kw">bắt đầu bằng PostgreSQL</span>: nó có JSONB, full-text search, geo (PostGIS), queue nhẹ, và cả vector (pgvector) — đủ xa trước khi cần hệ chuyên dụng.</p>
          </div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Câu nói ghi điểm</div>
            <p>"Tôi bắt đầu với một Postgres có read replica vì access pattern chưa rõ và dữ liệu còn nhỏ. Khi write vượt ~50k/s hoặc bảng vượt ~2TB, tôi sẽ tách phần append-only sang wide-column, và phần search sang Elasticsearch đồng bộ qua CDC. Việc tách này không đổi API, chỉ đổi implementation." — thể hiện bạn biết <em>ngưỡng</em> chứ không chỉ biết tên công nghệ.</p>
          </div>
        </div>`
    },

    {
      id: 'storage-engines', num: '3.2', title: 'B+ tree vs LSM tree — vì sao chọn engine lại quan trọng đến vậy',
      html: `
        <p>Hầu hết mọi cơ sở dữ liệu bạn dùng đều dựa trên một trong hai cấu trúc lưu trữ này. Hiểu chúng, bạn giải thích được <span class="kw">tại sao Cassandra ghi nhanh hơn Postgres 10 lần</span> nhưng đọc point-lookup lại chậm hơn, và tại sao "xoá dữ liệu" trong LSM lại là một câu chuyện dài.</p>

        <h3>B+ tree: cập nhật tại chỗ</h3>
        <p>Dữ liệu được tổ chức thành các <span class="kw">page</span> 8KB (Postgres) hoặc 16KB (InnoDB). Mỗi page chứa nhiều key đã sắp xếp và con trỏ tới page con. Với fanout ~500 (mỗi page 16KB chứa ~500 cặp key+pointer 32 byte), chỉ cần <strong>4 tầng</strong> là lưu được 500⁴ ≈ 62,5 tỷ bản ghi. Chiều cao cây thấp như vậy nghĩa là mỗi lookup chỉ 3–4 lần đọc page — và tầng trên cùng gần như luôn nằm trong buffer pool.</p>
        <ul class="list-bullet">
          <li><strong>Ghi:</strong> tìm đúng page chứa key, sửa tại chỗ, ghi lại page. Đây là <span class="kw-r">random write</span> — trên HDD là ~5ms, trên SSD là ~0,1ms nhưng vẫn tốn IOPS. Trước khi sửa, mọi thay đổi được ghi vào <strong>WAL</strong> tuần tự để phục hồi sau crash.</li>
          <li><strong>Đọc:</strong> đúng O(log n) page read, độ trễ <em>ổn định</em> và dự đoán được. Đây là lý do B+ tree được chọn cho OLTP có SLA p99 nghiêm ngặt.</li>
          <li><strong>Range scan:</strong> rất tốt — các leaf page nối nhau bằng linked list, nên <code>WHERE created_at BETWEEN ...</code> chỉ cần tìm điểm bắt đầu rồi đi tiếp.</li>
          <li><strong>Nhược điểm:</strong> mỗi lần ghi phải chạm 1 page ngẫu nhiên; page bị phân mảnh sau nhiều update; index và data tranh nhau buffer pool.</li>
        </ul>

        <h3>LSM tree: chỉ ghi tuần tự</h3>
        <p>Ý tưởng cốt lõi: <span class="kw-y">không bao giờ sửa dữ liệu tại chỗ</span>. Mọi thứ là append.</p>
        <ol class="list-num">
          <li>Ghi vào <strong>WAL</strong> (tuần tự, nhanh) để không mất dữ liệu khi crash.</li>
          <li>Ghi vào <strong>memtable</strong> — cấu trúc trong RAM, thường là skiplist để giữ thứ tự.</li>
          <li>Memtable đầy (~64MB) → flush thành một <strong>SSTable</strong> (Sorted String Table) bất biến ở level 0. File mới không ghi đè file cũ.</li>
          <li>Tiến trình nền <strong>compaction</strong> gộp các SSTable, xoá bản ghi trùng và tombstone, đẩy dữ liệu xuống level sâu hơn.</li>
        </ol>

        <div class="diagram">
          <svg viewBox="0 0 760 380" role="img" aria-label="Luồng ghi và đọc của LSM tree với memtable, WAL, các level SSTable và bloom filter">
            <defs>
              <marker id="m3b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="20" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#8b95a3">WRITE PATH</text>

            <rect x="20" y="36" width="96" height="50" rx="8" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="68" y="66" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#151515">write</text>

            <rect x="152" y="36" width="120" height="50" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="212" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">WAL</text>
            <text x="212" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">append, tuần tự</text>

            <rect x="308" y="36" width="130" height="50" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="373" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">memtable</text>
            <text x="373" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">skiplist trong RAM</text>

            <rect x="474" y="36" width="120" height="50" rx="8" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="534" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">L0 SST</text>
            <text x="534" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">flush khi đầy</text>

            <rect x="630" y="36" width="110" height="50" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="685" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">L1 → L2</text>
            <text x="685" y="74" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">compaction</text>

            <path d="M116,61 L150,61" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>
            <path d="M272,61 L306,61" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>
            <path d="M438,61 L472,61" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>
            <path d="M594,61 L628,61" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>

            <line x1="20" y1="112" x2="740" y2="112" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>
            <text x="20" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#8b95a3">READ PATH — dừng ở tầng đầu tiên tìm thấy key</text>

            <rect x="20" y="150" width="120" height="46" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="80" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">1. memtable</text>

            <rect x="168" y="150" width="120" height="46" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="228" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">2. L0 (mới→cũ)</text>

            <rect x="316" y="150" width="120" height="46" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="376" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">3. L1</text>

            <rect x="464" y="150" width="120" height="46" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="524" y="178" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">4. L2 …</text>

            <rect x="612" y="150" width="128" height="46" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="676" y="172" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="11" font-weight="700" fill="#151515">5. không thấy</text>
            <text x="676" y="187" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">→ trả về NOT FOUND</text>

            <path d="M140,173 L166,173" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>
            <path d="M288,173 L314,173" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>
            <path d="M436,173 L462,173" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>
            <path d="M584,173 L610,173" stroke="#505a68" stroke-width="2" marker-end="url(#m3b)"/>

            <rect x="20" y="228" width="720" height="60" rx="9" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="38" y="252" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Bloom filter cho mỗi SSTable</text>
            <text x="38" y="272" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">~10 bit/key, false positive ~1% → bỏ qua hầu hết SSTable mà không cần đọc disk. Không có bloom filter, LSM đọc sẽ chậm hơn B+ tree rõ rệt.</text>

            <rect x="20" y="304" width="352" height="60" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="38" y="326" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Delete = tombstone</text>
            <text x="38" y="346" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">Ghi dấu "đã xoá"; dữ liệu biến mất sau compaction.</text>

            <rect x="388" y="304" width="352" height="60" rx="9" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="406" y="326" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Update = append bản mới</text>
            <text x="406" y="346" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">Bản mới nhất thắng nhờ số sequence tăng dần.</text>
          </svg>
          <div class="diagram-cap">Hình 3.2 — LSM tree: ghi chỉ append, đọc phải tra nhiều tầng, delete chỉ là tombstone</div>
        </div>

        <h3>Ba loại amplification — ngôn ngữ chung để so sánh engine</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Amplification</th><th>Định nghĩa</th><th>B+ tree</th><th>LSM tree</th></tr></thead>
            <tbody>
              <tr><td><strong>Write amp</strong></td><td>Byte ghi xuống disk / byte dữ liệu logic</td><td>~2–3× (data + WAL + index)</td><td>10–30× với leveled compaction; 4–10× với size-tiered</td></tr>
              <tr><td><strong>Read amp</strong></td><td>Số page/đơn vị đọc phải chạm để trả 1 query</td><td>~1–4 (chiều cao cây), ổn định</td><td>1 + số SSTable phải kiểm tra; giảm mạnh nhờ bloom filter + block cache</td></tr>
              <tr><td><strong>Space amp</strong></td><td>Disk thực dùng / dữ liệu logic</td><td>~1,1–2× (page trống, bloat)</td><td>~1,1× (leveled) đến 2× (size-tiered); tăng tạm khi có tombstone chờ compaction</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Compaction không miễn phí</div>
            <p>Compaction chạy nền và tranh IOPS với traffic thật. Đây là lý do một cluster Cassandra "đang chạy tốt" có thể đột nhiên p99 tăng vọt khi compaction debt tích tụ. Dấu hiệu: <code>pending compaction bytes</code> tăng liên tục, write latency tăng. Cách xử lý: thêm node, giới hạn throughput ghi, hoặc chọn chiến lược compaction phù hợp workload (<code>LeveledCompactionStrategy</code> cho read-heavy, <code>SizeTieredCompactionStrategy</code> cho write-heavy, <code>TimeWindowCompactionStrategy</code> cho time-series có TTL).</p>
          </div>
        </div>

        <h3>Chọn engine theo workload — bảng quyết định</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Workload</th><th>Chọn</th><th>Lý do</th></tr></thead>
            <tbody>
              <tr><td>OLTP, transaction, query linh hoạt</td><td><strong>B+ tree</strong> (Postgres/MySQL)</td><td>Read ổn định, range scan tốt, JOIN, MVCC</td></tr>
              <tr><td>Ghi log/metric ~500k/s, time-series có TTL</td><td><strong>LSM</strong> (Cassandra/ScyllaDB)</td><td>Ghi tuần tự, TTL xoá theo time window, không cần transaction</td></tr>
              <tr><td>KV store cực lớn, multi-DC active-active</td><td><strong>LSM</strong> (RocksDB-based)</td><td>Compaction theo level, replica cùng ghi được</td></tr>
              <tr><td>Bảng 50GB, 2000 QPS, team 3 người</td><td><strong>B+ tree</strong></td><td>LSM chỉ đáng khi volume/lưu lượng lớn; vận hành compaction là gánh nặng thật</td></tr>
              <tr><td>Đếm counter cực nhanh, TTL</td><td>In-memory (Redis)</td><td>Không cần disk path; nhưng phải chấp nhận mất dữ liệu khi restart nếu không bật AOF</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Đừng chọn engine theo benchmark trên blog</div>
            <p>Benchmark thường đo <strong>throughput trung bình</strong> với workload tổng hợp, không đo <strong>p99 dưới compaction debt</strong>, không đo hành vi khi một node chết, không đo chi phí vận hành của team bạn. Một con số bạn nên có trong đầu: nếu workload của bạn dưới ~20k write/s và dataset dưới ~1TB, B+ tree với tuning đúng gần như luôn thắng về tổng chi phí sở hữu.</p>
          </div>
        </div>`
    },

    {
      id: 'indexing', num: '3.3', title: 'Index — thứ quyết định query nhanh hay sập',
      html: `
        <p>Index là một B+ tree riêng, ánh xạ <em>giá trị cột</em> → <em>vị trí dòng</em>. Không có index, mọi <code>WHERE</code> là full table scan. Nhưng <span class="kw-r">mỗi index làm chậm ghi</span> và tốn disk — nên index là bài toán đánh đổi, không phải "càng nhiều càng tốt".</p>

        <h3>Composite index và quy tắc tiền tố trái nhất</h3>
        <p>Index trên <code>(last_name, first_name, age)</code> được sắp xếp giống như một cuốn danh bạ: trước hết theo <code>last_name</code>, trong cùng <code>last_name</code> thì theo <code>first_name</code>, rồi mới đến <code>age</code>. Hệ quả: bạn <strong>chỉ</strong> tra được khi điều kiện bắt đầu từ cột trái nhất.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 340" role="img" aria-label="Minh hoạ composite index và quy tắc tiền tố trái nhất với ba truy vấn">
            <defs>
              <marker id="m3c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="20" y="20" width="330" height="46" rx="8" fill="#151515" stroke="#151515" stroke-width="2"/>
            <text x="185" y="49" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#f4d77c">INDEX (last_name, first_name, age)</text>

            <rect x="20" y="80" width="330" height="34" rx="6" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="32" y="102" font-family="JetBrains Mono, monospace" font-size="11" fill="#151515">An      | Bình   | 28</text>
            <rect x="20" y="118" width="330" height="34" rx="6" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="32" y="140" font-family="JetBrains Mono, monospace" font-size="11" fill="#151515">An      | Bình   | 35</text>
            <rect x="20" y="156" width="330" height="34" rx="6" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="32" y="178" font-family="JetBrains Mono, monospace" font-size="11" fill="#151515">An      | Chi    | 30</text>
            <rect x="20" y="194" width="330" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="32" y="216" font-family="JetBrains Mono, monospace" font-size="11" fill="#151515">Bình    | An     | 41</text>
            <rect x="20" y="232" width="330" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="32" y="254" font-family="JetBrains Mono, monospace" font-size="11" fill="#151515">Bình    | Dũng   | 25</text>
            <rect x="20" y="270" width="330" height="34" rx="6" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="32" y="292" font-family="JetBrains Mono, monospace" font-size="11" fill="#151515">Cường   | An     | 33</text>

            <text x="20" y="326" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#8b95a3">Sắp xếp: last_name → first_name → age</text>

            <rect x="392" y="20" width="348" height="92" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="408" y="44" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">✓ DÙNG ĐƯỢC INDEX</text>
            <text x="408" y="66" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">WHERE last_name = 'An'</text>
            <text x="408" y="84" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">WHERE last_name = 'An'</text>
            <text x="408" y="100" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">  AND first_name = 'Bình'</text>

            <rect x="392" y="124" width="348" height="76" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="408" y="148" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">✗ KHÔNG DÙNG ĐƯỢC (full scan)</text>
            <text x="408" y="170" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">WHERE first_name = 'Bình'</text>
            <text x="408" y="188" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">WHERE age = 30</text>

            <rect x="392" y="212" width="348" height="92" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="408" y="236" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">~ DÙNG ĐƯỢC MỘT PHẦN</text>
            <text x="408" y="258" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">WHERE last_name = 'An' AND age = 30</text>
            <text x="408" y="278" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Chỉ lọc được theo last_name;</text>
            <text x="408" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">age phải kiểm tra sau (filter).</text>
          </svg>
          <div class="diagram-cap">Hình 3.3 — Cùng một index, ba truy vấn cho ba kết quả hoàn toàn khác nhau</div>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Thứ tự cột trong composite index</div>
            <p>Đặt cột dùng cho <strong>đẳng thức</strong> (<code>=</code>) trước, cột dùng cho <strong>range</strong> (<code>&gt;</code>, <code>&lt;</code>, <code>BETWEEN</code>) sau, cột có <strong>selectivity cao</strong> trước. Nhưng quy tắc "trái nhất" quan trọng hơn selectivity: index <code>(status, created_at)</code> dùng được cho <code>WHERE status='open' ORDER BY created_at</code> dù <code>status</code> chỉ có 3 giá trị. Nếu bạn cần cả hai kiểu query, tạo hai index — đó là chuyện bình thường.</p>
          </div>
        </div>

        <h3>Covering index — đọc mà không cần chạm bảng</h3>
        <p>Với index thường, engine tìm được vị trí dòng trong index rồi phải <strong>nhảy về bảng chính</strong> (random I/O) để lấy các cột còn lại. Nếu index chứa đủ mọi cột mà query cần, bước nhảy đó biến mất.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Query gốc: cần id, email, created_at</span>
<span class="c-key">SELECT</span> id, email, created_at <span class="c-key">FROM</span> users <span class="c-key">WHERE</span> email = <span class="c-str">'a@b.com'</span>;

<span class="c-com">-- Index thường: index scan (email) + heap fetch để lấy id, created_at</span>
<span class="c-key">CREATE INDEX</span> idx_users_email <span class="c-key">ON</span> users(email);

<span class="c-com">-- Covering index: mọi cột đã nằm trong index → index-only scan</span>
<span class="c-key">CREATE INDEX</span> idx_users_email_cover <span class="c-key">ON</span> users(email) <span class="c-key">INCLUDE</span> (id, created_at);

<span class="c-com">-- Kiểm tra: "Index Only Scan" trong output là dấu hiệu tốt</span>
<span class="c-key">EXPLAIN</span> (<span class="c-key">ANALYZE</span>, buffers)
<span class="c-key">SELECT</span> id, email, created_at <span class="c-key">FROM</span> users <span class="c-key">WHERE</span> email = <span class="c-str">'a@b.com'</span>;</code></pre>
        </div>

        <h3>Bốn loại index nên biết</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Loại</th><th>Công dụng</th><th>Ví dụ</th></tr></thead>
            <tbody>
              <tr><td><strong>B-tree (mặc định)</strong></td><td>Đẳng thức, range, ORDER BY, prefix LIKE</td><td><code>WHERE created_at &gt; now() - interval '7 days'</code></td></tr>
              <tr><td><strong>Partial index</strong></td><td>Chỉ index một phần bảng — nhỏ, nhanh, ít tốn ghi</td><td><code>CREATE INDEX ... WHERE status = 'pending'</code></td></tr>
              <tr><td><strong>Hash</strong></td><td>Chỉ đẳng thức; nhỏ hơn B-tree nhưng không range được</td><td><code>WHERE session_id = ?</code> (UUID ngẫu nhiên)</td></tr>
              <tr><td><strong>GIN / GiST</strong></td><td>Mảng, JSONB, full-text, geo</td><td><code>WHERE tags @&gt; ARRAY['sale']</code></td></tr>
            </tbody>
          </table>
        </div>

        <h3>Khi nào index "không chạy" — bảy cái bẫy</h3>
        <ol class="list-num">
          <li><strong>Bọc cột trong function:</strong> <code>WHERE date(created_at) = '2024-01-01'</code> không dùng được index thường. Sửa: <code>WHERE created_at &gt;= '2024-01-01' AND created_at &lt; '2024-01-02'</code>.</li>
          <li><strong>LIKE bắt đầu bằng %:</strong> <code>LIKE '%abc'</code> không dùng B-tree. Dùng trigram index hoặc search engine.</li>
          <li><strong>Lệch kiểu dữ liệu:</strong> cột <code>user_id</code> kiểu BIGINT nhưng query so với chuỗi → Postgres có thể cast cột thay vì cast literal.</li>
          <li><strong>Selectivity quá thấp:</strong> <code>WHERE is_active = true</code> trên bảng 99% true — planner đúng khi chọn full scan.</li>
          <li><strong>Thống kê cũ:</strong> sau bulk insert, <code>ANALYZE</code> chưa chạy → planner ước lượng sai. Đặt autovacuum đúng.</li>
          <li><strong>OR trên hai cột khác index:</strong> <code>WHERE a = 1 OR b = 2</code> thường thành bitmap OR hoặc full scan. Cân nhắc hai query + UNION.</li>
          <li><strong>ORDER BY khác hướng index:</strong> index <code>(a ASC, b ASC)</code> không giúp <code>ORDER BY a ASC, b DESC</code> — trừ khi tạo index đúng chiều.</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Chi phí ghi của index — con số cụ thể</div>
            <p>Bảng <code>orders</code> có 6 index. Mỗi <code>INSERT</code> phải ghi 1 dòng bảng + 6 mục index = <strong>7 random writes</strong> (trước khi tính WAL). Trên SSD 10k IOPS, throughput ghi lý thuyết ~1.400 insert/s. Bỏ 3 index không dùng, throughput tăng gấp đôi. Trong phỏng vấn, nếu được hỏi "tại sao ghi chậm", hãy kiểm tra số index trước khi đổ lỗi cho disk.</p>
          </div>
        </div>`
    },

    {
      id: 'replication', num: '3.4', title: 'Replication — nhân bản dữ liệu và cái giá của độ trễ',
      html: `
        <p>Replication giải ba bài toán cùng lúc: <span class="kw">sẵn sàng cao</span> (node chết vẫn còn bản khác), <span class="kw">scale đọc</span> (nhiều replica cùng phục vụ), và <span class="kw">giảm latency địa lý</span> (replica gần user). Nhưng nó tạo ra bài toán mới khó hơn: <span class="kw-r">replication lag</span>.</p>

        <h3>Ba mô hình replication</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mô hình</th><th>Cách hoạt động</th><th>Ưu</th><th>Nhược</th><th>Dùng ở</th></tr></thead>
            <tbody>
              <tr><td><strong>Single-leader</strong></td><td>Mọi ghi vào leader; follower replay log</td><td>Đơn giản, không xung đột, dễ suy luận</td><td>Leader là điểm nghẽn ghi; failover cần bầu chọn</td><td>Postgres, MySQL, MongoDB, SQL Server (mặc định)</td></tr>
              <tr><td><strong>Multi-leader</strong></td><td>Nhiều node cùng nhận ghi, đồng bộ chéo</td><td>Ghi ở gần user, chịu được mất DC</td><td>Phải giải quyết xung đột (LWW, CRDT); thứ tự ghi không toàn cục</td><td>Multi-region active-active, CouchDB, mobile sync</td></tr>
              <tr><td><strong>Leaderless</strong></td><td>Client ghi thẳng vào nhiều replica, dùng quorum</td><td>Không có SPOF, sẵn sàng cao nhất</td><td>Client phức tạp hơn; đọc cần đọc sửa</td><td>Cassandra, DynamoDB, Riak</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Đồng bộ hay bất đồng bộ?</h3>
        <p>Đây là câu hỏi mà rất nhiều ứng viên trả lời sai. Câu trả lời đúng là: <strong>cả hai, tùy giai đoạn</strong>.</p>
        <ul class="list-bullet">
          <li><span class="kw">Synchronous:</span> leader chờ follower xác nhận rồi mới trả OK cho client. Không mất dữ liệu khi leader chết. Nhưng nếu follower chậm hoặc chết, <strong>toàn bộ ghi bị chặn</strong> — biến replica thành SPOF mới. MySQL semi-sync có <code>rpl_semi_sync_source_timeout</code> để tự chuyển về async sau N ms.</li>
          <li><span class="kw">Asynchronous:</span> leader trả OK ngay, follower đuổi theo sau. Latency ghi thấp, chịu được follower chậm. Nhưng nếu leader chết trước khi replicate, <span class="kw-r">mất dữ liệu đã báo thành công</span> — điều tệ nhất có thể xảy ra với người dùng.</li>
          <li><span class="kw-y">Semi-sync (thực dụng nhất):</span> 1 follower sync + N follower async. Bạn mất tối đa 0 dữ liệu ở điều kiện bình thường, và vẫn scale đọc được. Đây là cấu hình nên đề xuất trong phỏng vấn.</li>
        </ul>

        <div class="diagram">
          <svg viewBox="0 0 760 340" role="img" aria-label="Sơ đồ single-leader replication với một follower đồng bộ, một follower trễ và các dị thường đọc">
            <defs>
              <marker id="m3d" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
              <marker id="m3dr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#ef4444"/>
              </marker>
            </defs>
            <rect x="286" y="24" width="180" height="66" rx="9" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="376" y="50" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">LEADER (primary)</text>
            <text x="376" y="70" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">nhận mọi write, append WAL</text>

            <rect x="52" y="168" width="180" height="66" rx="9" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="142" y="194" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Follower A (sync)</text>
            <text x="142" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">lag ≈ 0 ms</text>

            <rect x="290" y="168" width="180" height="66" rx="9" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="380" y="194" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Follower B (async)</text>
            <text x="380" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">lag ≈ 200 ms</text>

            <rect x="528" y="168" width="180" height="66" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="618" y="194" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Follower C (async)</text>
            <text x="618" y="214" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">lag ≈ 4 s ← đang tụt</text>

            <path d="M330,90 L180,166" stroke="#505a68" stroke-width="2" marker-end="url(#m3d)"/>
            <path d="M376,90 L380,166" stroke="#505a68" stroke-width="2" marker-end="url(#m3d)"/>
            <path d="M422,90 L580,166" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#m3dr)"/>

            <text x="188" y="122" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">ack trước khi trả OK</text>
            <text x="404" y="128" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">replay WAL</text>
            <text x="500" y="112" font-family="JetBrains Mono, monospace" font-size="10" fill="#ef4444">replay chậm (I/O, mạng)</text>

            <rect x="52" y="262" width="656" height="58" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="70" y="286" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Hệ quả với người dùng</text>
            <text x="70" y="306" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">User cập nhật avatar → ghi vào leader → load balancer đẩy request đọc kế tiếp sang Follower C → thấy avatar cũ → tưởng hệ thống lỗi.</text>
          </svg>
          <div class="diagram-cap">Hình 3.4 — Lag không phải lỗi cấu hình, nó là tính chất của replication bất đồng bộ</div>
        </div>

        <h3>Ba dị thường do lag và cách khắc phục</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Dị thường</th><th>Triệu chứng người dùng</th><th>Cách khắc phục</th></tr></thead>
            <tbody>
              <tr><td><strong>Read-your-writes</strong></td><td>Vừa lưu profile, refresh đã thấy dữ liệu cũ</td><td>Route read của user đó về leader trong ~2–5s sau ghi; hoặc lưu LSN vào cookie/session và chỉ đọc replica đã vượt LSN đó</td></tr>
              <tr><td><strong>Monotonic reads</strong></td><td>Refresh nhiều lần: lúc thấy comment mới, lúc lại mất</td><td>Ghim user vào một replica cố định (sticky theo user_id hash) thay vì round-robin</td></tr>
              <tr><td><strong>Consistent prefix</strong></td><td>Thấy câu trả lời trước khi thấy câu hỏi</td><td>Đảm bảo các bản ghi liên quan đi cùng partition (cùng key) nên được replay đúng thứ tự</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-info">
          <div class="callout-ico">i</div>
          <div class="callout-body">
            <div class="callout-title">Cách ly dữ liệu "của tôi" khỏi lag</div>
            <p>Một pattern rất thực dụng: đọc dữ liệu <strong>của chính user đang đăng nhập</strong> (profile, giỏ hàng, đơn của tôi) thì đi leader; đọc dữ liệu <strong>công khai hoặc của người khác</strong> (feed, danh sách sản phẩm, profile người khác) thì đi replica. Vì read-your-writes chỉ bị vi phạm bởi chính user đó, và traffic "dữ liệu của tôi" thường chỉ chiếm 5–15% tổng read — bạn giữ được gần như toàn bộ lợi ích scale đọc mà không có bug khó chịu.</p>
          </div>
        </div>

        <h3>Failover — phần nguy hiểm nhất của replication</h3>
        <p>Khi leader chết, ai lên thay? Nếu hai node cùng nghĩ mình là leader, bạn có <span class="kw-r">split brain</span>: hai bên nhận ghi khác nhau, dữ liệu phân kỳ, không merge được. Đây là lý do các hệ thống nghiêm túc dùng <strong>consensus</strong> (Raft/Paxos, Module 4) chứ không dùng "node nào ping nhanh hơn thì thắng".</p>
        <ul class="list-check">
          <li><strong>Fencing token:</strong> mỗi lần bầu leader, epoch tăng. Mọi write gửi kèm epoch; storage từ chối epoch cũ. Leader "cũ" dù còn sống cũng không ghi được.</li>
          <li><strong>STONITH:</strong> node mới chủ động tắt hẳn node cũ trước khi nhận quyền (không dùng được trong cloud multi-AZ).</li>
          <li><strong>Majority quorum:</strong> cần ≥ (N/2 + 1) node đồng ý. Với N=3, chịu được 1 node chết; với N=5, chịu 2. Không bao giờ cấu hình N=2 cho cluster cần HA — mất 1 node là mất luôn khả năng bầu chọn.</li>
          <li><strong>Fencing + lease:</strong> leader có lease thời hạn ngắn và phải gia hạn liên tục; hết lease thì tự ngừng nhận ghi.</li>
        </ul>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Async replication + automatic failover = mất dữ liệu</div>
            <p>Đây là cặp đôi nguy hiểm nhất trong vận hành DB. Khi leader chết, replica được promote có thể thiếu vài giây ghi cuối. Những ghi đó <strong>đã báo thành công cho client</strong>. Không có cách "khôi phục" — chúng chưa từng tồn tại ở node mới. Giảm thiểu: (1) semi-sync ít nhất 1 replica; (2) failover thủ công cho hệ thống tài chính; (3) thiết kế nghiệp vụ chịu được (ví dụ dùng idempotency key để client retry an toàn); (4) theo dõi <code>pg_stat_replication</code> / <code>SHOW REPLICA STATUS</code> và cảnh báo khi lag &gt; 1s.</p>
          </div>
        </div>`
    },

    {
      id: 'sharding', num: '3.5', title: 'Sharding — chia dữ liệu và cái bẫy hotspot',
      html: `
        <p>Replication nhân bản <em>toàn bộ</em> dữ liệu. Khi dữ liệu vượt dung lượng một máy hoặc write vượt khả năng một máy, bạn buộc phải <span class="kw">sharding</span> (partitioning ngang): chia bảng thành nhiều mảnh, mỗi mảnh nằm trên một node khác nhau. Đây là bước nhảy về độ phức tạp — chỉ làm khi thật cần.</p>

        <h3>Bốn chiến lược chọn shard key</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Chiến lược</th><th>Cách làm</th><th>Ưu</th><th>Nhược</th></tr></thead>
            <tbody>
              <tr><td><strong>Range</strong></td><td>Theo khoảng giá trị (created_at, id, chữ cái)</td><td>Range scan hiệu quả; dễ hiểu</td><td><span class="kw-r">Hotspot ở đầu/cuối</span> — mọi write mới dồn vào shard cuối</td></tr>
              <tr><td><strong>Hash</strong></td><td><code>hash(key) % N</code></td><td>Phân bố đều</td><td>Mất khả năng range scan; <code>% N</code> đổi N là xáo toàn bộ</td></tr>
              <tr><td><strong>Consistent hashing</strong></td><td>Vòng hash + virtual node</td><td>Thêm/bớt node chỉ di chuyển ~1/N dữ liệu</td><td>Cài đặt phức tạp hơn; vẫn cần xử lý hotspot</td></tr>
              <tr><td><strong>Directory</strong></td><td>Bảng tra cứu key → shard</td><td>Linh hoạt nhất, đổi mapping bất cứ lúc nào</td><td>Tra cứu thành bottleneck/SPOF; thêm 1 hop</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 360" role="img" aria-label="So sánh sharding theo range gây hotspot và sharding theo hash phân bố đều">
            <defs>
              <marker id="m3e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <text x="20" y="24" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#ef4444">✗ RANGE theo created_at — shard cuối bị dồn</text>

            <rect x="20" y="38" width="160" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="100" y="60" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 1</text>
            <text x="100" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">T1–T3 · 30% tải</text>

            <rect x="196" y="38" width="160" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="276" y="60" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 2</text>
            <text x="276" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">T4–T6 · 25% tải</text>

            <rect x="372" y="38" width="160" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="452" y="60" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 3</text>
            <text x="452" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">T7–T9 · 20% tải</text>

            <rect x="548" y="38" width="192" height="52" rx="8" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="644" y="60" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#ef4444">shard 4 (mới nhất)</text>
            <text x="644" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">T10–nay · 100% write</text>

            <line x1="20" y1="112" x2="740" y2="112" stroke="#e7ebf1" stroke-width="2" stroke-dasharray="5 4"/>
            <text x="20" y="138" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#10b981">✓ HASH hoặc SALT — phân bố đều</text>

            <rect x="20" y="152" width="168" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="104" y="174" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 1</text>
            <text x="104" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">25% tải</text>

            <rect x="204" y="152" width="168" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="288" y="174" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 2</text>
            <text x="288" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">25% tải</text>

            <rect x="388" y="152" width="168" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="472" y="174" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 3</text>
            <text x="472" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">25% tải</text>

            <rect x="572" y="152" width="168" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="656" y="174" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard 4</text>
            <text x="656" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">25% tải</text>

            <rect x="20" y="228" width="352" height="112" rx="9" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="38" y="252" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Cách chữa hotspot ID tăng dần</text>
            <text x="38" y="274" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard = hash(id) % N</text>
            <text x="38" y="292" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard = hash(user_id) % N</text>
            <text x="38" y="310" font-family="JetBrains Mono, monospace" font-size="10" fill="#151515">shard = hash(id + salt)</text>
            <text x="38" y="328" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">salt là số ngẫu nhiên nhỏ (0–9) gắn vào key</text>

            <rect x="388" y="228" width="352" height="112" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="406" y="252" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Nhưng salt phá thứ tự!</text>
            <text x="406" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">Muốn đọc "100 bài mới nhất" phải</text>
            <text x="406" y="292" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">query cả 10 salt × N shard rồi merge.</text>
            <text x="406" y="314" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">Đánh đổi thật: write phân tán ⇄ read range</text>
            <text x="406" y="332" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#505a68">phải scatter-gather.</text>
          </svg>
          <div class="diagram-cap">Hình 3.5 — Hotspot do range sharding và cái giá của việc phá thứ tự bằng salt</div>
        </div>

        <h3>Shard key tốt trông như thế nào</h3>
        <ol class="list-num">
          <li><strong>Cardinality cao:</strong> đủ nhiều giá trị để chia đều. <code>country</code> (200 giá trị) tốt hơn <code>status</code> (3 giá trị).</li>
          <li><strong>Phân bố đều về lưu lượng, không chỉ về số dòng:</strong> một shard có 1 triệu user không hoạt động và một shard có 10.000 user VIP đốt 80% tải — shard thứ hai vẫn là hotspot.</li>
          <li><strong>Xuất hiện trong hầu hết query:</strong> nếu không, mỗi query phải fan-out ra mọi shard. Đây là tiêu chí hay bị bỏ qua nhất.</li>
          <li><strong>Bất biến:</strong> shard key thay đổi = phải di chuyển dữ liệu. Không bao giờ dùng email hoặc username làm shard key.</li>
          <li><strong>Không tạo cross-shard transaction:</strong> nếu nghiệp vụ thường xuyên cần dữ liệu của 2 shard, chọn key khác hoặc chấp nhận Saga.</li>
        </ol>

        <div class="callout callout-warn">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Câu hỏi phỏng vấn kinh điển: shard theo user_id, nhưng cần feed của người mình follow</div>
            <p>Nếu <code>posts</code> shard theo <code>author_id</code>, thì để lấy feed của một user bạn phải query N shard (fan-out on read). Đó là lý do các hệ thống feed dùng <span class="kw">fan-out on write</span>: khi user đăng bài, một worker đẩy bản ghi vào <code>feeds</code> — bảng này shard theo <code>user_id</code> (người nhận). Đọc feed trở thành 1 shard duy nhất. Cái giá: một celebrity có 50 triệu follower tạo ra 50 triệu write cho một post → phải dùng hybrid (celebrity thì fan-out on read, người thường thì fan-out on write). Đây là lý do Module 5 dành hẳn một section cho news feed.</p>
          </div>
        </div>

        <h3>Resharding — khi N phải thay đổi</h3>
        <p>Với <code>hash(key) % N</code>, tăng N từ 4 lên 5 làm <strong>80% key đổi shard</strong>. Đó là thảm hoạ vận hành. Ba cách tránh:</p>
        <ul class="list-bullet">
          <li><span class="kw">Consistent hashing:</span> chỉ ~1/N key di chuyển. Dùng virtual node (150–200 bản sao mỗi node) để phân bố đều.</li>
          <li><span class="kw">Fixed partition count:</span> tạo sẵn 4096 logical partition, map partition → node. Thêm node chỉ là chuyển vài partition, không đổi <code>hash % 4096</code>. Đây là cách Redis Cluster và Kafka làm.</li>
          <li><span class="kw-y">Directory service:</span> bảng tra cứu tập trung (như Vitess, Citus). Linh hoạt nhất, nhưng phải làm bảng đó HA và cache lại.</li>
        </ul>

        <h3>Những thứ sharding làm hỏng</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tính năng</th><th>Trước sharding</th><th>Sau sharding</th><th>Cách xử lý</th></tr></thead>
            <tbody>
              <tr><td>JOIN</td><td>JOIN tự do</td><td>Chỉ JOIN trong cùng shard</td><td>Denormalize, hoặc JOIN ở application, hoặc colocate theo cùng key</td></tr>
              <tr><td>Transaction</td><td>ACID đầy đủ</td><td>Chỉ trong 1 shard</td><td>2PC (chậm, dễ block) hoặc Saga (Module 4)</td></tr>
              <tr><td>Auto-increment ID</td><td>Tăng dần, duy nhất</td><td>Không duy nhất toàn cục</td><td>Snowflake, UUIDv7, hoặc dải ID cấp phát theo shard</td></tr>
              <tr><td>Aggregate (COUNT, SUM)</td><td>1 query</td><td>Phải fan-out rồi merge</td><td>Scatter-gather + cache kết quả, hoặc pre-aggregate vào OLAP</td></tr>
              <tr><td>ORDER BY + LIMIT</td><td>Index địa phương</td><td>Mỗi shard trả top-K, merge ở client</td><td>Merge K×N rồi lấy top-K; dùng cursor pagination</td></tr>
              <tr><td>Unique constraint</td><td>Toàn bảng</td><td>Chỉ trong shard</td><td>Bảng tra cứu riêng cho uniqueness toàn cục (ví dụ username → user_id)</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Thứ tự tối ưu đúng — đừng shard quá sớm</div>
            <p>Theo thứ tự chi phí tăng dần: <strong>(1)</strong> thêm index đúng → <strong>(2)</strong> cache read → <strong>(3)</strong> read replica → <strong>(4)</strong> archive dữ liệu cũ sang bảng/cold storage → <strong>(5)</strong> tách service theo domain → <strong>(6)</strong> vertical scaling (máy to hơn — thường bị coi thường nhưng rẻ hơn nhiều so với sharding) → <strong>(7)</strong> sharding. Một máy 64 core / 512GB RAM / NVMe chạy được hàng chục nghìn QPS. Sharding đưa bạn vào thế giới của cross-shard query, resharding, và bug chỉ xuất hiện một lần mỗi tháng. Trong phỏng vấn, hãy nói rõ <em>ngưỡng</em> bạn sẽ shard: thường là khi dataset &gt; 1–2TB hoặc write &gt; 20–50k/s trên một node.</p>
          </div>
        </div>`
    },

    {
      id: 'quorum', num: '3.6', title: 'Quorum R + W > N — toán học của tính nhất quán',
      html: `
        <p>Đây là công thức ngắn nhất trong toàn bộ system design nhưng giải thích được vì sao Cassandra cho bạn chọn giữa nhanh và đúng, và vì sao DynamoDB có "strongly consistent read" với giá gấp đôi.</p>

        <div class="callout callout-note">
          <div class="callout-ico">∑</div>
          <div class="callout-body">
            <div class="callout-title">Công thức</div>
            <p>Với <strong>N</strong> replica, ghi vào <strong>W</strong> node, đọc từ <strong>R</strong> node. Nếu <strong>R + W &gt; N</strong> thì tập node đọc và tập node ghi <em>luôn giao nhau ít nhất 1 node</em>, và node đó đã thấy bản ghi mới nhất. Với N=3: W=2, R=2 → 4 &gt; 3 ✓.</p>
          </div>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 320" role="img" aria-label="Minh hoạ quorum với N bằng 3, W bằng 2, R bằng 2 và phần giao nhau chứa bản ghi mới nhất">
            <defs>
              <marker id="m3f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <circle cx="200" cy="150" r="102" fill="#e9f0fc" fill-opacity="0.75" stroke="#5294ff" stroke-width="2"/>
            <circle cx="330" cy="150" r="102" fill="#fef3c7" fill-opacity="0.75" stroke="#f4d77c" stroke-width="2"/>

            <text x="126" y="60" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#5294ff">Tập ghi (W=2)</text>
            <text x="344" y="60" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#b45309">Tập đọc (R=2)</text>
            <text x="238" y="132" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">GIAO</text>
            <text x="238" y="150" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" font-weight="800" fill="#151515">≥ 1 node</text>
            <text x="238" y="168" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#151515">có bản mới</text>

            <circle cx="150" cy="118" r="19" fill="#5294ff" stroke="#151515" stroke-width="2"/>
            <text x="150" y="124" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#fff">R1</text>
            <circle cx="164" cy="196" r="19" fill="#5294ff" stroke="#151515" stroke-width="2"/>
            <text x="164" y="202" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#fff">R2</text>
            <circle cx="300" cy="118" r="19" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="300" y="124" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#151515">R3</text>
            <circle cx="372" cy="196" r="19" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="372" y="202" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#151515">R4</text>

            <rect x="470" y="34" width="272" height="242" rx="10" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="488" y="58" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Bốn cấu hình thực dụng</text>
            <text x="488" y="84" font-family="JetBrains Mono, monospace" font-size="10" fill="#10b981">W=2,R=2  → strong, cân bằng</text>
            <text x="488" y="104" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">R+W=4 &gt; 3 ✓ đọc thấy bản mới</text>
            <text x="488" y="130" font-family="JetBrains Mono, monospace" font-size="10" fill="#ef4444">W=1,R=1  → nhanh nhất, có thể cũ</text>
            <text x="488" y="150" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">R+W=2 ≤ 3 ✗ có thể đọc bản cũ</text>
            <text x="488" y="176" font-family="JetBrains Mono, monospace" font-size="10" fill="#fb923c">W=3,R=1  → ghi chậm, đọc nhanh</text>
            <text x="488" y="196" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">R+W=4 ✓ nhưng 1 node chết là tắc ghi</text>
            <text x="488" y="222" font-family="JetBrains Mono, monospace" font-size="10" fill="#8c4fff">W=1,R=3  → ghi nhanh, đọc đắt</text>
            <text x="488" y="242" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">R+W=4 ✓ tốt cho write-heavy</text>
            <text x="488" y="266" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#8b95a3">Riêng W=3,R=1: mất 1 node → ghi fail</text>

            <text x="20" y="298" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#8b95a3">Hình vẽ: N=3 thực tế nhưng minh hoạ tập giao của 2 quần thể 2 node</text>
          </svg>
          <div class="diagram-cap">Hình 3.6 — Quorum không phải "đa số", nó là điều kiện giao nhau</div>
        </div>

        <h3>Đọc sửa (read repair) và vì sao quorum không đủ</h3>
        <p>Quorum đảm bảo bạn <em>thấy</em> bản mới nhất ở ít nhất một node, nhưng node khác vẫn giữ bản cũ. Nếu không sửa, dữ liệu phân kỳ vĩnh viễn và lần đọc sau với R nhỏ hơn có thể trả bản cũ.</p>
        <ul class="list-bullet">
          <li><span class="kw">Read repair (blocking):</span> client đọc R node, phát hiện version lệch, ghi bản mới trở lại các node cũ <em>trước khi</em> trả kết quả. Nhất quán hơn nhưng chậm hơn.</li>
          <li><span class="kw">Read repair (background):</span> trả kết quả ngay, gửi sửa nền. Nhanh, nhưng cửa sổ bất nhất quán còn tồn tại.</li>
          <li><span class="kw">Anti-entropy repair:</span> tiến trình định kỳ (Merkle tree) so sánh toàn bộ dữ liệu giữa các replica. Tốn I/O, chạy hàng tuần. Đây là lưới an toàn cuối cùng — Cassandra gọi là <code>nodetool repair</code>.</li>
          <li><span class="kw-y">Hinted handoff:</span> node đích down thì node điều phối giữ "hint" (bản ghi tạm + thời hạn) và gửi lại khi node sống. Giúp W không thất bại khi có node tạm chết.</li>
        </ul>

        <h3>Sloppy quorum và con dao hai lưỡi</h3>
        <p>Khi một node trong N node được chỉ định bị down, hệ thống "sloppy" ghi vào node dự phòng ngoài tập N để vẫn đạt W. Ưu điểm: <span class="kw-g">luôn ghi được</span> (availability cao). Nhược điểm: <span class="kw-r">R + W &gt; N không còn đảm bảo</span>, vì bản mới có thể nằm ngoài tập đọc. Đây là lý do DynamoDB phân biệt <em>eventually consistent read</em> (rẻ, R=1) với <em>strongly consistent read</em> (đắt gấp đôi, đọc từ leader của partition) — chứ không chỉ là "đọc nhiều node hơn".</p>

        <h3>Last-write-wins và sự thật khó chịu về đồng hồ</h3>
        <p>Multi-leader và leaderless buộc phải giải quyết xung đột. Cách phổ biến nhất là <span class="kw-r">Last-Write-Wins bằng timestamp</span> — và nó <strong>mất dữ liệu một cách âm thầm</strong>. Hai client ghi gần như đồng thời, đồng hồ hai node lệch 50ms, bản ghi "thắng" có thể là bản cũ hơn về mặt logic. Bản ghi kia biến mất không dấu vết.</p>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách giải quyết xung đột</th><th>Mất dữ liệu?</th><th>Khi nào dùng</th></tr></thead>
            <tbody>
              <tr><td><strong>LWW (timestamp)</strong></td><td>Có — bản thua bị xoá</td><td>Dữ liệu "ghi đè" tự nhiên: last seen, status, cache</td></tr>
              <tr><td><strong>Version vector / Dotted version</strong></td><td>Không — trả cả hai bản cho app</td><td>Giỏ hàng, tài liệu cộng tác; app phải merge được</td></tr>
              <tr><td><strong>CRDT</strong></td><td>Không — merge tự động, giao hoán</td><td>Counter (G-Counter), set (OR-Set), text (RGA)</td></tr>
              <tr><td><strong>Single-leader cho entity đó</strong></td><td>Không — không có xung đột</td><td>Mọi thứ cần ACID; đơn giản nhất, luôn là lựa chọn đầu tiên</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Đừng bao giờ dùng timestamp của client</div>
            <p>Nếu xung đột được giải quyết bằng <code>updated_at</code> do client gửi lên, một client có đồng hồ nhanh (hoặc cố tình) sẽ luôn thắng mọi ghi. Đây là lỗ hổng bảo mật, không chỉ là bug dữ liệu. Luôn dùng timestamp do server/coordinator gán, hoặc tốt hơn là Hybrid Logical Clock (HLC) — kết hợp vật lý và logic để giữ thứ tự nhân quả. CockroachDB dùng HLC; nó vẫn cần "clock skew uncertainty interval" và đôi khi phải restart transaction khi phát hiện lệch quá ngưỡng.</p>
          </div>
        </div>`
    },

    {
      id: 'cdc', num: '3.7', title: 'CDC & Streaming — dữ liệu chảy từ DB sang mọi nơi',
      html: `
        <p>Trong một hệ thống thật, dữ liệu không chỉ nằm trong DB chính. Nó còn phải có mặt trong search index, cache, data warehouse, ML feature store, và các service khác. Câu hỏi: <span class="kw">làm sao đồng bộ mà không mất, không trùng, không làm chậm đường ghi?</span></p>

        <h3>Ba cách đồng bộ — và hai cách sai</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Cách</th><th>Cơ chế</th><th>Vấn đề</th></tr></thead>
            <tbody>
              <tr><td><strong>Dual write</strong> <span class="kw-r">(sai)</span></td><td>App ghi DB rồi ghi thêm ES/Kafka trong cùng hàm</td><td>Không atomic: ghi DB thành công, ghi ES thất bại → phân kỳ vĩnh viễn. Hoặc crash giữa hai bước.</td></tr>
              <tr><td><strong>Polling</strong></td><td>Job quét <code>WHERE updated_at &gt; last_run</code></td><td>Bỏ sót bản ghi khi <code>updated_at</code> không đơn điệu; tải nặng lên DB; độ trễ cao; không bắt được DELETE.</td></tr>
              <tr><td><strong>CDC</strong> <span class="kw-g">(đúng)</span></td><td>Đọc transaction log (WAL/binlog), phát thành stream</td><td>Cần quyền đọc log, phải quản lý schema evolution, phải idempotent ở phía consumer.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="diagram">
          <svg viewBox="0 0 760 350" role="img" aria-label="Luồng CDC từ Postgres WAL qua Debezium Kafka tới Elasticsearch cache và data warehouse">
            <defs>
              <marker id="m3g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="20" y="130" width="128" height="72" rx="9" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="84" y="156" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Postgres</text>
            <text x="84" y="176" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">tables + WAL</text>
            <text x="84" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">source of truth</text>

            <rect x="184" y="130" width="128" height="72" rx="9" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="248" y="156" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">WAL / binlog</text>
            <text x="248" y="176" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">logical decoding</text>
            <text x="248" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">replication slot</text>

            <rect x="348" y="130" width="140" height="72" rx="9" fill="#f4d77c" stroke="#151515" stroke-width="2"/>
            <text x="418" y="156" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="800" fill="#151515">Debezium</text>
            <text x="418" y="176" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">→ topic per table</text>
            <text x="418" y="192" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">Kafka Connect</text>

            <rect x="524" y="34" width="216" height="52" rx="8" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="632" y="56" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Kafka (event log)</text>
            <text x="632" y="74" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" fill="#505a68">retain 7 ngày, replay được</text>

            <rect x="524" y="128" width="216" height="46" rx="8" fill="#f3e8ff" stroke="#151515" stroke-width="2"/>
            <text x="632" y="148" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">→ Elasticsearch</text>
            <text x="632" y="164" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">search index, ~1s trễ</text>

            <rect x="524" y="190" width="216" height="46" rx="8" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="632" y="210" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">→ Cache invalidation</text>
            <text x="632" y="226" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">xoá key theo id</text>

            <rect x="524" y="252" width="216" height="46" rx="8" fill="#fef3c7" stroke="#151515" stroke-width="2"/>
            <text x="632" y="272" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">→ Warehouse / lake</text>
            <text x="632" y="288" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#505a68">S3 + Iceberg, batch nhỏ</text>

            <rect x="20" y="252" width="468" height="76" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="38" y="274" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Điều bắt buộc: mỗi consumer phải idempotent</text>
            <text x="38" y="294" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">Message có thể đến 2 lần (at-least-once). Upsert theo primary key thay vì INSERT;</text>
            <text x="38" y="312" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">hoặc lưu (topic, partition, offset) đã xử lý trong cùng transaction với dữ liệu ghi ra.</text>

            <path d="M148,166 L182,166" stroke="#505a68" stroke-width="2" marker-end="url(#m3g)"/>
            <path d="M312,166 L346,166" stroke="#505a68" stroke-width="2" marker-end="url(#m3g)"/>
            <path d="M488,150 L500,120 L522,86" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3g)"/>
            <path d="M524,60 L500,60 L500,151 L522,151" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3g)"/>
            <path d="M524,60 L500,60 L500,213 L522,213" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3g)"/>
            <path d="M524,60 L500,60 L500,275 L522,275" fill="none" stroke="#505a68" stroke-width="2" marker-end="url(#m3g)"/>
          </svg>
          <div class="diagram-cap">Hình 3.7 — CDC: một nguồn sự thật, nhiều consumer độc lập, mỗi consumer tự chịu trách nhiệm idempotency</div>
        </div>

        <h3>Log compaction — khi bạn cần trạng thái cuối, không cần lịch sử</h3>
        <p>Kafka giữ mọi event trong retention window (ví dụ 7 ngày). Nhưng với topic đồng bộ trạng thái (bảng <code>users</code>), bạn không cần 100 lần update của cùng một user — bạn chỉ cần bản cuối. <code>cleanup.policy=compact</code> làm đúng việc đó: Kafka giữ lại <strong>bản ghi cuối cùng cho mỗi key</strong>, xoá các bản cũ. Kết quả: topic trở thành một "bản sao vật liệu hoá" (materialized view) của bảng, và một consumer mới khởi động chỉ cần replay từ đầu là dựng lại được toàn bộ trạng thái — đây chính là cách Kafka Streams xây dựng state store.</p>

        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Postgres: bật logical decoding để CDC đọc được</span>
<span class="c-key">ALTER SYSTEM SET</span> wal_level = <span class="c-str">'logical'</span>;
<span class="c-key">ALTER SYSTEM SET</span> max_replication_slots = <span class="c-num">10</span>;
<span class="c-key">ALTER SYSTEM SET</span> max_wal_senders = <span class="c-num">10</span>;

<span class="c-com">-- Tạo publication cho các bảng cần CDC</span>
<span class="c-key">CREATE PUBLICATION</span> app_cdc <span class="c-key">FOR TABLE</span> users, orders, products;

<span class="c-com">-- QUAN TRỌNG: replication slot giữ WAL lại cho tới khi consumer đọc</span>
<span class="c-com">-- Nếu consumer chết, WAL tích tụ → đầy disk → DB sập.</span>
<span class="c-com">-- Luôn đặt max_slot_wal_keep_size và monitor pg_replication_slots.</span>
<span class="c-key">SELECT</span> slot_name, active, pg_size_pretty(
  pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) <span class="c-key">AS</span> lag_bytes
<span class="c-key">FROM</span> pg_replication_slots;</code></pre>
        </div>

        <div class="callout callout-danger">
          <div class="callout-ico">!</div>
          <div class="callout-body">
            <div class="callout-title">Replication slot là quả bom hẹn giờ</div>
            <p>Đây là sự cố production phổ biến nhất khi triển khai CDC lần đầu. Postgres giữ WAL cho đến khi slot được xác nhận đã đọc. Nếu Debezium dừng (deploy, mất kết nối, hết dung lượng), WAL tích tụ <strong>vô hạn</strong> cho đến khi disk đầy và toàn bộ DB ngừng ghi. Phòng ngừa: (1) đặt <code>max_slot_wal_keep_size = 10GB</code> — slot bị vô hiệu hoá thay vì làm sập DB; (2) alert khi lag &gt; 1GB; (3) theo dõi Debezium như một service production, không phải script phụ; (4) có runbook: nếu consumer mất &gt; 1 giờ, drop slot và full-resync thay vì chờ.</p>
          </div>
        </div>

        <h3>Outbox pattern — khi bạn không thể dùng CDC</h3>
        <p>Nếu DB không hỗ trợ logical decoding (hoặc bạn không có quyền), dùng <strong>transactional outbox</strong>: ghi business data và một dòng vào bảng <code>outbox</code> trong <span class="kw">cùng một transaction</span>. Một worker riêng đọc <code>outbox</code>, publish lên Kafka, đánh dấu đã gửi.</p>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-key">BEGIN</span>;
  <span class="c-key">INSERT INTO</span> orders (id, user_id, total, status)
  <span class="c-key">VALUES</span> (<span class="c-str">'ord_123'</span>, <span class="c-str">'u_456'</span>, <span class="c-num">99000</span>, <span class="c-str">'created'</span>);

  <span class="c-key">INSERT INTO</span> outbox (aggregate_id, event_type, payload)
  <span class="c-key">VALUES</span> (<span class="c-str">'ord_123'</span>, <span class="c-str">'OrderCreated'</span>,
          <span class="c-str">'{"order_id":"ord_123","total":99000}'</span>::jsonb);
<span class="c-key">COMMIT</span>;
<span class="c-com">-- Hai insert atomic với nhau: hoặc cùng có, hoặc cùng không.</span>
<span class="c-com">-- Worker riêng: SELECT ... FROM outbox WHERE published_at IS NULL ORDER BY id LIMIT 100
<span class="c-com">--               FOR UPDATE SKIP LOCKED  → publish → UPDATE published_at</span></code></pre>
        </div>

        <h3>Schema evolution — điều sẽ làm bạn đau đầu ở tháng thứ 6</h3>
        <ul class="list-bullet">
          <li><strong>Rename cột</strong> trông giống "xoá cột + thêm cột" với CDC consumer. Dùng expand-contract: thêm cột mới, dual-write, migrate, bỏ cột cũ sau vài tuần.</li>
          <li><strong>Consumer schema registry</strong> (Avro/Protobuf + Confluent Schema Registry) chặn thay đổi phá vỡ tương thích ngay ở producer.</li>
          <li><strong>Luôn có version trong event</strong> (<code>{"v": 2, ...}</code>) và consumer phải xử lý được cả v1 và v2 trong thời gian chuyển tiếp.</li>
          <li><strong>DELETE trong CDC</strong> là một event riêng — consumer phải xoá tương ứng, không phải bỏ qua.</li>
        </ul>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Khi nào KHÔNG cần CDC</div>
            <p>Nếu bạn chỉ có 1 DB và 1 read replica, không cần CDC. Nếu search index của bạn cập nhật chấp nhận được độ trễ 5 phút, một job polling đơn giản là đủ và dễ vận hành hơn 10 lần. CDC đáng giá khi: (1) có ≥ 3 consumer khác nhau; (2) cần độ trễ &lt; 5s; (3) cần bắt được DELETE và thay đổi schema; (4) không thể chấp nhận mất event. Đó là bốn tiêu chí — nếu không đạt ít nhất hai, hãy chọn giải pháp đơn giản hơn.</p>
          </div>
        </div>`
    },

    {
      id: 'lifecycle', num: '3.8', title: 'Vòng đời dữ liệu & checklist trả lời',
      html: `
        <p>Phần lớn ứng viên chỉ nghĩ đến lúc dữ liệu <em>được ghi</em>. Người có kinh nghiệm nghĩ đến toàn bộ vòng đời: <span class="kw">hot → warm → cold → xoá</span>. Đây là nơi bạn tiết kiệm được 80% chi phí hạ tầng và tránh được những cuộc họp khó chịu về GDPR.</p>

        <div class="diagram">
          <svg viewBox="0 0 760 250" role="img" aria-label="Vòng đời dữ liệu từ hot sang warm cold archive và xoá với chi phí giảm dần">
            <defs>
              <marker id="m3h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#505a68"/>
              </marker>
            </defs>
            <rect x="16" y="56" width="160" height="98" rx="10" fill="#fee2e2" stroke="#151515" stroke-width="2"/>
            <text x="96" y="82" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">HOT</text>
            <text x="96" y="102" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">0–30 ngày</text>
            <text x="96" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#505a68">Postgres / Redis</text>
            <text x="96" y="138" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#ef4444">$$$$</text>

            <rect x="206" y="56" width="160" height="98" rx="10" fill="#ffedd5" stroke="#151515" stroke-width="2"/>
            <text x="286" y="82" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">WARM</text>
            <text x="286" y="102" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">1–12 tháng</text>
            <text x="286" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#505a68">partitioned table</text>
            <text x="286" y="138" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#fb923c">$$$</text>

            <rect x="396" y="56" width="160" height="98" rx="10" fill="#e9f0fc" stroke="#151515" stroke-width="2"/>
            <text x="476" y="82" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">COLD</text>
            <text x="476" y="102" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">1–7 năm</text>
            <text x="476" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#505a68">S3 + Parquet</text>
            <text x="476" y="138" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#5294ff">$$</text>

            <rect x="586" y="56" width="158" height="98" rx="10" fill="#dcfce7" stroke="#151515" stroke-width="2"/>
            <text x="665" y="82" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" fill="#151515">ARCHIVE</text>
            <text x="665" y="102" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">7+ năm</text>
            <text x="665" y="120" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9" fill="#505a68">Glacier / tape</text>
            <text x="665" y="138" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#10b981">$</text>

            <path d="M176,105 L204,105" stroke="#505a68" stroke-width="2" marker-end="url(#m3h)"/>
            <path d="M366,105 L394,105" stroke="#505a68" stroke-width="2" marker-end="url(#m3h)"/>
            <path d="M556,105 L584,105" stroke="#505a68" stroke-width="2" marker-end="url(#m3h)"/>

            <text x="190" y="96" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">archive</text>
            <text x="380" y="96" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">export</text>
            <text x="570" y="96" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="9" fill="#8b95a3">lifecycle</text>

            <rect x="16" y="176" width="728" height="56" rx="9" fill="#fff" stroke="#151515" stroke-width="2"/>
            <text x="34" y="198" font-family="Plus Jakarta Sans, sans-serif" font-size="11" font-weight="800" fill="#151515">Xoá dữ liệu là yêu cầu pháp lý, không phải tính năng</text>
            <text x="34" y="218" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#505a68">GDPR/CCPA: user yêu cầu xoá → phải xoá ở DB, replica, backup, cache, search index, warehouse, log. Hãy thiết kế "xoá theo entity" ngay từ ngày đầu.</text>
          </svg>
          <div class="diagram-cap">Hình 3.8 — Vòng đời dữ liệu: mỗi bước giảm chi phí ~10×, nhưng tăng độ trễ truy cập</div>
        </div>

        <h3>Phân vùng theo thời gian — kỹ thuật rẻ nhất và hiệu quả nhất</h3>
        <p>Với bảng append-only (log, event, order history), <span class="kw">range partition theo tháng</span> cho bạn ba lợi ích cùng lúc:</p>
        <ul class="list-check">
          <li><strong>Query nhanh hơn:</strong> partition pruning — query 7 ngày qua chỉ đọc 1 partition thay vì quét 3 năm.</li>
          <li><strong>Xoá dữ liệu cũ tức thời:</strong> <code>DROP PARTITION</code> thay vì <code>DELETE WHERE created_at &lt; ...</code> (thao tác DELETE hàng triệu dòng gây bloat, tốn WAL, khoá bảng hàng giờ).</li>
          <li><strong>Index nhỏ hơn:</strong> mỗi partition có index riêng, nằm gọn trong RAM.</li>
        </ul>
        <div class="codeblock">
          <div class="codeblock-head"><span class="codeblock-lang">SQL</span><button class="codeblock-copy" type="button">Copy</button></div>
          <pre><code><span class="c-com">-- Partition theo tháng (declarative partitioning, Postgres 10+)</span>
<span class="c-key">CREATE TABLE</span> events (
  id          <span class="c-key">BIGSERIAL</span>,
  created_at  <span class="c-key">TIMESTAMPTZ</span> <span class="c-key">NOT NULL</span>,
  user_id     <span class="c-key">BIGINT</span>,
  payload     <span class="c-key">JSONB</span>
) <span class="c-key">PARTITION BY RANGE</span> (created_at);

<span class="c-key">CREATE TABLE</span> events_2026_11 <span class="c-key">PARTITION OF</span> events
  <span class="c-key">FOR VALUES FROM</span> (<span class="c-str">'2026-11-01'</span>) <span class="c-key">TO</span> (<span class="c-str">'2026-12-01'</span>);

<span class="c-com">-- Xoá 3 tháng cũ: tức thời, không bloat, không tốn WAL</span>
<span class="c-key">DROP TABLE</span> events_2026_08;
<span class="c-com">-- (Nên DETACH trước, export ra S3, rồi mới DROP)</span></code></pre>
        </div>

        <h3>Checklist trả lời câu hỏi "dữ liệu lưu ở đâu"</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Điều phải nêu</th><th>Ví dụ câu trả lời tốt</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>Loại storage + lý do</td><td>"Postgres vì cần transaction cho phần thanh toán; media lưu S3 vì là blob bất biến, phục vụ qua CDN."</td></tr>
              <tr><td>2</td><td>Kích thước dữ liệu ước tính</td><td>"50 triệu user × 1KB ≈ 50GB; orders 500 triệu × 500B ≈ 250GB/năm."</td></tr>
              <tr><td>3</td><td>Access pattern chính</td><td>"95% read theo id, 5% write; query lịch sử đơn hàng theo user + thời gian."</td></tr>
              <tr><td>4</td><td>Index cần thiết</td><td>"PK (id), composite (user_id, created_at DESC) cho trang lịch sử, partial index cho đơn pending."</td></tr>
              <tr><td>5</td><td>Nhất quán cần mức nào</td><td>"Đơn hàng: strong. Số lượt xem: eventual, chấp nhận trễ 5s."</td></tr>
              <tr><td>6</td><td>Replication & failover</td><td>"1 leader + 2 replica ở 2 AZ, semi-sync 1, failover tự động có fencing epoch."</td></tr>
              <tr><td>7</td><td>Sharding — có hay chưa, ngưỡng</td><td>"Chưa cần ở 50GB. Sẽ shard theo user_id khi vượt 2TB hoặc write vượt 20k/s."</td></tr>
              <tr><td>8</td><td>Đồng bộ hệ thống phụ</td><td>"CDC qua Debezium → Kafka → Elasticsearch (search) + invalidate cache. Consumer idempotent bằng upsert."</td></tr>
              <tr><td>9</td><td>Backup & PITR</td><td>"Base backup hằng ngày + WAL archive, PITR 7 ngày, diễn tập restore mỗi quý."</td></tr>
              <tr><td>10</td><td>Vòng đời & xoá</td><td>"Partition theo tháng, drop sau 24 tháng; media S3 lifecycle sang Glacier sau 1 năm; xoá theo user qua deletion job."</td></tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-tip">
          <div class="callout-ico">★</div>
          <div class="callout-body">
            <div class="callout-title">Nếu chỉ nhớ 6 dòng</div>
            <p><strong>1.</strong> Bắt đầu bằng Postgres; chỉ tách khi có ngưỡng rõ ràng. <strong>2.</strong> Ghi nhiều → LSM, đọc/transaction nhiều → B+ tree. <strong>3.</strong> Composite index phải theo tiền tố trái nhất; mỗi index thêm là một write chậm hơn. <strong>4.</strong> Replication bất đồng bộ luôn tạo ra dị thường đọc — route read-your-writes về leader. <strong>5.</strong> Shard muộn, chọn key có cardinality cao và xuất hiện trong query. <strong>6.</strong> CDC chứ không dual-write; consumer phải idempotent; và luôn có kế hoạch xoá dữ liệu.</p>
          </div>
        </div>`
    }
  ],

  quiz: [
    {
      q: 'Bạn cần lưu 500 triệu dòng log, ghi 200.000 dòng/giây, chỉ đọc lại khi điều tra sự cố trong 7 ngày gần nhất, sau đó xoá. Chọn storage nào và tại sao?',
      a: 'Wide-column / time-series trên LSM tree (Cassandra, ScyllaDB, hoặc ClickHouse nếu thiên về analytics). Lý do theo từng tiêu chí: (1) ghi 200k/s là append thuần — LSM ghi tuần tự nên đây đúng điểm mạnh; B+ tree sẽ phải 200k random page write/s, vượt xa IOPS một node; (2) access pattern chỉ là "đọc theo khoảng thời gian + filter theo service/host" → shard key <code>(service, date_bucket)</code> với clustering column là timestamp, đọc cực hiệu quả; (3) xoá sau 7 ngày → dùng TTL native, Cassandra tự drop SSTable hết hạn, không tốn thao tác DELETE; (4) không cần transaction, không cần JOIN, không cần update. Điểm cần nêu thêm: TTL + TimeWindowCompactionStrategy giảm write amp; cần tính dung lượng (200k/s × 86400 × 7 ngày ≈ 1,2 tỷ dòng; ở 500B/dòng ≈ 600GB — vừa 3 node). Tránh Postgres vì 200k insert/s cần partitioning phức tạp + autovacuum không theo kịp, dù Postgres có thể làm được ở mức thấp hơn nhiều.'
    },
    {
      q: 'Vì sao "DELETE FROM orders WHERE created_at < now() - interval 3 years" trên bảng 2 tỷ dòng lại là một sự cố production, và bạn làm gì thay thế?',
      a: 'Câu lệnh này quét và xoá hàng trăm triệu dòng trong một transaction: (1) giữ lock lâu, chặn vacuum; (2) sinh WAL khổng lồ, có thể đầy disk; (3) với MVCC, các dòng bị đánh dấu dead nhưng không giải phóng disk cho đến khi VACUUM FULL chạy — bảng còn <em>phình ra</em> trước khi nhỏ lại; (4) replication lag tăng vọt vì replica phải replay toàn bộ; (5) nếu transaction abort giữa chừng, rollback còn tốn hơn. Cách đúng: nếu bảng đã partition theo tháng/năm → <code>ALTER TABLE ... DETACH PARTITION</code>, export ra S3, rồi <code>DROP TABLE</code> — tức thời, không sinh WAL cho từng dòng. Nếu chưa partition → partition lại (tạo bảng mới partitioned, copy dữ liệu theo batch, swap tên), hoặc xoá theo batch nhỏ (10k dòng/lần, sleep giữa các batch) và chấp nhận chạy nhiều giờ. Bài học: thiết kế partition từ đầu rẻ hơn sửa sau 100 lần.'
    },
    {
      q: 'Hệ thống của bạn dùng read replica. User phàn nàn: "Tôi vừa đổi mật khẩu, đăng nhập lại bằng mật khẩu cũ vẫn được." Phân tích và sửa.',
      a: 'Đây là vi phạm read-your-writes kinh điển. Luồng: user đổi mật khẩu → ghi vào leader → app redirect/refresh → request đọc tiếp theo được load balancer đẩy sang replica chưa kịp replay → app đọc hash cũ → xác thực bằng mật khẩu cũ thành công. Cửa sổ lỗi thường 50–500ms nhưng hoàn toàn đủ để xảy ra. Sửa theo thứ tự ưu tiên: (1) <strong>route theo loại dữ liệu</strong> — mọi read liên quan đến xác thực/phiên/thanh toán đi thẳng leader, đây là cách đơn giản và đúng nhất; (2) <strong>sticky-by-LSN</strong> — sau khi ghi, lưu LSN/GTID vào session (cookie hoặc Redis), các read sau đó chỉ được phục vụ bởi replica đã vượt LSN đó, nếu chưa thì chờ hoặc fallback leader; (3) <strong>time-based stickiness</strong> — route read của user về leader trong 3 giây sau lần ghi gần nhất (đơn giản, hiệu quả ~95%). Lưu ý quan trọng: không nên "sửa" bằng cách tăng số replica hay giảm tải — lag là tính chất, không phải lỗi. Và với mật khẩu/bảo mật, đừng bao giờ chấp nhận eventually consistent dù chỉ 100ms.'
    },
    {
      q: 'Với N=3, bạn cấu hình W=2, R=2. Một node chết. Điều gì xảy ra với read và write? Nếu hai node chết thì sao?',
      a: 'Một node chết: write vẫn thành công vì cần W=2 trên 2 node còn sống (đúng bằng ngưỡng, không có dư địa). Read vẫn thành công vì R=2 trên 2 node còn sống. Nhưng hệ thống <strong>không còn khả năng chịu lỗi thêm</strong> — node thứ hai chết là sập cả read lẫn write ở cấu hình chặt này (trừ khi bật sloppy quorum, lúc đó write vẫn được nhưng mất đảm bảo R+W&gt;N). Hai node chết: chỉ còn 1 node, không đạt W=2 hay R=2 → toàn bộ request liên quan partition đó thất bại. Đây là lý do thực tế người ta dùng: <strong>N=3, W=2, R=1</strong> cho read-heavy (chịu được 2 node chết cho read, 1 node cho write), hoặc <strong>N=5, W=3, R=3</strong> cho hệ thống quan trọng (chịu 2 node chết, vẫn đảm bảo R+W&gt;N). Cần nêu thêm: chọn N theo số AZ — N=3 trên 3 AZ là tối thiểu để chịu mất 1 AZ; đừng đặt N=2 vì mất 1 node là mất quorum.'
    },
    {
      q: 'Bạn shard bảng posts theo author_id. Tính năng "news feed" cần lấy 20 bài mới nhất từ những người mình follow (trung bình 200 người). Bạn thiết kế thế nào?',
      a: 'Cách ngây thơ: query 200 shard (mỗi author có thể ở shard khác nhau), merge, lấy top 20 — 200 network round-trip cho một lần load feed, p99 sẽ tính bằng giây và rất dễ timeout. Ba hướng: (1) <strong>Fan-out on write</strong> — khi user đăng bài, worker đẩy post_id vào bảng <code>feed_entries</code> shard theo <code>user_id</code> (người nhận). Đọc feed = 1 shard, 1 query. Cái giá: một post của người có 5000 follower = 5000 write; với celebrity phải xử lý riêng. (2) <strong>Hybrid</strong> (cách các hệ thống lớn làm): user thường fan-out on write; user có &gt; 10k follower thì fan-out on read — khi đọc feed, lấy danh sách celebrity đã follow (thường chỉ 10–50 người) và query riêng rồi merge với phần đã push sẵn. Đây là cách Instagram/Twitter mô tả. (3) <strong>Cache-heavy</strong> — cache feed của user active trong Redis (sorted set theo timestamp), tính lại nền. Giảm 90% query nhưng vẫn cần (1) hoặc (2) làm nền. Điểm cần nêu trong phỏng vấn: đây là bài toán <em>write amplification vs read latency</em>, và câu trả lời đúng là "hybrid, có ngưỡng follower cụ thể".'
    },
    {
      q: 'Team bạn thêm một index cho mỗi query chậm. Sau 6 tháng, bảng orders có 14 index, write throughput giảm 60%. Bạn xử lý thế nào?',
      a: 'Chẩn đoán trước khi hành động: (1) query <code>pg_stat_user_indexes</code> (hoặc <code>sys.dm_db_index_usage_stats</code>) để tìm index có <code>idx_scan = 0</code> — thường 30–50% index không bao giờ được dùng sau khi thêm; (2) tìm index trùng lặp hoặc bị "bao phủ" bởi index khác — index <code>(a)</code> dư thừa nếu đã có <code>(a, b)</code>; (3) kiểm tra index dùng cho query hiếm (báo cáo tháng) nhưng tốn write mỗi giây. Hành động: drop các index <code>idx_scan = 0</code> trong 30 ngày (dùng <code>DROP INDEX CONCURRENTLY</code> để không khoá bảng), gộp các index trùng prefix, và chuyển các query báo cáo sang read replica hoặc OLAP. Đo lại sau mỗi lần drop. Phòng ngừa dài hạn: đặt quy trình review index (mọi index mới phải chứng minh bằng <code>EXPLAIN ANALYZE</code> trước/sau), đặt alert khi write latency tăng, và theo dõi tỉ lệ <code>index bytes / table bytes</code> — trên 50% là dấu hiệu cần rà soát. Con số nên nhớ: mỗi index thêm ~1 random write mỗi INSERT, và ~10–20% dung lượng bảng.'
    }
  ]
};

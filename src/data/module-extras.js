// Module-level extras that belong to a whole module rather than a single
// topic: the keyword glossary and the self-check quiz. They are kept out of
// the MDX files because every topic file is meant to be one lesson, not a
// dumping ground. `scripts/check-stats.mjs` counts these lists against
// src/data/stats.json so the published numbers cannot drift.
export const MODULE_EXTRAS = {
  "0": {
    "keywords": [
      {
        "term": "OSI 7 layers",
        "def": "Mô hình tham chiếu chia giao tiếp mạng thành 7 tầng: Physical, Data Link, Network, Transport, Session, Presentation, Application."
      },
      {
        "term": "TCP vs UDP",
        "def": "TCP: có kết nối, đảm bảo thứ tự và toàn vẹn (handshake, retransmit). UDP: không kết nối, nhanh, không đảm bảo — dùng cho video, game, DNS."
      },
      {
        "term": "TLS handshake",
        "def": "Quá trình thoả thuận cipher suite, xác thực chứng chỉ và trao đổi khoá đối xứng. TLS 1.3 chỉ cần 1-RTT (hoặc 0-RTT khi resume)."
      },
      {
        "term": "DNS resolution",
        "def": "Trình tự: browser cache → OS cache → recursive resolver → root → TLD → authoritative NS. Kết quả được cache theo TTL."
      },
      {
        "term": "CDN edge",
        "def": "Máy chủ đặt gần người dùng, cache nội dung tĩnh, giảm RTT và giảm tải origin."
      },
      {
        "term": "Process vs Thread",
        "def": "Process có không gian địa chỉ riêng; thread chia sẻ heap trong cùng process. Chuyển thread rẻ hơn chuyển process."
      },
      {
        "term": "epoll / kqueue",
        "def": "Cơ chế I/O multiplexing của Linux/macOS: một thread theo dõi hàng nghìn socket mà không cần blocking từng cái."
      },
      {
        "term": "ACID",
        "def": "Atomicity, Consistency, Isolation, Durability — bốn đảm bảo của transaction quan hệ."
      },
      {
        "term": "B+ Tree index",
        "def": "Cấu trúc index mặc định của MySQL/Postgres: lá liên kết, tìm kiếm O(log n), hỗ trợ range scan tốt."
      },
      {
        "term": "CAP theorem",
        "def": "Khi có partition, hệ thống chỉ chọn được Consistency hoặc Availability — không thể cả hai."
      },
      {
        "term": "PACELC",
        "def": "Mở rộng CAP: nếu Partition chọn A hoặc C; Else (bình thường) chọn Latency hoặc Consistency."
      },
      {
        "term": "Clock skew",
        "def": "Đồng hồ vật lý giữa các máy lệch nhau. Không thể dùng timestamp đơn thuần để sắp xếp sự kiện phân tán."
      }
    ],
    "quiz": [
      {
        "q": "Một service có P99 latency 2 giây nhưng average chỉ 80 ms. Nguyên nhân khả dĩ và cách xử lý?",
        "a": "Average thấp + P99 cao là dấu hiệu tail latency do queueing hoặc GC pause. Nguyên nhân thường gặp: (1) request rơi vào thời điểm thread pool/connection pool đầy, phải xếp hàng; (2) stop-the-world GC; (3) một dependency chậm chỉ với một số key (hot shard); (4) retry storm. Cách xử lý: dùng hedged request (gửi sang replica thứ 2 nếu quá chậm), tách pool theo dependency, tránh head-of-line blocking bằng bulkhead, và giới hạn retry bằng token bucket."
      },
      {
        "q": "Tại sao \"chọn 2 trong 3 CAP\" là cách phát biểu sai?",
        "a": "Vì Partition tolerance không phải lựa chọn — mạng sẽ partition dù bạn muốn hay không. Câu đúng là: khi partition xảy ra, bạn buộc phải chọn giữa Consistency và Availability. Trong thời gian không có partition (phần lớn thời gian), trade-off thật là Latency vs Consistency — đó là nội dung của PACELC."
      },
      {
        "q": "Với 10.000 kết nối đồng thời, tại sao mô hình thread-per-connection thường thất bại?",
        "a": "Mỗi thread tốn ~1 MB stack ảo và chi phí context switch của kernel. 10k thread = 10 GB stack tiềm năng và scheduler phải liên tục chuyển ngữ cảnh, mất phần lớn CPU cho việc chuyển thay vì xử lý. Event loop (epoll/kqueue) chỉ dùng vài thread để theo dõi hàng chục nghìn fd, chỉ cấp phát CPU khi có dữ liệu thật sự."
      },
      {
        "q": "Bạn cần lưu lịch sử giao dịch tài chính, mỗi ngày 50 triệu dòng, truy vấn chủ yếu theo (account_id, thời gian). Chọn CSDL nào và tại sao?",
        "a": "Ưu tiên wide-column hoặc relational có partition theo account_id — ví dụ Cassandra/ScyllaDB với partition key = account_id, clustering key = created_at DESC. Lý do: ghi cực nhiều (append-only), truy vấn luôn theo account + khoảng thời gian (một partition), không cần join. Nếu cần transaction và báo cáo phức tạp, dùng Postgres/MySQL có partition table và read replica. Tránh dùng document DB vì không tối ưu cho range scan lớn."
      }
    ]
  },
  "1": {
    "keywords": [
      {
        "term": "Functional requirements",
        "def": "Hệ thống phải LÀM ĐƯỢC gì — các tính năng người dùng thấy: đăng bài, follow, tìm kiếm."
      },
      {
        "term": "Non-functional requirements",
        "def": "Hệ thống phải TỐT đến mức nào — availability, latency, consistency, scalability, durability."
      },
      {
        "term": "Back-of-envelope",
        "def": "Ước lượng nhanh QPS, storage, bandwidth bằng số tròn và phép chia đơn giản, để kiểm tra thiết kế có khả thi không."
      },
      {
        "term": "DAU / MAU",
        "def": "Daily / Monthly Active Users. DAU là nền tảng để tính QPS; MAU dùng cho quy mô dữ liệu dài hạn."
      },
      {
        "term": "QPS",
        "def": "Queries Per Second = (DAU × số thao tác/ngày) / 86.400. Luôn tính thêm peak QPS = 2–3× trung bình."
      },
      {
        "term": "Peak QPS",
        "def": "Lưu lượng đỉnh. Thiết kế theo peak, không theo trung bình, nếu không hệ thống sẽ sập giờ cao điểm."
      },
      {
        "term": "Read/write ratio",
        "def": "Tỉ lệ đọc/ghi. 100:1 nghĩa là tối ưu cho đọc (cache, replica); 1:1 cần tối ưu ghi (LSM, batching)."
      },
      {
        "term": "Availability nines",
        "def": "99,9% = 8,76 giờ downtime/năm; 99,99% = 52,6 phút; 99,999% = 5,26 phút. Mỗi \"nine\" tốn chi phí gấp nhiều lần."
      },
      {
        "term": "Latency vs Throughput",
        "def": "Latency = thời gian 1 request; Throughput = số request/giây. Tăng batching tăng throughput nhưng tăng latency."
      },
      {
        "term": "P50/P95/P99",
        "def": "Percentile độ trễ. P99 = 1% request chậm nhất. Người dùng thường xuyên gặp tail latency nên tối ưu P99 quan trọng hơn average."
      },
      {
        "term": "Little’s Law",
        "def": "L = λ × W. Số request đồng thời = tốc độ đến × thời gian xử lý. Dùng để tính pool size, số worker cần."
      },
      {
        "term": "Trade-off",
        "def": "Mọi quyết định thiết kế đều đánh đổi. Không có \"tốt nhất\", chỉ có \"phù hợp với ràng buộc nào\"."
      }
    ],
    "quiz": [
      {
        "q": "Bạn được yêu cầu thiết kế hệ thống cho 1 triệu DAU. Bước đầu tiên bạn làm gì?",
        "a": "Hỏi để làm rõ yêu cầu (functional + non-functional) TRƯỚC KHI vẽ bất cứ thứ gì. Cụ thể: tính năng nào là cốt lõi, tỉ lệ đọc/ghi, latency mục tiêu, dữ liệu lưu bao lâu, có cần multi-region không. Sau đó viết giả định ra giấy rồi mới ước lượng QPS/storage. Nhảy vào vẽ kiến trúc ngay là red flag lớn nhất trong phỏng vấn system design."
      },
      {
        "q": "Tính storage cho dịch vụ ảnh: 50 triệu ảnh/ngày, mỗi ảnh 500KB, lưu 3 năm. Cần loại storage gì?",
        "a": "50M × 500KB = 25 TB/ngày. 3 năm = 25 TB × 365 × 3 ≈ 27 PB. Con số này loại bỏ hoàn toàn block storage hoặc DB thông thường — phải dùng object storage (S3/GCS) vì: (1) rẻ hơn ~10× so với EBS, (2) scale gần như vô hạn, (3) tích hợp CDN sẵn. Metadata (id, owner, size, url) đặt trong DB, ảnh đặt trong S3, phục vụ qua CDN (CloudFront/Cloudflare) để giảm egress cost và latency."
      },
      {
        "q": "Vì sao \"average latency\" là chỉ số nguy hiểm để đánh giá hệ thống?",
        "a": "Vì phân phối latency có đuôi dài (long tail). 1% request chậm 5 giây có thể bị che khuất bởi 99% request nhanh 50ms, cho average đẹp ~100ms. Nhưng với một page load gọi 10 service song song, xác suất ít nhất 1 service chậm là 1-(0,99)^10 ≈ 9,6% — nghĩa là gần 10% user thực sự gặp trải nghiệm tệ. Phải đo và tối ưu P95/P99, không phải average."
      },
      {
        "q": "Với URL shortener dùng hash base62, điều gì xảy ra khi 2 URL khác nhau cho cùng 7 ký tự? Bạn xử lý thế nào?",
        "a": "Đó là hash collision. Với 7 ký tự base62 (3,5×10¹² không gian) và 365 tỉ URL trong 10 năm, xác suất collision theo birthday paradox là đáng kể. Cách xử lý: (1) khi INSERT bị vi phạm unique constraint, thêm salt vào input và hash lại, retry tối đa N lần; (2) hoặc dùng counter/Snowflake ID để không bao giờ collision nhưng phải chấp nhận URL có thể đoán được; (3) hoặc kết hợp: hash trước, nếu fail thì fallback sang ID generator. Trong phỏng vấn nên nêu cả 2 hướng và trade-off về khả năng enumerate."
      },
      {
        "q": "Hệ thống của bạn gọi 3 microservice, mỗi cái có availability 99,95%. Availability tổng là bao nhiêu và bạn cải thiện thế nào?",
        "a": "Với phụ thuộc nối tiếp: 0,9995³ ≈ 99,85% — tệ hơn từng service, tương đương ~13 giờ downtime/năm. Cải thiện: (1) thêm fallback/graceful degradation — nếu service gợi ý chết thì vẫn hiển thị feed không có gợi ý; (2) cache kết quả để giảm phụ thuộc; (3) circuit breaker để không chờ service chết; (4) nếu bắt buộc phải có, thêm redundancy song song: 1-(0,0005)² ≈ 99,999975% cho từng service."
      }
    ]
  },
  "2": {
    "keywords": [
      {
        "term": "Load Balancer (L4/L7)",
        "def": "Thiết bị/phần mềm phân phối request. L4 chỉ nhìn IP:port (nhanh, không hiểu HTTP). L7 đọc được URL/header/cookie nên route theo path, terminate TLS, thêm header."
      },
      {
        "term": "Health check",
        "def": "LB định kỳ gọi /health. Active: LB chủ động ping. Passive: LB quan sát lỗi thật từ traffic. Thiếu health check sai = LB đẩy traffic vào instance đã chết."
      },
      {
        "term": "Sticky session",
        "def": "Ghim một user vào một server (bằng cookie hoặc hash IP). Cần khi server giữ session state — nhưng đó là dấu hiệu kiến trúc nên sửa thành stateless."
      },
      {
        "term": "Cache-aside (lazy loading)",
        "def": "App tự đọc cache, miss thì đọc DB rồi ghi lại cache. Phổ biến nhất, dễ hiểu, nhưng có thể bị stale và có 3 request thay vì 1."
      },
      {
        "term": "Write-through / write-behind",
        "def": "Write-through: ghi cache + DB đồng thời (nhất quán, chậm ghi). Write-behind: ghi cache trước, DB sau (nhanh, mất dữ liệu nếu cache chết)."
      },
      {
        "term": "Cache invalidation",
        "def": "Bài toán khó nhất: khi dữ liệu gốc đổi, cache cũ phải bị xoá. Dùng TTL, publish event, hoặc version key để tránh ghi đè bằng dữ liệu cũ."
      },
      {
        "term": "Cache stampede",
        "def": "Một key hot hết hạn, hàng nghìn request cùng miss và cùng đổ vào DB. Chặn bằng single-flight lock, probabilistic early expiration, hoặc never-expire + refresh nền."
      },
      {
        "term": "Token bucket",
        "def": "Xô chứa token, nạp đều theo rate, mỗi request lấy 1 token. Cho phép burst tới capacity. Redis + Lua script là cách chuẩn để làm atomic."
      },
      {
        "term": "Sliding window counter",
        "def": "Xấp xỉ sliding window bằng cách nội suy giữa 2 fixed window liền kề. Sai số nhỏ (~0,003% theo Cloudflare) nhưng rẻ hơn sliding window log."
      },
      {
        "term": "Message Queue vs Event Log",
        "def": "Queue (SQS/RabbitMQ): message bị xoá sau khi xử lý, một consumer. Log (Kafka): giữ lại, nhiều consumer group đọc độc lập, replay được."
      },
      {
        "term": "At-least-once / idempotency",
        "def": "Queue thường giao ít nhất 1 lần ⇒ consumer phải idempotent. Dùng idempotency key + bảng dedupe, hoặc unique constraint trong DB."
      },
      {
        "term": "CDN & cache-control",
        "def": "Mạng edge đặt gần user. s-maxage cho CDN, max-age cho browser, stale-while-revalidate để vẫn trả bản cũ trong lúc fetch bản mới."
      },
      {
        "term": "Inverted index",
        "def": "Map từ term → danh sách document chứa term đó (posting list). Nền tảng của mọi search engine, khác hoàn toàn LIKE %keyword% trên SQL."
      },
      {
        "term": "Fan-out on write vs read",
        "def": "Write: đẩy bài vào feed sẵn của follower (đọc nhanh, ghi đắt). Read: gom khi đọc (ghi rẻ, đọc chậm). News feed dùng hybrid."
      }
    ],
    "quiz": [
      {
        "q": "Bạn có 10 instance sau load balancer. Rate limiter đặt in-memory trong mỗi instance với limit 100 req/s. Điều gì thực sự xảy ra?",
        "a": "Client thực tế có thể gửi tới 1000 req/s (10 × 100) vì mỗi instance đếm riêng. Tệ hơn, nếu LB dùng round-robin thì một client dồn dập sẽ bị chặn không đều — instance này chặn, instance khác vẫn cho qua, tạo trải nghiệm thất thường (lúc 200, lúc 429). Cách sửa: dùng Redis làm state chia sẻ với Lua script atomic (token bucket hoặc sliding window counter). Nếu chấp nhận sai số, có thể dùng \"limit chia đều\" (mỗi instance 10 req/s) nhưng tổng vẫn dao động khi autoscaling. Cách khác: dùng consistent hashing để mỗi user luôn về cùng instance — nhưng phức tạp và vẫn lệch khi rebalance."
      },
      {
        "q": "Cache hit ratio của bạn là 80%, DB đang chịu 20.000 QPS và bắt đầu quá tải ở 15.000 QPS. Bạn làm gì?",
        "a": "Trước tiên tính: nếu tổng read là 100.000 QPS, hit 80% ⇒ 20.000 QPS vào DB. Để DB xuống dưới 15.000, cần hit ratio ≥ 85%. Ba hướng: (1) Tăng TTL cho các key ít đổi — thường là cách rẻ nhất và hiệu quả nhất; (2) tăng dung lượng cache (nếu đang evict do thiếu RAM — kiểm tra evicted_keys trong Redis); (3) tối ưu key design để cache được nhiều hơn (ví dụ cache cả object thay vì từng field). Song song, giảm tải DB bằng read replica và thêm index cho các query chậm. Không nên chỉ tăng cache blindly — nếu eviction rate cao do working set quá lớn, thêm RAM chỉ là giải pháp tạm."
      },
      {
        "q": "Vì sao \"exactly-once delivery\" là bất khả thi trong hệ phân tán, nhưng \"exactly-once processing\" lại làm được?",
        "a": "Delivery là việc của mạng: producer gửi message, không nhận được ack (do mạng đứt), không thể biết consumer đã nhận hay chưa — nếu gửi lại có thể trùng, nếu không gửi có thể mất. Định lý two generals nói rằng không có giao thức nào giải quyết được điều này trên mạng không tin cậy. Nhưng <em>processing</em> là việc của application: nếu consumer ghi kèm idempotency key vào một bảng có unique constraint (hoặc dùng upsert, hoặc state machine có điều kiện), thì dù message đến 2 lần, kết quả cuối cùng vẫn như đến 1 lần. Đó là lý do Kafka \"exactly-once\" thực chất là \"effectively-once\" trong phạm vi transaction của nó (read-process-write trong cùng transaction + offset commit atomic)."
      },
      {
        "q": "Thiết kế tìm kiếm cho 10 triệu sản phẩm, 50.000 query/giây. Bạn chọn gì và tại sao?",
        "a": "Elasticsearch (hoặc OpenSearch) cluster với index được shard theo category hoặc theo hash product_id. Lý do: (1) inverted index cho phép full-text search + BM25 ranking, thứ SQL LIKE không làm được ở quy mô này; (2) sharding cho phép scale ngang — 10 triệu document với ~1KB text mỗi cái ≈ 10–30GB index, chia 5 shard × 2 replica là thoải mái; (3) 50.000 QPS đọc cần nhiều replica — mỗi shard 2–3 replica để phân tán read. Về đồng bộ: dùng CDC (Debezium đọc Postgres WAL) → Kafka → consumer index vào ES, chấp nhận độ trễ 1–3 giây. Với filter (category, price range) dùng ES filter context (cache được, không tính điểm) thay vì query context. Cuối cùng, thêm Redis cache cho các query phổ biến nhất (top 1000 search terms) để giảm tải ES."
      },
      {
        "q": "Bạn dùng CDN cho API trả danh sách sản phẩm với Cache-Control: public, s-maxage=60. Một user báo thấy giá cũ sau khi admin sửa giá. Bạn debug thế nào?",
        "a": "Đây là hành vi đúng theo thiết kế — TTL 60s nghĩa là có thể stale tới 60 giây. Nhưng nếu stale lâu hơn, kiểm tra: (1) CDN có đang cache theo <code>Vary</code> header nào không (ví dụ Vary: Accept-Language tạo nhiều bản cache); (2) purge theo tag đã gửi chưa — nếu admin sửa giá phải gọi purge với <code>Cache-Tag: product-42</code>; (3) browser cache với <code>max-age</code> có lớn hơn s-maxage không, khiến user thấy bản cũ dù CDN đã refresh; (4) response có bị cache bởi tầng khác (service worker, proxy công ty) không. Cách phòng ngừa đúng: với dữ liệu giá, dùng <code>s-maxage=30</code> + purge theo tag khi có thay đổi, và thêm <code>stale-while-revalidate</code> để tránh user phải chờ. Với dữ liệu tồn kho/giá chính xác tuyệt đối, không cache ở CDN mà dùng API riêng + WebSocket/SSE push update."
      },
      {
        "q": "Khi nào bạn KHÔNG nên dùng message queue?",
        "a": "Bốn trường hợp: (1) Khi user cần kết quả ngay trong request — queue chỉ chuyển sang polling, không giảm latency thực; (2) khi nghiệp vụ cần tính nhất quán mạnh và đơn giản (ví dụ trừ tiền trong cùng transaction), queue tạo ra eventual consistency phức tạp hơn nhiều so với một transaction DB; (3) khi volume thấp (dưới vài trăm message/giây) — vận hành Kafka/RabbitMQ tốn công hơn giá trị mang lại, một bảng <code>jobs</code> trong Postgres + worker polling là đủ; (4) khi team chưa có kinh nghiệm vận hành — queue hỏng âm thầm (lag tăng, DLQ đầy) và khó debug hơn nhiều so với một lời gọi hàm đồng bộ. Trong phỏng vấn, nêu được \"khi nào không dùng\" luôn ghi điểm cao hơn \"khi nào dùng\"."
      }
    ]
  },
  "3": {
    "keywords": [
      {
        "term": "B+ tree",
        "def": "Cây cân bằng nhiều nhánh, mỗi node là một page 8–16KB, giá trị nằm ở leaf và các leaf nối nhau bằng linked list. Cập nhật tại chỗ (in-place) nên read rất ổn định O(log n), nhưng write là random I/O. Dùng trong Postgres, MySQL InnoDB, SQL Server."
      },
      {
        "term": "LSM tree",
        "def": "Log-Structured Merge tree: ghi vào memtable + WAL, đầy thì flush thành SSTable bất biến, nền chạy compaction gộp các SSTable. Write tuần tự rất nhanh, read phải tra nhiều tầng nên cần bloom filter. Dùng trong RocksDB, Cassandra, ScyllaDB, HBase."
      },
      {
        "term": "Write amplification",
        "def": "Số byte thực sự ghi xuống disk cho mỗi byte dữ liệu logic. LSM leveled compaction có thể 10–30×, B+ tree ~2–3× (data + WAL + index). Ảnh hưởng trực tiếp tuổi thọ SSD và throughput ghi."
      },
      {
        "term": "Compaction",
        "def": "Tiến trình nền gộp SSTable, xoá bản ghi trùng/tombstone. Size-tiered (gộp file cùng cỡ) rẻ nhưng space amp cao; leveled (mỗi level gấp 10× level trước) read tốt hơn nhưng write amp cao."
      },
      {
        "term": "Bloom filter",
        "def": "Cấu trúc bit xác suất trả lời \"key này chắc chắn không có\" hoặc \"có thể có\". Giúp LSM bỏ qua hàng chục SSTable khi đọc, đổi 1% false positive lấy ~10 bit/key."
      },
      {
        "term": "Tombstone",
        "def": "Bản ghi đánh dấu đã xoá. Trong LSM, delete không xoá ngay mà ghi tombstone; dữ liệu chỉ biến mất sau compaction. Đây là lý do \"xoá 1TB\" đôi khi còn tốn thời gian hơn ghi."
      },
      {
        "term": "Composite index & leftmost prefix",
        "def": "Index trên nhiều cột (a, b, c) sắp xếp theo a rồi b rồi c. Chỉ dùng được khi điều kiện bắt đầu từ cột trái nhất: WHERE a=? ✓, WHERE a=? AND b=? ✓, WHERE b=? ✗."
      },
      {
        "term": "Covering index",
        "def": "Index chứa đủ mọi cột mà query cần, nên engine trả kết quả ngay từ index mà không đọc bảng (index-only scan). Nhanh hơn nhiều lần, đổi lại index to hơn và ghi chậm hơn."
      },
      {
        "term": "Replication lag",
        "def": "Độ trễ giữa lúc leader commit và lúc follower áp dụng xong. Gây ra bất nhất quán đọc: user vừa ghi đã không thấy dữ liệu của mình. Đo bằng seconds_behind_master hoặc LSN/GTID gap."
      },
      {
        "term": "Read-your-writes",
        "def": "Đảm bảo user luôn đọc được ghi của chính mình. Cách làm: route read của user đó về leader trong N giây sau khi ghi, hoặc lưu LSN mới nhất vào session và chỉ đọc replica đã vượt LSN đó."
      },
      {
        "term": "Quorum R + W > N",
        "def": "Với N replica, ghi vào W node và đọc từ R node. Nếu R + W > N thì tập đọc và tập ghi luôn giao nhau ít nhất 1 node, nên đọc thấy bản ghi mới nhất. Với N=3: W=2, R=2."
      },
      {
        "term": "Read repair & hinted handoff",
        "def": "Read repair: khi đọc thấy replica trả version cũ, ghi bản mới trở lại. Hinted handoff: node down thì node khác giữ \"hint\" và gửi lại khi node kia sống. Cả hai để chống lệch dữ liệu mà không cần consensus."
      },
      {
        "term": "Sharding & hotspot",
        "def": "Chia dữ liệu theo key sang nhiều node. Hotspot xảy ra khi một key/prefix chiếm phần lớn lưu lượng (celebrity, ID tăng dần). Sửa bằng salt key, composite key, hoặc tách riêng shard cho key nóng."
      },
      {
        "term": "CDC (Change Data Capture)",
        "def": "Đọc log thay đổi của DB (Postgres WAL, MySQL binlog) và phát thành stream. Không cần dual-write, không bỏ sót, có thứ tự — nền tảng để đồng bộ search index, cache, data warehouse."
      }
    ],
    "quiz": [
      {
        "q": "Bạn cần lưu 500 triệu dòng log, ghi 200.000 dòng/giây, chỉ đọc lại khi điều tra sự cố trong 7 ngày gần nhất, sau đó xoá. Chọn storage nào và tại sao?",
        "a": "Wide-column / time-series trên LSM tree (Cassandra, ScyllaDB, hoặc ClickHouse nếu thiên về analytics). Lý do theo từng tiêu chí: (1) ghi 200k/s là append thuần — LSM ghi tuần tự nên đây đúng điểm mạnh; B+ tree sẽ phải 200k random page write/s, vượt xa IOPS một node; (2) access pattern chỉ là \"đọc theo khoảng thời gian + filter theo service/host\" → shard key <code>(service, date_bucket)</code> với clustering column là timestamp, đọc cực hiệu quả; (3) xoá sau 7 ngày → dùng TTL native, Cassandra tự drop SSTable hết hạn, không tốn thao tác DELETE; (4) không cần transaction, không cần JOIN, không cần update. Điểm cần nêu thêm: TTL + TimeWindowCompactionStrategy giảm write amp; cần tính dung lượng (200k/s × 86400 × 7 ngày ≈ 1,2 tỷ dòng; ở 500B/dòng ≈ 600GB — vừa 3 node). Tránh Postgres vì 200k insert/s cần partitioning phức tạp + autovacuum không theo kịp, dù Postgres có thể làm được ở mức thấp hơn nhiều."
      },
      {
        "q": "Vì sao \"DELETE FROM orders WHERE created_at < now() - interval 3 years\" trên bảng 2 tỷ dòng lại là một sự cố production, và bạn làm gì thay thế?",
        "a": "Câu lệnh này quét và xoá hàng trăm triệu dòng trong một transaction: (1) giữ lock lâu, chặn vacuum; (2) sinh WAL khổng lồ, có thể đầy disk; (3) với MVCC, các dòng bị đánh dấu dead nhưng không giải phóng disk cho đến khi VACUUM FULL chạy — bảng còn <em>phình ra</em> trước khi nhỏ lại; (4) replication lag tăng vọt vì replica phải replay toàn bộ; (5) nếu transaction abort giữa chừng, rollback còn tốn hơn. Cách đúng: nếu bảng đã partition theo tháng/năm → <code>ALTER TABLE ... DETACH PARTITION</code>, export ra S3, rồi <code>DROP TABLE</code> — tức thời, không sinh WAL cho từng dòng. Nếu chưa partition → partition lại (tạo bảng mới partitioned, copy dữ liệu theo batch, swap tên), hoặc xoá theo batch nhỏ (10k dòng/lần, sleep giữa các batch) và chấp nhận chạy nhiều giờ. Bài học: thiết kế partition từ đầu rẻ hơn sửa sau 100 lần."
      },
      {
        "q": "Hệ thống của bạn dùng read replica. User phàn nàn: \"Tôi vừa đổi mật khẩu, đăng nhập lại bằng mật khẩu cũ vẫn được.\" Phân tích và sửa.",
        "a": "Đây là vi phạm read-your-writes kinh điển. Luồng: user đổi mật khẩu → ghi vào leader → app redirect/refresh → request đọc tiếp theo được load balancer đẩy sang replica chưa kịp replay → app đọc hash cũ → xác thực bằng mật khẩu cũ thành công. Cửa sổ lỗi thường 50–500ms nhưng hoàn toàn đủ để xảy ra. Sửa theo thứ tự ưu tiên: (1) <strong>route theo loại dữ liệu</strong> — mọi read liên quan đến xác thực/phiên/thanh toán đi thẳng leader, đây là cách đơn giản và đúng nhất; (2) <strong>sticky-by-LSN</strong> — sau khi ghi, lưu LSN/GTID vào session (cookie hoặc Redis), các read sau đó chỉ được phục vụ bởi replica đã vượt LSN đó, nếu chưa thì chờ hoặc fallback leader; (3) <strong>time-based stickiness</strong> — route read của user về leader trong 3 giây sau lần ghi gần nhất (đơn giản, hiệu quả ~95%). Lưu ý quan trọng: không nên \"sửa\" bằng cách tăng số replica hay giảm tải — lag là tính chất, không phải lỗi. Và với mật khẩu/bảo mật, đừng bao giờ chấp nhận eventually consistent dù chỉ 100ms."
      },
      {
        "q": "Với N=3, bạn cấu hình W=2, R=2. Một node chết. Điều gì xảy ra với read và write? Nếu hai node chết thì sao?",
        "a": "Một node chết: write vẫn thành công vì cần W=2 trên 2 node còn sống (đúng bằng ngưỡng, không có dư địa). Read vẫn thành công vì R=2 trên 2 node còn sống. Nhưng hệ thống <strong>không còn khả năng chịu lỗi thêm</strong> — node thứ hai chết là sập cả read lẫn write ở cấu hình chặt này (trừ khi bật sloppy quorum, lúc đó write vẫn được nhưng mất đảm bảo R+W&gt;N). Hai node chết: chỉ còn 1 node, không đạt W=2 hay R=2 → toàn bộ request liên quan partition đó thất bại. Đây là lý do thực tế người ta dùng: <strong>N=3, W=2, R=1</strong> cho read-heavy (chịu được 2 node chết cho read, 1 node cho write), hoặc <strong>N=5, W=3, R=3</strong> cho hệ thống quan trọng (chịu 2 node chết, vẫn đảm bảo R+W&gt;N). Cần nêu thêm: chọn N theo số AZ — N=3 trên 3 AZ là tối thiểu để chịu mất 1 AZ; đừng đặt N=2 vì mất 1 node là mất quorum."
      },
      {
        "q": "Bạn shard bảng posts theo author_id. Tính năng \"news feed\" cần lấy 20 bài mới nhất từ những người mình follow (trung bình 200 người). Bạn thiết kế thế nào?",
        "a": "Cách ngây thơ: query 200 shard (mỗi author có thể ở shard khác nhau), merge, lấy top 20 — 200 network round-trip cho một lần load feed, p99 sẽ tính bằng giây và rất dễ timeout. Ba hướng: (1) <strong>Fan-out on write</strong> — khi user đăng bài, worker đẩy post_id vào bảng <code>feed_entries</code> shard theo <code>user_id</code> (người nhận). Đọc feed = 1 shard, 1 query. Cái giá: một post của người có 5000 follower = 5000 write; với celebrity phải xử lý riêng. (2) <strong>Hybrid</strong> (cách các hệ thống lớn làm): user thường fan-out on write; user có &gt; 10k follower thì fan-out on read — khi đọc feed, lấy danh sách celebrity đã follow (thường chỉ 10–50 người) và query riêng rồi merge với phần đã push sẵn. Đây là cách Instagram/Twitter mô tả. (3) <strong>Cache-heavy</strong> — cache feed của user active trong Redis (sorted set theo timestamp), tính lại nền. Giảm 90% query nhưng vẫn cần (1) hoặc (2) làm nền. Điểm cần nêu trong phỏng vấn: đây là bài toán <em>write amplification vs read latency</em>, và câu trả lời đúng là \"hybrid, có ngưỡng follower cụ thể\"."
      },
      {
        "q": "Team bạn thêm một index cho mỗi query chậm. Sau 6 tháng, bảng orders có 14 index, write throughput giảm 60%. Bạn xử lý thế nào?",
        "a": "Chẩn đoán trước khi hành động: (1) query <code>pg_stat_user_indexes</code> (hoặc <code>sys.dm_db_index_usage_stats</code>) để tìm index có <code>idx_scan = 0</code> — thường 30–50% index không bao giờ được dùng sau khi thêm; (2) tìm index trùng lặp hoặc bị \"bao phủ\" bởi index khác — index <code>(a)</code> dư thừa nếu đã có <code>(a, b)</code>; (3) kiểm tra index dùng cho query hiếm (báo cáo tháng) nhưng tốn write mỗi giây. Hành động: drop các index <code>idx_scan = 0</code> trong 30 ngày (dùng <code>DROP INDEX CONCURRENTLY</code> để không khoá bảng), gộp các index trùng prefix, và chuyển các query báo cáo sang read replica hoặc OLAP. Đo lại sau mỗi lần drop. Phòng ngừa dài hạn: đặt quy trình review index (mọi index mới phải chứng minh bằng <code>EXPLAIN ANALYZE</code> trước/sau), đặt alert khi write latency tăng, và theo dõi tỉ lệ <code>index bytes / table bytes</code> — trên 50% là dấu hiệu cần rà soát. Con số nên nhớ: mỗi index thêm ~1 random write mỗi INSERT, và ~10–20% dung lượng bảng."
      }
    ]
  },
  "4": {
    "keywords": [
      {
        "term": "Failure model",
        "def": "Cách bạn giả định hệ thống hỏng. Crash-stop (chết hẳn, dễ), crash-recovery (chết rồi sống lại, mất RAM), omission (mất message), Byzantine (nói dối/bị compromise). Mọi thuật toán đều giả định một model cụ thể — dùng sai model là vô nghĩa."
      },
      {
        "term": "Fault vs Failure",
        "def": "Fault: một thành phần hỏng (1 ổ đĩa chết). Failure: hệ thống ngừng phục vụ đúng. Hệ thống tốt là hệ thống chịu được fault mà không thành failure — redundancy + detection + recovery."
      },
      {
        "term": "FLP impossibility",
        "def": "Trong hệ bất đồng bộ hoàn toàn, không có thuật toán đồng thuận nào vừa an toàn vừa đảm bảo kết thúc khi có dù chỉ 1 tiến trình chết. Thực tế lách bằng timeout (partial synchrony) — đánh đổi liveness lấy safety."
      },
      {
        "term": "CAP theorem",
        "def": "Khi có network partition, bạn chỉ chọn được Consistency hoặc Availability. C (linearizability) không phải \"ACID C\" (nhất quán trong 1 DB). P không phải \"chọn được\" — mạng sẽ partition, bạn chỉ chọn phản ứng."
      },
      {
        "term": "PACELC",
        "def": "Mở rộng CAP: nếu Partition → chọn A hoặc C (PAC); Else (bình thường) → chọn Latency hoặc Consistency (ELC). Phần ELC mới là thứ ảnh hưởng 99,9% thời gian hệ thống chạy."
      },
      {
        "term": "Linearizability",
        "def": "Mọi thao tác trông như xảy ra tức thời tại một điểm giữa lúc gọi và lúc trả về, và mọi client thấy cùng một thứ tự. Mạnh nhất, đắt nhất — cần consensus hoặc single leader."
      },
      {
        "term": "Raft",
        "def": "Thuật toán consensus dễ hiểu: bầu leader bằng term + majority vote, replicate log, commit khi đa số đã ghi. Leader lease + pre-vote tránh split brain. etcd, Consul, CockroachDB, TiKV dùng Raft."
      },
      {
        "term": "Term & log index",
        "def": "Term: số nhiệm kỳ tăng dần, dùng để từ chối message từ leader cũ. Log index: vị trí entry trong log. Cặp (term, index) xác định duy nhất một entry — nền tảng của mọi so sánh \"mới hơn/cũ hơn\"."
      },
      {
        "term": "Split brain",
        "def": "Hai node cùng nghĩ mình là leader và cùng nhận ghi. Dữ liệu phân kỳ không merge được. Chống bằng majority quorum + fencing token, không bao giờ bằng \"ping nhanh hơn thì thắng\"."
      },
      {
        "term": "Fencing token",
        "def": "Số epoch tăng dần cấp cho mỗi leader. Storage từ chối mọi write có epoch nhỏ hơn epoch lớn nhất đã thấy. Leader cũ dù còn sống cũng không ghi được — đây là cách duy nhất thật sự an toàn."
      },
      {
        "term": "2PC (two-phase commit)",
        "def": "Prepare → tất cả đồng ý → Commit. Đảm bảo atomic nhưng blocking: nếu coordinator chết sau prepare, participant giữ lock vô hạn. Cần coordinator HA + timeout + recovery log."
      },
      {
        "term": "Saga",
        "def": "Chuỗi local transaction, mỗi bước có compensating action để hoàn tác. Không atomic, chỉ eventual. Dùng cho workflow dài (đặt vé, thanh toán) nơi 2PC không khả thi vì lock quá lâu."
      },
      {
        "term": "Idempotency key",
        "def": "Client sinh UUID cho mỗi ý định (không phải mỗi lần gửi). Server lưu key + kết quả; gặp lại key thì trả kết quả cũ thay vì thực thi lần nữa. Bắt buộc cho mọi API ghi tiền."
      },
      {
        "term": "Circuit breaker",
        "def": "Đếm lỗi của dependency; vượt ngưỡng thì mở mạch, fail fast thay vì chờ timeout. Nửa mở để thử lại. Ngăn lỗi lan truyền (cascading failure) và giải phóng thread/connection."
      },
      {
        "term": "Bulkhead",
        "def": "Cô lập tài nguyên theo nhóm: mỗi dependency có thread pool/connection pool riêng. Một dependency chậm không ăn hết pool của toàn service. Đặt tên theo khoang tàu — thủng một khoang không chìm cả tàu."
      },
      {
        "term": "Observability",
        "def": "Ba trụ: metrics (số), logs (sự kiện rời rạc), traces (đường đi của 1 request qua N service). Thiếu traces là mù khi debug hệ phân tán — không thể suy luận từ log rời rạc."
      }
    ],
    "quiz": [
      {
        "q": "Bạn được hỏi thiết kế hệ thống đặt vé xem phim. Có 100 ghế, 50.000 người cùng bấm mua vé VIP cuối cùng. Làm sao đảm bảo không bán trùng?",
        "a": "Đây là bài toán \"lost update\" kinh điển, và có ba tầng bảo vệ nên dùng <em>cùng nhau</em>: (1) <strong>Conditional UPDATE ở DB</strong> — <code>UPDATE seats SET status='sold', order_id=? WHERE id=? AND status='available'</code> rồi kiểm tra <code>rowsAffected</code>. Nếu 0 thì ghế đã bị người khác lấy. Đây là tầng đúng đắn cuối cùng, không bao giờ bỏ. (2) <strong>Reservation có TTL</strong> — khi user vào bước thanh toán, đánh dấu <code>held_until = now() + 10 phút</code>. Job hoặc lazy check giải phóng ghế hết hạn. Tránh việc giỏ hàng treo giữ ghế vĩnh viễn. (3) <strong>Giảm tải trước khi vào DB</strong> — Redis giữ tập ghế còn trống, dùng Lua script atomic để \"giữ chỗ\" tạm; chỉ ~100–200 request thắng mới thực sự chạm DB. 50.000 request còn lại nhận \"hết vé\" ngay từ Redis mà không tạo áp lực DB. Ngoài ra: đặt rate limit theo user (1 người không thể giữ 50 ghế), dùng hàng đợi ảo (virtual waiting room) để làm phẳng traffic, và <strong>không dùng distributed lock cho từng ghế</strong> — 100 lock cho 50.000 request là tự sát về latency và vẫn có thể sai. Câu chốt: \"Tính đúng đắn ở DB bằng conditional update; Redis chỉ để giảm tải.\""
      },
      {
        "q": "Hệ thống của bạn dùng Saga 4 bước. Bước 3 (trừ tiền) thành công, bước 4 (giao hàng) thất bại, và hành động bù trừ của bước 3 (hoàn tiền) cũng thất bại vì payment gateway đang down. Bạn xử lý thế nào?",
        "a": "Đây là tình huống Saga không hoàn tất được và không có câu trả lời \"tự động\" — phải thiết kế trước. Cách xử lý đúng: (1) <strong>Compensation phải retry vô hạn với backoff</strong> — không có giới hạn số lần, vì bỏ cuộc nghĩa là user mất tiền. Lưu trạng thái <code>compensation_pending</code> bền vững và một worker riêng liên tục thử lại. (2) <strong>Idempotent compensation</strong> — refund với idempotency key để retry 100 lần vẫn chỉ hoàn 1 lần. (3) <strong>Hàng đợi chết + cảnh báo người</strong> — nếu quá 15 phút, escalate cho đội vận hành/đối soát tài chính, không im lặng. (4) <strong>Đối soát định kỳ</strong> — job hằng ngày so khớp ledger với sao kê payment gateway, phát hiện giao dịch treo. (5) <strong>Thiết kế lại thứ tự bước</strong> — đây là bài học lớn nhất: đặt bước khó bù trừ nhất (trừ tiền) <em>sau cùng</em>, hoặc dùng mô hình \"authorize → capture\" của payment gateway: authorize giữ tiền (không trừ thật, hết hạn tự huỷ sau 7 ngày), chỉ capture khi mọi bước khác xong. Với thẻ tín dụng, authorize/capture là cách chuẩn để tránh đúng tình huống này. Câu chốt trong phỏng vấn: \"Saga cần một job đối soát, nếu không thì không ai biết có giao dịch treo.\""
      },
      {
        "q": "Bạn cần đảm bảo chỉ một instance chạy job tổng hợp báo cáo mỗi đêm. Có 5 instance. Chọn cơ chế nào và vì sao?",
        "a": "Ba lựa chọn theo thứ tự ưu tiên: (1) <strong>Leader election bằng etcd/Consul (Raft-based)</strong> — an toàn nhất, vì lease được gia hạn qua consensus, không bị split brain khi partition. etcd có <code>election</code> API sẵn; khi instance mất lease, instance khác tiếp quản trong vài giây. (2) <strong>SQL advisory lock / <code>FOR UPDATE SKIP LOCKED</code></strong> — nếu bạn đã có Postgres, dùng <code>pg_try_advisory_lock(key)</code> hoặc một bảng <code>jobs</code> với <code>SELECT ... FOR UPDATE SKIP LOCKED</code>. Đơn giản, không thêm hạ tầng, đủ tốt cho hầu hết nhu cầu. (3) <strong>Kubernetes CronJob với <code>concurrencyPolicy: Forbid</code></strong> — nếu chạy trên K8s, đây là cách gọn nhất; K8s đảm bảo không có 2 Job cùng tên chạy đồng thời. Tránh: Redis SETNX thuần (không an toàn dưới partition, có thể split brain), hoặc \"kiểm tra bảng xem đã chạy chưa\" (check-then-act, race condition). Thêm hai chi tiết thực tế: (a) job phải <strong>idempotent</strong> dù đã có lock — vì lock có thể hết hạn giữa lúc chạy, và lần chạy trước có thể đã ghi một phần; (b) đặt <strong>alert khi job không chạy</strong> trong 26 giờ — im lặng thất bại là kiểu lỗi tệ nhất."
      },
      {
        "q": "Service A gọi B, C, D song song. B bình thường, C chậm 5 giây, D chết. Timeout của A là 10s. Điều gì xảy ra và bạn sửa thế nào?",
        "a": "Vấn đề: A chờ cả ba (hoặc chờ đến khi tất cả trả về). C mất 5s mỗi request, D mất 10s rồi timeout. Với 200 RPS và mỗi request giữ thread 10s, A cần 2.000 thread đồng thời — thread pool mặc định (200) đầy trong 1 giây, sau đó A <strong>từ chối toàn bộ</strong> request kể cả những request chỉ cần B. Cụ thể các sửa: (1) <strong>Timeout riêng cho từng dependency</strong>, không dùng chung 10s: B 200ms, C 500ms, D 300ms — đặt theo p99.9 của từng cái. (2) <strong>Circuit breaker cho D</strong>: sau ~20 lỗi, mở mạch, fail fast trong 30s, không giữ thread nào. (3) <strong>Bulkhead</strong>: pool riêng cho từng dependency, C chậm không ăn pool của B. (4) <strong>Graceful degradation</strong>: nếu D chết, A vẫn trả kết quả dựa trên B và C, chỉ thiếu phần của D (ví dụ \"recommendation tạm không khả dụng\") thay vì lỗi cả trang. (5) <strong>Đặt deadline tổng cho request</strong> (gRPC deadline / context timeout): nếu request đã dùng 800ms thì không bắt đầu thêm call nào, kể cả khi từng call riêng còn hạn. Điểm quan trọng nhất để nêu: \"A phải chịu được việc mất một dependency, không chỉ chịu được việc dependency trả lỗi nhanh.\""
      },
      {
        "q": "Trong phỏng vấn, bạn được hỏi \"chọn CP hay AP?\". Hãy trả lời trong 60 giây.",
        "a": "Câu trả lời tốt: \"Trước hết, tôi không chọn một lần cho cả hệ thống — tôi chọn theo từng nhóm dữ liệu, vì P chỉ áp dụng khi có partition, và phần lớn thời gian hệ thống không có partition nên PACELC mới là câu hỏi thật. Cụ thể với hệ thống này: <strong>phần thanh toán và tồn kho tôi chọn CP</strong> — khi mất kết nối giữa hai region, tôi thà từ chối ghi và trả lỗi 503 có thể retry, còn hơn cho phép bán một chiếc áo cuối cùng hai lần. Tôi implement bằng một leader region cho writes + Raft giữa 3 AZ, và failover có fencing token để không split brain. <strong>Phần feed, like, view count tôi chọn AP</strong> — dữ liệu trễ 2 giây không ảnh hưởng ai, nhưng không thể để user không mở được app. Tôi dùng Cassandra/DynamoDB với W=1, R=1 và chấp nhận đọc bản cũ, có read repair nền. <strong>Hệ quả tôi phải chấp nhận</strong>: hai nhóm này không nhất quán với nhau — một order có thể xuất hiện trong feed trước khi inventory commit. Tôi xử lý bằng outbox + event để trạng thái cuối cùng hội tụ, và UI hiển thị trạng thái 'đang xử lý' cho khoảng thời gian đó. Nếu đề bài cần nhất quán xuyên suốt, tôi sẽ nói rõ rằng chi phí tăng đáng kể và đề xuất thu hẹp phạm vi transaction.\""
      },
      {
        "q": "Bạn phát hiện trong log có 0,1% request bị trừ tiền hai lần. Nguyên nhân có thể là gì và bạn điều tra theo thứ tự nào?",
        "a": "Điều tra theo thứ tự từ ngoài vào trong: (1) <strong>Kiểm tra retry</strong> — client/gateway/service có retry không, và API thanh toán có idempotency key không. Đây là nguyên nhân của ~80% trường hợp. Nếu không có key hoặc client sinh key mới mỗi lần retry, tìm ra ngay. (2) <strong>Kiểm tra timeout</strong> — nếu timeout < thời gian xử lý thật, request \"thất bại\" với client nhưng thực ra đã thành công ở server; client retry → trừ 2 lần. So khớp: log có pattern \"timeout rồi có 1 success sau đó\"? (3) <strong>Kiểm tra duplicate message</strong> — nếu thanh toán đi qua queue/Kafka, consumer có idempotent không? Có ai rebalance partition gây replay không? (4) <strong>Kiểm tra failover</strong> — có lần nào leader DB failover trong khung giờ đó không? Nếu có, transaction đã commit trên leader cũ nhưng không replicate, client retry,... (5) <strong>Kiểm tra code</strong> — có path nào gọi <code>charge()</code> hai lần (ví dụ vừa trong handler vừa trong callback)? Có async retry library tự động không? Về phòng ngừa: đặt <strong>unique constraint trên (order_id, charge_type)</strong> ở bảng payment — đây là lưới an toàn cuối cùng, DB sẽ từ chối lần trừ thứ hai. Thêm alert khi phát hiện 2 payment cho cùng order (dùng streaming job so khớp liên tục, không chờ đối soát cuối ngày). Con số 0,1% rất đáng chú ý: nếu là race condition thuần, tỉ lệ thường thấp hơn nhiều; 0,1% gợi ý một điều kiện cụ thể (một loại timeout, một loại lỗi mạng, hoặc một khung giờ) — hãy group log theo loại lỗi và theo phút để tìm pattern."
      }
    ]
  },
  "5": {
    "keywords": [
      {
        "term": "Snowflake ID",
        "def": "64 bit = 1 bit sign + 41 bit timestamp (ms, đủ 69 năm) + 10 bit machine (1024 node) + 12 bit sequence (4096 id/ms/node). Sinh 4,1 triệu ID/s/node, sắp theo thời gian, không cần coordination."
      },
      {
        "term": "Base62 encoding",
        "def": "Bảng chữ [0-9a-zA-Z] = 62 ký tự. 7 ký tự cho 62⁷ ≈ 3,52×10¹² tổ hợp. Dùng để rút gọn ID số thành short code; giải mã ngược được nếu biết thuật toán."
      },
      {
        "term": "Consistent hashing",
        "def": "Vòng hash 0…2³²; node và key cùng ánh xạ lên vòng; key thuộc node gần nhất theo chiều kim đồng hồ. Thêm node chỉ di chuyển ~1/N key. Virtual node (150–200/node) để phân bố đều."
      },
      {
        "term": "Token bucket",
        "def": "Xô chứa token, nạp đều theo rate (ví dụ 100/s), capacity cho phép burst. Mỗi request lấy 1 token, không đủ thì 429. Cho phép burst có kiểm soát — khác fixed window."
      },
      {
        "term": "Sliding window counter",
        "def": "Xấp xỉ: đếm của window trước × (phần còn lại) + đếm window hiện tại. Sai số &lt; 0,003% (Cloudflare, 400M request), rẻ hơn sliding window log (O(1) thay vì O(requests))."
      },
      {
        "term": "Fan-out on write",
        "def": "Khi đăng bài, đẩy vào feed của mọi follower ngay. Đọc nhanh (1 query), ghi đắt. Với celebrity 50M follower → 50M write cho 1 post, phải xử lý riêng."
      },
      {
        "term": "Fan-out on read",
        "def": "Khi mở feed, gom post của những người mình follow. Ghi rẻ, đọc đắt (N query). Kết hợp hybrid: user thường fan-out on write, celebrity fan-out on read."
      },
      {
        "term": "Push vs Pull (chat)",
        "def": "Push: sender đẩy tới receiver qua WebSocket nếu online. Pull: receiver sync khi mở app/có kết nối. Cần cả hai cho reliability — push cho realtime, pull cho offline."
      },
      {
        "term": "Presence service",
        "def": "Theo dõi ai đang online. Heartbeat mỗi 5–30s vào KV/TTL store; không có heartbeat → offline. Cần pub/sub để fan-out trạng thái tới bạn bè."
      },
      {
        "term": "Trie / prefix index",
        "def": "Cây theo ký tự. Node lưu top-K kết quả phổ biến nhất của prefix đó. Tra prefix O(len) thay vì scan toàn bộ; cần cập nhật định kỳ từ query log."
      },
      {
        "term": "Segment / DAG (video)",
        "def": "Video được cắt thành segment 2–10s, encode nhiều bitrate (HLS/DASH), manifest mô tả. Client chọn bitrate theo băng thông. Cho phép CDN cache từng segment, adaptive streaming."
      },
      {
        "term": "Chunking & dedup (drive)",
        "def": "File chia block 4MB, hash mỗi block, block trùng chỉ lưu 1 lần. Upload lại file đã có gần như tức thời. Đây là nền tảng của Google Drive/Dropbox."
      },
      {
        "term": "Idempotency key",
        "def": "Bắt buộc cho mọi API ghi tiền. Client sinh một lần cho mỗi ý định; server lưu key + response, gặp lại thì trả response cũ."
      },
      {
        "term": "Double-entry ledger",
        "def": "Mỗi giao dịch ghi 2 bút toán (nợ/có), tổng luôn = 0. Không bao giờ UPDATE số dư trực tiếp; số dư = tổng các bút toán. Cho phép đối soát và phát hiện sai lệch."
      },
      {
        "term": "Write-ahead log (WAL)",
        "def": "Ghi ý định thay đổi tuần tự trước khi áp dụng. Phục hồi sau crash bằng replay. Nền tảng của mọi DB bền vững và của CDC."
      },
      {
        "term": "Cursor pagination",
        "def": "Phân trang bằng con trỏ (id/timestamp của item cuối) thay vì OFFSET. OFFSET 1.000.000 phải scan 1 triệu dòng; cursor chỉ cần WHERE id &lt; last_id LIMIT 20."
      }
    ],
    "quiz": [
      {
        "q": "Bạn thiết kế URL shortener và chọn MD5 + lấy 7 ký tự base62. Sau 2 năm, bạn phát hiện tỉ lệ va chạm tăng. Giải thích nguyên nhân bằng số và đề xuất hai cách sửa.",
        "a": "Nguyên nhân là <strong>birthday paradox</strong>. Với <code>d = 62⁷ ≈ 3,52×10¹²</code> không gian mã và <code>n</code> URL đã tạo, kỳ vọng số cặp va chạm ≈ n²/(2d). Sau 2 năm ở 100M/ngày: n = 7,3×10¹⁰ → kỳ vọng ≈ (7,3×10¹⁰)²/(2×3,52×10¹²) ≈ <strong>757 triệu va chạm</strong>. Tỉ lệ mỗi lần ghi gặp va chạm ≈ 757M/7,3×10¹⁰ ≈ 1,04% — nghĩa là khoảng 1 trong 100 lần ghi phải thử lại. Tệ hơn, khi số URL tiến gần không gian mã, tỉ lệ này tăng phi tuyến. Hai cách sửa: <strong>(1) Chuyển sang ID tuần tự/Snowflake → base62.</strong> Không bao giờ va chạm vì mỗi ID là duy nhất theo cấu trúc; nhược điểm là code dài dần (7→8 ký tự khi vượt 3,52×10¹²). <strong>(2) Tăng độ dài lên 8 ký tự</strong> — 62⁸ ≈ 2,18×10¹⁴, gấp 62 lần dư địa, kỳ vọng va chạm giảm xuống còn ~12 nghìn. Cách này giữ nguyên logic hash. Ngoài ra, cách đang chạy phải có <strong>retry với salt</strong>: khi phát hiện trùng, hash lại với <code>longURL + salt</code>, thử tối đa 3–5 lần rồi báo lỗi. Điểm quan trọng trong phỏng vấn: nêu được công thức birthday paradox và con số cụ thể, không chỉ nói \"hash có thể trùng\"."
      },
      {
        "q": "Rate limiter của bạn dùng fixed window 1.000 request/giờ. Một client bị chặn liên tục dù chỉ gửi 600 request/giờ. Nguyên nhân có thể là gì?",
        "a": "Ba nguyên nhân khả dĩ, theo thứ tự phổ biến: <strong>(1) Nhiều instance đếm riêng không phải vấn đề ở đây</strong> (nếu in-memory thì client bị chặn <em>ít</em> hơn, không phải nhiều hơn) — nhưng nếu dùng Redis với key không thống nhất (ví dụ key chứa instance_id hoặc timestamp khác nhau), tổng limit bị chia nhỏ. <strong>(2) Window không khớp với kỳ vọng của user:</strong> fixed window tính từ mốc cố định (00:00, 01:00). Nếu user gửi 600 request trong 30 phút cuối giờ trước và 600 trong 30 phút đầu giờ sau, họ thấy \"600/giờ\" nhưng thực tế đã dùng 1.200 trong 60 phút → bị chặn. Đây là <em>biên window</em> — chính là nhược điểm của fixed window. <strong>(3) Đếm cả request bị từ chối:</strong> nếu code tăng counter trước khi kiểm tra, mỗi lần bị 429 lại cộng thêm 1 → client càng retry càng bị khoá chặt. Đây là bug rất phổ biến. Sửa: chuyển sang <strong>sliding window counter</strong> (giải quyết cả (2)), chỉ tăng counter khi request được chấp nhận (giải quyết (3)), và trả header <code>X-RateLimit-Remaining</code> + <code>Retry-After</code> để client biết khi nào thử lại. Nếu vẫn còn lệch, kiểm tra xem có proxy/CDN nào đếm thêm không."
      },
      {
        "q": "Bạn thiết kế news feed cho 150 triệu DAU. Celebrity có 50 triệu follower đăng 10 tweet/ngày. Tính xem fan-out on write thuần có khả thi không.",
        "a": "Tính cụ thể: 1 celebrity × 10 tweet/ngày × 50M follower = <strong>500 triệu write/ngày chỉ cho một celebrity</strong>. Giả sử có 1.000 celebrity ở mức đó → 500 tỷ write/ngày = <strong>5,8 triệu write/s</strong> trung bình, và peak có thể 15–20 triệu/s. Một cluster Redis lớn (100 node) chịu được khoảng 1–2 triệu op/s. Vậy fan-out on write thuần <strong>không khả thi</strong> — cần gấp 5–10 lần hạ tầng lớn nhất có thể, và mỗi tweet của celebrity tạo ra \"write storm\" làm chậm toàn bộ hàng đợi (head-of-line blocking). Thêm vấn đề: 90% follower không online trong 10 phút tới — bạn đang pre-compute cho người không đọc. Giải pháp hybrid: <strong>ngưỡng follower = 10.000</strong>. Dưới ngưỡng: fan-out on write (chiếm ~99,9% số user nhưng chỉ vài % tổng write). Trên ngưỡng: chỉ ghi vào timeline của tác giả, và khi user mở feed thì merge timeline của những celebrity họ follow. Với user follow 200 người, thường chỉ 5–20 là celebrity → 5–20 query song song, ~50ms. Con số cần nêu: ngưỡng 10k, và \"99,9% user đi đường push, 0,1% đi đường pull, nhưng 0,1% đó chiếm 95% khối lượng fan-out\"."
      },
      {
        "q": "Trong chat system, bạn lưu mỗi message một lần trong Cassandra hay copy vào inbox của từng người nhận? Giải thích bằng con số.",
        "a": "Lưu <strong>một lần</strong>, tuyệt đối không copy. Con số: 500 triệu message/ngày, group trung bình 5 người. Nếu copy vào inbox từng người: 2,5 tỷ write/ngày = 29.000 write/s, nhân với dung lượng (kể cả message nhỏ 200 byte + metadata) ≈ 500GB/ngày chỉ riêng phần nhân bản. Với group 500 người (cộng đồng), một message thành 500 write → 500× phóng đại. Và khi user rời group, bạn phải xoá hàng nghìn bản copy. Cách đúng: message lưu một lần với partition key <code>(conversation_id, bucket)</code>, clustering key là <code>msg_id</code> giảm dần. Người nhận đọc bằng <code>WHERE conversation_id = ? AND msg_id &lt; last_seen ORDER BY msg_id DESC LIMIT 50</code>. Trạng thái \"đã đọc\" lưu riêng trong bảng <code>read_state (user_id, conversation_id, last_read_msg_id)</code> — một dòng/user/conversation, không phải một dòng/message/user. Điều này giảm từ 2,5 tỷ write/ngày xuống còn 500 triệu, và cho phép sync hiệu quả: client chỉ cần biết <code>last_read_msg_id</code> của mình để lấy phần còn thiếu. Ngoại lệ duy nhất: nếu cần \"inbox\" hiển thị conversation gần nhất kèm preview, lưu một dòng/user/conversation (không phải /message) — đó là materialized view, cập nhật khi có message mới."
      },
      {
        "q": "Với 10 triệu sản phẩm và 50.000 query/giây, tại sao không dùng Postgres với LIKE? Thiết kế thay thế và giải thích từng tầng.",
        "a": "Postgres <code>LIKE '%áo thun%'</code> không dùng được B-tree index (vì bắt đầu bằng <code>%</code>) → full table scan 10 triệu dòng cho <em>mỗi</em> query. Ở 50.000 QPS, mỗi scan 10 triệu dòng dù chỉ 20ms thì cần 1.000 core chỉ để scan, và không thể cache vì mỗi query khác nhau. Thêm nữa LIKE không có relevance ranking — không biết kết quả nào liên quan hơn. Thay thế 3 tầng: <strong>Tầng 1 — Retrieval (Elasticsearch)</strong>: inverted index + BM25, 10 triệu document với ~1KB text ≈ 10–20GB index, chia 5 shard × 2 replica = 10 node. Query đặt text trong <code>must</code> (tính điểm) và mọi filter (category, price, stock) trong <code>filter</code> (cache được). 50.000 QPS đọc cần ~20–30 replica shard. <strong>Tầng 2 — Cache (Redis)</strong>: top 1.000–10.000 search term phổ biến chiếm phần lớn traffic (phân bố Zipf). Cache kết quả 60s → giảm 60–70% tải ES. <strong>Tầng 3 — Đồng bộ (CDC)</strong>: Postgres là source of truth; Debezium đọc WAL → Kafka → consumer index vào ES với upsert (idempotent). Độ trễ 1–3s, chấp nhận được cho search. Chi tiết quan trọng: <code>track_total_hits: false</code>, <code>search_after</code> thay vì <code>from/size</code> khi phân trang sâu, và job rebuild index định kỳ (blue/green alias swap) để sửa drift. Con số chốt: 10M doc → 5 shard × 2 replica; ES không phải source of truth."
      },
      {
        "q": "Hệ thống thanh toán của bạn nhận webhook từ PSP. Bạn phát hiện có đơn bị capture hai lần. Trình bày cách điều tra và ba lớp phòng ngừa.",
        "a": "Điều tra: (1) kiểm tra <strong>webhook trùng</strong> — PSP thường gửi lại nếu không nhận 200 trong 5s; nếu handler của bạn không idempotent theo <code>event_id</code>, hai lần gửi = hai lần capture. (2) kiểm tra <strong>retry từ phía bạn</strong> — nếu gọi PSP API capture và bị timeout, bạn retry mà không gửi <code>Idempotency-Key</code> → PSP tạo giao dịch mới. (3) kiểm tra <strong>state machine</strong> — có path nào cho phép capture từ trạng thái không phải AUTHORIZED? Ví dụ webhook <code>payment_intent.succeeded</code> và <code>charge.succeeded</code> cùng đến, cả hai đều trigger capture. (4) kiểm tra <strong>đa instance</strong> — hai worker cùng xử lý một event (Kafka rebalance, hoặc hai consumer group) mà không có lock/dedupe. Ba lớp phòng ngừa: <strong>(1) Idempotency key ở tầng client/nội bộ</strong> — bảng <code>idempotency_keys</code> với <code>PRIMARY KEY (user_id, key)</code>, <code>INSERT ... ON CONFLICT DO NOTHING</code>, lưu cả response. <strong>(2) Idempotency key tới PSP</strong> — mọi call capture gửi header <code>Idempotency-Key: {order_id}:{attempt_purpose}</code>, PSP sẽ trả cùng kết quả cho key trùng. <strong>(3) UNIQUE constraint ở ledger</strong> — <code>UNIQUE (order_id, entry_kind)</code> trên bảng bút toán; bút toán thứ hai bị DB từ chối bằng lỗi duplicate thay vì ghi âm thầm. Đây là lưới cuối cùng và không thể bypass. Thêm: job đối soát hằng ngày so ledger với settlement report của PSP, alert khi số dư tổng ≠ 0 hoặc khi có 2 capture cho cùng order — phát hiện trong 24h thay vì khi khách phàn nàn."
      }
    ]
  },
  "6": {
    "keywords": [
      {
        "term": "Microservices vs Modular Monolith",
        "def": "Microservices: mỗi service deploy độc lập, giao tiếp qua mạng. Modular monolith: một deployable, module tách biệt rõ ràng. Với team < 20 người, modular monolith gần như luôn thắng về chi phí và tốc độ."
      },
      {
        "term": "Service boundary",
        "def": "Ranh giới nơi một thay đổi nghiệp vụ chỉ chạm một service. Sai boundary = mỗi feature phải deploy 3 service + coordination. Chia theo bounded context (DDD), không theo tầng kỹ thuật."
      },
      {
        "term": "Distributed monolith",
        "def": "Anti-pattern: tách thành nhiều service nhưng vẫn gọi đồng bộ chéo, deploy cùng nhau, dùng chung DB. Tệ hơn monolith vì có mọi nhược điểm của cả hai."
      },
      {
        "term": "Container & image",
        "def": "Image: filesystem bất biến (layers). Container: process cô lập chạy từ image. Build một lần, chạy mọi nơi — hết \"trên máy tôi chạy được\"."
      },
      {
        "term": "Kubernetes control plane",
        "def": "API server + etcd (state) + scheduler (chọn node) + controller manager (reconcile vòng lặp). Bạn khai báo trạng thái mong muốn, control plane liên tục đưa thực tế về đó."
      },
      {
        "term": "Reconcile loop",
        "def": "Vòng lặp vô hạn: đọc desired state → so sánh với actual → hành động. Đây là mô hình tư duy của cloud-native: khai báo, không ra lệnh. Tự phục hồi miễn phí."
      },
      {
        "term": "Readiness vs Liveness",
        "def": "Readiness: đủ điều kiện nhận traffic chưa (fail → rút khỏi LB, không restart). Liveness: còn sống không (fail → restart). Nhầm hai cái này gây restart loop hoặc nhận traffic khi chưa sẵn sàng."
      },
      {
        "term": "HPA & VPA",
        "def": "HPA scale theo số replica dựa trên metric (CPU, RPS, queue depth). VPA điều chỉnh resource request/limit. HPA theo CPU thường sai — nên theo RPS hoặc queue lag."
      },
      {
        "term": "Service mesh",
        "def": "Sidecar proxy (Envoy) cạnh mỗi pod, xử lý mTLS, retry, timeout, circuit breaker, tracing — không cần sửa code. Istio/Linkerd. Cái giá: +1 hop, +50–100MB RAM/pod, +độ phức tạp vận hành."
      },
      {
        "term": "SLO & error budget",
        "def": "SLI đo được → SLO mục tiêu → error budget = 100% − SLO. Hết budget thì dừng feature, dồn vào reliability. Biến \"chất lượng\" từ cảm tính thành quyết định có số."
      },
      {
        "term": "Golden signals",
        "def": "Latency, traffic, errors, saturation. Bốn metric tối thiểu cho mọi service. Thiếu saturation, bạn không biết khi nào hệ thống sắp chạm trần."
      },
      {
        "term": "Multi-region active-active",
        "def": "Mọi region phục vụ ghi và đọc. Cần giải quyết xung đột (CRDT/LWW) và routing (GeoDNS/anycast). Rất đắt — chỉ dùng khi cần latency toàn cầu hoặc chịu mất region."
      },
      {
        "term": "Active-passive (failover)",
        "def": "Một region chính nhận traffic, region phụ chạy nóng chờ. Failover có thể mất dữ liệu (async replication) và mất 1–5 phút. Đơn giản hơn active-active rất nhiều."
      },
      {
        "term": "Cell-based architecture",
        "def": "Chia hệ thống thành các cell độc lập (mỗi cell phục vụ một tập user). Một cell hỏng chỉ ảnh hưởng 1/N user thay vì toàn bộ. Đây là cách các hệ thống lớn giới hạn blast radius."
      },
      {
        "term": "Blast radius",
        "def": "Phạm vi ảnh hưởng khi một thành phần hỏng. Thiết kế tốt là thiết kế để blast radius nhỏ và biết trước. Bulkhead, cell, AZ isolation đều là công cụ giảm blast radius."
      },
      {
        "term": "Cost per request",
        "def": "Chi phí thực cho một request = (compute + storage + egress + managed service) / số request. Không đo được con số này thì không tối ưu được chi phí — chỉ cắt giảm cảm tính."
      }
    ],
    "quiz": [
      {
        "q": "Team bạn có 8 kỹ sư, đang chạy một monolith 200k dòng code, deploy mất 40 phút và hay conflict. Sếp muốn chuyển sang microservices. Bạn tư vấn gì?",
        "a": "Trả lời thẳng: <strong>không nên</strong>, ít nhất chưa phải bây giờ. Lý do cụ thể: (1) với 8 người, vấn đề không phải \"team không tự chủ\" mà là \"deploy chậm\" — nguyên nhân có thể là test suite chậm, build không cache, hoặc thiếu CI/CD, không phải kiến trúc; (2) microservices với 8 người nghĩa là mỗi người phải on-call cho 2–3 service, viết runbook, quản lý 12 pipeline — năng lực kỹ thuật bị chia mỏng thay vì tập trung vào sản phẩm; (3) chi phí hạ tầng tăng 2–4× và bạn sẽ cần một platform team mà bạn không có. Đề xuất thay thế theo thứ tự: <strong>(a)</strong> sửa deploy: build cache, test song song, deploy 5 phút — thường giải quyết 80% nỗi đau; <strong>(b)</strong> modular hoá bên trong monolith — tách module với boundary rõ, mỗi module có schema riêng, cấm JOIN chéo, dùng event nội bộ; <strong>(c)</strong> khi có module thật sự cần scale khác biệt hoặc deploy tần suất khác biệt, tách <em>module đó</em> thành service đầu tiên (thường là search, notification, hoặc media processing — những cái ít phụ thuộc transaction). Câu chốt: \"Microservices giải quyết vấn đề tổ chức ở quy mô 50+ người. Với 8 người, modular monolith cho bạn 80% lợi ích với 20% chi phí. Tôi sẽ tách 1–2 service khi có lý do cụ thể, không tách 12 service vì lý do ý thức hệ.\""
      },
      {
        "q": "Sau mỗi lần deploy, bạn thấy khoảng 200 request bị 502 trong 5 giây. Hệ thống chạy Kubernetes. Chẩn đoán và sửa.",
        "a": "Đây là lỗi kinh điển của graceful shutdown. Nguyên nhân: khi pod bị xoá (rolling update), K8s gửi SIGTERM <em>và</em> đánh dấu pod \"Terminating\" gần như đồng thời. Pod bị rút khỏi endpoints của Service, nhưng: (a) kube-proxy/iptables cần thời gian cập nhật trên mọi node; (b) load balancer bên ngoài (ALB/NLB) cần 1–5s để health check và ngừng gửi traffic; (c) app nhận SIGTERM và tắt server ngay lập tức, đóng socket → connection đang mở bị reset. Kết quả: trong 2–5s, traffic vẫn được đẩy tới pod đã tắt → 502. Sửa theo thứ tự: <strong>(1)</strong> Thêm <code>preStop: exec: sleep 5</code> — pod sống thêm 5s sau khi bị đánh dấu Terminating, đủ để LB cập nhật. <strong>(2)</strong> App phải handle SIGTERM: ngừng nhận request mới, đợi request đang chạy xong (graceful shutdown), rồi mới exit. Với Node/Go/Java đều có API cho việc này. <strong>(3)</strong> Đặt <code>terminationGracePeriodSeconds: 30</code> lớn hơn tổng (preStop 5s + thời gian drain). <strong>(4)</strong> Readiness probe phải fail ngay khi nhận SIGTERM để rút khỏi Service sớm nhất. Đo lại: sau khi sửa, số 502 mỗi deploy phải về 0. Nếu còn, kiểm tra connection keep-alive của client — client có thể giữ connection tới pod đã chết (cần retry idempotent ở client)."
      },
      {
        "q": "Bạn đặt SLO 99,9% cho API checkout. Tháng này đã tiêu 35/43 phút budget. Bạn làm gì và tại sao không chỉ \"cố gắng hơn\"?",
        "a": "Con số 35/43 phút = 81% budget đã dùng, còn 8 phút cho 20 ngày còn lại. Hành động cụ thể: <strong>(1) Đóng băng feature rủi ro</strong> (thay đổi schema, thay đổi dependency, migration lớn) — không đóng băng toàn bộ, nhưng mọi thay đổi phải qua review reliability. Đây chính là mục đích của error budget: nó biến \"nên chậm lại hay không\" từ tranh luận thành quy tắc. <strong>(2) Tìm nguyên nhân tiêu budget</strong> — 35 phút đó đến từ đâu? Nếu là 1 sự cố 30 phút, đó là vấn đề khác với 30 sự cố 1 phút. Sự cố lớn → cần action item cụ thể (thêm redundancy, sửa quy trình deploy). Nhiều sự cố nhỏ → vấn đề chất lượng phát hành hoặc dependency không ổn định. <strong>(3) Ưu tiên theo đòn bẩy</strong>: nếu nguyên nhân là deploy, thêm canary + auto-rollback. Nếu là DB, thêm cache/replica. Nếu là dependent service, thêm circuit breaker. <strong>(4) Báo cáo minh bạch</strong> với stakeholder — không phải để xin lỗi mà để cùng quyết định trade-off. Về câu \"sao không cố gắng hơn\": vì reliability không phải nỗ lực, mà là <em>đầu tư có địa chỉ</em>. \"Cố gắng hơn\" dẫn đến làm thêm giờ, mệt mỏi, và thường làm tăng sai sót. Error budget tồn tại để bạn nói \"không\" với feature một cách có căn cứ, và nói \"có\" với công việc reliability mà không phải biện minh cảm tính."
      },
      {
        "q": "Bạn thiết kế hệ thống multi-region. Sếp hỏi \"bao lâu thì failover xong?\". Bạn trả lời thế nào và cần đo gì?",
        "a": "Trả lời trung thực: <strong>phụ thuộc vào mô hình, và số trên giấy khác số thật</strong>. Cụ thể: (1) <strong>Active-passive với warm standby</strong>: 2–5 phút trên lý thuyết, nhưng chia nhỏ: DNS TTL (60s nếu đặt thấp) + health check phát hiện (10–30s) + quyết định (con người: 1–5 phút, hoặc tự động: 0) + promote DB replica (10–60s) + app warm up (JIT, connection pool, cache: 30–120s). Tổng thực tế 3–8 phút. (2) <strong>Active-active partition theo user</strong>: failover gần như tức thời vì region kia đã chạy, nhưng vẫn cần đổi routing (30–60s) và chịu latency cao hơn. Cần đo: <strong>RTO thật</strong> bằng cách chạy game day mỗi quý, đo từ lúc inject failure đến lúc SLI trở lại bình thường — không phải đến lúc \"config đã đổi\". Cần đo thêm: <strong>RPO thật</strong> = replication lag tại thời điểm failover (dùng semi-sync để biết con số); <strong>capacity region phụ</strong> — nếu chạy 10% scale, mất bao lâu để scale lên 100% (thường 5–15 phút, có thể lâu hơn RTO!); và <strong>failback</strong> — quay lại mất bao lâu, có mất dữ liệu không. Điểm quan trọng nhất để nói: \"Tôi không trả lời bằng một con số trên giấy. Tôi trả lời bằng con số đo được từ lần diễn tập gần nhất, kèm điều kiện giả định (traffic level, giờ trong ngày, region nào chết).\" Điều này thể hiện bạn đã vận hành thật."
      },
      {
        "q": "Hoá đơn cloud của bạn tăng 40% trong 3 tháng dù traffic chỉ tăng 10%. Bạn điều tra theo thứ tự nào?",
        "a": "Điều tra theo thứ tự từ nguyên nhân phổ biến nhất: <strong>(1) Egress và cross-AZ</strong> — traffic tăng 10% nhưng nếu kiến trúc thay đổi (thêm service, thêm replica, thêm chatty call), cross-AZ có thể tăng 100%+. Kiểm tra data transfer by service/AZ. Đây là nguyên nhân số 1 khi chi phí tăng nhanh hơn traffic. <strong>(2) Observability</strong> — log/metrics volume thường tăng mà không ai để ý: thêm debug log, thêm label high-cardinality, retention không đổi. Kiểm tra chi phí theo dịch vụ log/metrics. <strong>(3) Storage tích luỹ</strong> — không ai xoá, mỗi tháng tăng thêm. Kiểm tra tổng dung lượng theo tháng, tìm volume/snapshot mồ côi. <strong>(4) Idle resources</strong> — autoscaling cấu hình sai (min replicas tăng), instance không ai tắt, môi trường dev. <strong>(5) Managed service tier</strong> — ai đó nâng instance class hoặc bật tính năng đắt (multi-AZ, provisioned IOPS). <strong>(6) Thay đổi kiến trúc có chủ ý</strong> — thêm region, thêm replica, migration. Hành động dài hạn: <strong>cost allocation tags</strong> bắt buộc cho mọi resource (team, service, env), dashboard cost per service, alert khi chi phí một service tăng &gt; 20% so với tuần trước, và định kỳ review \"cost per 1.000 request\". Con số cần nêu: với hầu hết hệ thống, 20–30% hoá đơn là lãng phí có thể cắt trong 2 tuần mà không giảm reliability."
      },
      {
        "q": "Bạn có 3 service nối tiếp, mỗi cái SLO 99,9%. SLO tổng là bao nhiêu và bạn làm gì để cải thiện?",
        "a": "SLO tổng = 0,999³ = <strong>99,7%</strong> (giảm từ 43 phút xuống <strong>2 giờ 10 phút</strong> downtime/tháng). Đây là hiệu ứng \"chuỗi phụ thuộc\" — nó giải thích tại sao thêm service luôn làm giảm reliability nếu không thêm redundancy. Bốn cách cải thiện, theo thứ tự hiệu quả: <strong>(1) Giảm số hop đồng bộ</strong> — nếu 3 service nối tiếp nghĩa là mỗi request đi qua 3 lần, hãy xem có service nào có thể gộp lại hoặc chuyển sang async. Async không làm tăng SLO của luồng chính (bạn không chờ), nhưng làm giảm blast radius. <strong>(2) Đặt SLO khác nhau theo tầng</strong> — service nội bộ có thể có SLO 99,5% nếu nó có fallback; không cần mọi service đều 99,9%. <strong>(3) Loại bỏ phụ thuộc cứng</strong> — nếu service 3 chết mà service 1 vẫn trả được kết quả (degraded), SLO tổng không bị ảnh hưởng. Đây là graceful degradation, hiệu quả hơn mọi nỗ lực tăng SLO từng service. <strong>(4) Nếu phải giữ chuỗi, tăng SLO từng service</strong> — nhưng chi phí tăng phi tuyến: từ 99,9% lên 99,95% tốn gấp 3–5× công sức. Điểm cần nói trong phỏng vấn: \"Tôi sẽ không cố đưa cả 3 service lên 99,99% — tôi sẽ tìm cách để request không phải chờ cả 3, và định nghĩa SLO theo hành trình người dùng thay vì theo từng service.\""
      }
    ]
  },
  "7": {
    "keywords": [
      {
        "term": "Khung 45 phút",
        "def": "5' yêu cầu → 5' ước lượng → 10' thiết kế cao tầng → 15' đi sâu 2 thành phần → 5' scale & failure → 5' trade-off & wrap-up. Đây là phân bổ nên tập, không phải luật cứng."
      },
      {
        "term": "Functional requirements",
        "def": "Hệ thống LÀM ĐƯỢC gì. \"User đăng ảnh, follow người khác, xem feed\". Phải chốt với interviewer trước khi vẽ — đây là bước hay bị bỏ qua nhất."
      },
      {
        "term": "Non-functional requirements",
        "def": "Hệ thống phải TỐT đến mức nào: số user, QPS, latency, availability, consistency. Nêu con số cụ thể, đừng nói \"nhanh và ổn định\"."
      },
      {
        "term": "Out of scope",
        "def": "Những gì bạn chủ động KHÔNG làm. Nói rõ giúp bạn kiểm soát phạm vi và thể hiện bạn biết đánh đổi. Ví dụ: \"Tôi bỏ qua phần thanh toán, giả định đã có.\""
      },
      {
        "term": "Back-of-envelope",
        "def": "Tính nhanh QPS, storage, bandwidth với số tròn. Mục đích không phải con số đúng tuyệt đối mà chứng minh bạn biết cái gì quyết định kiến trúc."
      },
      {
        "term": "Tiến hoá thiết kế",
        "def": "Bắt đầu đơn giản (1 server + 1 DB), rồi nêu điểm nghẽn và cách xử lý. Cách này luôn tốt hơn vẽ ngay 15 component từ đầu — thể hiện tư duy thực tế."
      },
      {
        "term": "Nói trade-off",
        "def": "Mỗi lựa chọn nên có \"tôi chọn X vì..., nhưng đánh đổi Y\". Không có lựa chọn miễn phí. Câu \"nó tuỳ\" mà không giải thích là câu trả lời kém."
      },
      {
        "term": "Deep dive",
        "def": "Interviewer chọn 1–2 thành phần để hỏi sâu. Bạn phải biết chi tiết đến mức data model + con số, không chỉ tên công nghệ."
      },
      {
        "term": "Bottleneck",
        "def": "Thành phần chịu tải nặng nhất hoặc dễ hỏng nhất. Luôn chủ động nêu — đừng chờ bị hỏi. \"Bottleneck tiếp theo sẽ là X vì...\""
      },
      {
        "term": "Single point of failure",
        "def": "Thành phần mà nếu chết thì cả hệ thống chết. Chỉ ra và nêu cách xử lý: redundancy, failover, degradation."
      },
      {
        "term": "Graceful degradation",
        "def": "Hệ thống vẫn phục vụ được (kém hơn) khi một phần hỏng. Ví dụ: không có recommendation thì hiển thị \"phổ biến\" thay vì lỗi trang."
      },
      {
        "term": "CAP trong ngữ cảnh",
        "def": "Không nói \"chọn CP\" chung chung — nói theo từng entity: \"thanh toán CP, feed AP\". Đây là dấu hiệu rõ nhất của người hiểu sâu."
      },
      {
        "term": "Clarifying question",
        "def": "Câu hỏi làm rõ trước khi trả lời. Tốt: \"Hệ thống có cần read-your-writes không?\". Kém: hỏi lại điều đã nói trong đề."
      },
      {
        "term": "Drive the conversation",
        "def": "Bạn dẫn dắt, không chờ bị dẫn. Nêu ra vấn đề trước khi được hỏi, đề xuất bước tiếp theo. Interviewer đánh giá cao người chủ động có cấu trúc."
      },
      {
        "term": "Red flag",
        "def": "Điều làm mất điểm: nhảy vào giải pháp, không ước lượng, không nói failure mode, không biết khi nào dừng, hoặc phủ nhận trade-off (\"cách của tôi không có nhược điểm\")."
      }
    ],
    "quiz": [
      {
        "q": "Interviewer nói: \"Hãy thiết kế Instagram\". Bạn làm gì trong 5 phút đầu?",
        "a": "Không vẽ gì cả. Trình tự: <strong>(1) Chốt phạm vi</strong> — \"Tôi sẽ tập trung vào 3 tính năng: upload ảnh, follow, xem feed. Tôi bỏ ra ngoài: comment, story, DM, tìm kiếm — giả định đã có. Đúng không?\". <strong>(2) Làm rõ quy mô</strong> — \"Tôi giả định 500 triệu DAU, mỗi người xem feed 10 lần/ngày và upload 0,1 ảnh/ngày. Anh/chị muốn con số khác không?\". <strong>(3) Hỏi yêu cầu phi chức năng quan trọng nhất</strong> — \"Latency feed mục tiêu là bao nhiêu? Ảnh phải hiển thị ngay sau upload không, hay trễ 1 phút được?\" — câu này quyết định đồng bộ hay async. <strong>(4) Nêu hướng tiếp cận</strong> — \"Tôi sẽ đi theo thứ tự: ước lượng → kiến trúc cao tầng → đi sâu vào feed fan-out vì đó là phần khó nhất.\" <strong>(5) Xin xác nhận</strong> — \"Anh/chị muốn tôi ưu tiên phần nào?\". Năm phút này tạo ra: phạm vi rõ (bạn không bị lạc), con số (bạn dùng suốt bài), và sự hợp tác (interviewer thấy bạn làm việc được với người). Sai lầm phổ biến nhất là bắt đầu vẽ box \"Client → LB → App\" ngay — mất 5 phút mà không biết đang thiết kế cho quy mô nào, để rồi 15 phút sau phải làm lại."
      },
      {
        "q": "Bạn đang trình bày và interviewer ngắt: \"Tại sao dùng Postgres? Cassandra scale tốt hơn nhiều.\" Bạn trả lời thế nào?",
        "a": "Không phòng thủ, không đầu hàng. Trả lời theo cấu trúc: <strong>(1) Thừa nhận điểm đúng</strong> — \"Đúng, Cassandra ghi tốt hơn nhiều và scale ngang dễ hơn — hàng trăm nghìn write/s là chuyện bình thường với Cassandra, còn Postgres sẽ cần sharding thủ công.\" <strong>(2) Gắn với yêu cầu cụ thể của bài</strong> — \"Nhưng với bài này tôi có 3 ràng buộc: (a) cần transaction ACID cho phần thanh toán và tồn kho — Cassandra không có; (b) cần query linh hoạt vì tôi chưa biết hết access pattern khi mới xây — Cassandra yêu cầu thiết kế bảng theo query trước; (c) dữ liệu chỉ 500GB, write 2.000/s — Postgres dư sức với một máy và hai replica.\" <strong>(3) Nêu điều kiện đổi</strong> — \"Tôi sẽ đổi sang Cassandra cho phần event log hoặc activity feed, nơi tôi có write 50.000/s và access pattern rõ ràng là đọc theo user cộng với khoảng thời gian. Nghĩa là tôi dùng cả hai cho hai loại dữ liệu khác nhau, không chọn một cho tất cả.\" <strong>(4) Hỏi lại</strong> — \"Anh/chị đang giả định quy mô lớn hơn con số tôi nêu, hay đang muốn tôi xét khả năng scale ghi cao hơn?\" Điểm mấu chốt: câu hỏi này không kiểm tra kiến thức về Postgres hay Cassandra — nó kiểm tra bạn có <em>lý do gắn với bài toán</em> hay chỉ chọn theo cảm tính hoặc theo độ phổ biến. Trả lời \"vì Postgres phổ biến\" hoặc \"vì Cassandra nhanh hơn\" đều mất điểm như nhau."
      },
      {
        "q": "Bạn có 10 phút cuối và interviewer chưa hỏi gì về failure. Bạn chủ động đưa vào thế nào?",
        "a": "Chủ động chuyển topic một cách tự nhiên, không đột ngột: <strong>(1) Cầu nối</strong> — \"Trước khi tổng kết, tôi muốn nói về phần tôi thấy rủi ro nhất: điều gì xảy ra khi các thành phần chính hỏng.\" <strong>(2) Ba kịch bản cụ thể, mỗi cái 2 phút</strong> — (a) \"Redis chết: 10.400 QPS dồn vào Postgres, vượt ngưỡng 5.000 nên DB sập. Giảm nhẹ: circuit breaker chặn ở DB, và read không quan trọng trả dữ liệu cache cũ từ local.\" (b) \"DB leader chết: failover 30–60s, trong đó ghi thất bại. Client có idempotency key nên retry an toàn. Đọc vẫn phục vụ từ replica.\" (c) \"Một AZ mất: nếu trải 3 AZ với replica ở mỗi AZ thì mất 1 AZ vẫn còn quorum. Nếu chỉ 2 AZ thì mất AZ lớn là mất quorum — đây là lý do tôi chọn 3 AZ.\" <strong>(3) Nói monitoring</strong> — \"Tôi biết những điều này đang xảy ra qua 4 alert: error rate, p99, cache hit ratio, replication lag.\" <strong>(4) Kết luận có kiểm soát</strong> — \"Điểm yếu tôi biết: nếu mất cả DB leader và một replica cùng lúc, tôi có thể mất vài giây ghi cuối vì semi-sync chỉ đảm bảo 1 replica. Với hệ thống này tôi chấp nhận, vì client có idempotency key và có job đối soát.\" Việc chủ động đưa ra failure mode khi interviewer chưa hỏi là dấu hiệu rất mạnh — nó cho thấy bạn thiết kế cho thực tế vận hành chứ không chỉ để vẽ diagram đẹp."
      },
      {
        "q": "Bạn tính ra 1,16 triệu write/s cho fan-out và nói \"không khả thi\". Interviewer hỏi: \"Sao em biết không khả thi? Redis chịu được mà.\" Bạn xử lý thế nào?",
        "a": "Đây là câu phản biện kiểm tra bạn có con số thật hay chỉ nói cảm tính. Trả lời: <strong>(1) Thừa nhận đúng về mặt lý thuyết</strong> — \"Đúng, một cluster Redis lớn có thể đạt 1 triệu op/s. Benchmark Redis đạt 100k–200k op/s mỗi node với pipelining, nên khoảng 10 node có thể tới 1–2 triệu.\" <strong>(2) Nêu vấn đề thật: không phải throughput mà là phân bố</strong> — \"Nhưng 1,16 triệu/s đó là <em>trung bình</em>. Con số thật là: một celebrity tweet tạo ra 50 triệu write trong vài giây. Đó là 50 triệu op dồn vào cùng một khoảng thời gian, không phải rải đều. Không cluster nào xử lý được burst 50 triệu op trong 10 giây.\" <strong>(3) Vấn đề thứ hai — head-of-line blocking</strong> — \"Worker fan-out bị chặn: một tweet của celebrity chiếm worker trong nhiều phút, các tweet khác xếp hàng sau. Độ trễ đăng bài của user thường tăng vọt.\" <strong>(4) Vấn đề thứ ba — lãng phí</strong> — \"90% trong 50 triệu follower đó không online trong 10 phút tới. Ta đang pre-compute cho người không đọc.\" <strong>(5) Giải pháp có số</strong> — \"Vì vậy tôi tách: user dưới 10k follower thì fan-out on write, chiếm 99,9% user nhưng chỉ khoảng 5% tổng write. Celebrity thì chỉ ghi timeline riêng, đọc merge khi cần — 5 đến 20 query song song, khoảng 50ms.\" Điểm mấu chốt: đừng nói \"Redis yếu\" — nói \"throughput trung bình không phải vấn đề, burst và phân bố mới là vấn đề\". Đây là hiểu biết thật về hệ phân tán, và interviewer sẽ chuyển sang hỏi sâu hơn thay vì nghi ngờ con số của bạn."
      },
      {
        "q": "Trong 45 phút, bạn có 12 phút cuối và interviewer nói \"cho tôi xem em xử lý khi hệ thống bị DDoS\". Bạn trình bày thế nào?",
        "a": "Trình bày theo tầng, từ rìa vào trong, mỗi tầng 2–3 phút: <strong>(1) Phân loại trước</strong> — \"Có ba loại: volumetric (L3/L4, làm nghẽn băng thông), protocol (SYN flood, slowloris), và application (L7 flood vào endpoint đắt như search). Cách xử lý khác nhau hoàn toàn.\" <strong>(2) Volumetric</strong> — \"Không thể chống ở server của tôi vì đường truyền đã bị nghẽn. Cần anycast cộng với scrubbing center (Cloudflare, AWS Shield) phân tán hấp thụ ở rìa. Đây là lý do phải có CDN <em>trước</em> khi bị tấn công, không phải sau.\" <strong>(3) Application layer</strong> — \"Rate limit theo IP và theo user ở edge, trước khi vào app. WAF rule cho pattern xấu. Challenge (CAPTCHA hoặc JS challenge) cho traffic nghi ngờ. Với endpoint đắt như search, rate limit chặt hơn (10 request/phút/user) và cache kết quả cho query phổ biến — biến tấn công thành cache hit.\" <strong>(4) Bảo vệ nội bộ</strong> — \"Bulkhead để một endpoint bị flood không ăn hết thread pool; circuit breaker cho dependency bên thứ ba; và autoscaling có giới hạn trên — đây là rủi ro thật: autoscale theo DDoS có thể làm hoá đơn tăng 50–100 lần.\" <strong>(5) Chi tiết ít người nói</strong> — \"Tôi cần phân biệt DDoS với traffic spike thật (ví dụ flash sale). Nếu chặn nhầm, tôi mất doanh thu. Vì vậy tôi dùng rate limit theo user đã đăng nhập (chặt hơn) và theo IP (lỏng hơn cho anonymous), cộng với kill switch để nới limit nhanh nếu phát hiện chặn nhầm — và dashboard hiển thị doanh thu realtime để phát hiện sớm.\" Hai chi tiết \"autoscaling trong DDoS là bẫy chi phí\" và \"phân biệt DDoS với traffic thật\" thể hiện kinh nghiệm vận hành thật, không phải kiến thức sách."
      },
      {
        "q": "Bạn trượt một buổi phỏng vấn. Nhận feedback: \"Thiết kế đúng nhưng không nói được trade-off.\" Bạn sửa thế nào trong 2 tuần?",
        "a": "Đây là feedback phổ biến và sửa được nhanh vì nó là <em>kỹ năng trình bày</em>, không phải kiến thức. Kế hoạch 2 tuần: <strong>(1) Nhận diện pattern hiện tại</strong> — ghi âm một buổi tự làm bài, nghe lại và đếm: có bao nhiêu lần bạn nói \"tôi dùng X\" mà không nói \"đánh đổi là Y\"? Hầu hết mọi người phát hiện gần 100% câu đều thiếu phần trade-off. <strong>(2) Học thuộc công thức 4 phần</strong> — \"Tôi chọn X / vì Y / đánh đổi là Z / giảm nhẹ bằng W.\" Tập nói 20 lần cho thành phản xạ, mỗi lần với một quyết định khác nhau (cache, DB, queue, sync/async, shard). <strong>(3) Chuẩn bị bảng trade-off cho 15 quyết định phổ biến</strong> — dùng bảng ở mục 7.3 nhưng viết lại bằng lời của mình, không học thuộc. Mỗi quyết định phải có: chọn A khi nào, chọn B khi nào, cái giá của A. <strong>(4) Tập tự phản biện</strong> — sau mỗi lựa chọn trong bài tự làm, nói to: \"Điểm yếu của cách này là... Nếu yêu cầu là... thì tôi đổi sang...\" Đây là kỹ thuật mạnh nhất vì nó biến trade-off thành thói quen tư duy, không phải câu thêm vào cuối bài. <strong>(5) Mock với người chuyên hỏi \"tại sao\"</strong> — nhờ ai đó ngắt mỗi 2 phút và hỏi \"tại sao không dùng cách khác?\". Chịu được 3 buổi như vậy là thành phản xạ. Con số mục tiêu: trong một buổi 45 phút phải có <strong>ít nhất 6 câu trade-off rõ ràng</strong> — thường ở cache, DB, consistency, fan-out, queue, và deployment."
      }
    ]
  }
};

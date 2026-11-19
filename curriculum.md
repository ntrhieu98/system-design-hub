# Giáo trình System Design — Từ cơ bản đến nâng cao

> Lộ trình học system design toàn diện, dành cho kỹ sư phần mềm muốn thiết kế hệ thống quy mô lớn. Mỗi module có mục tiêu, khái niệm chính, ví dụ thực tế và bài tập.

---

## Module 0 — Kiến thức nền tảng (Prerequisites)

### 0.1 Mạng máy tính
- OSI model, TCP/IP, HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)
- DNS, CDN, TLS handshake
- WebSockets, Server-Sent Events, gRPC
- Load balancing: L4 vs L7, algorithms (round-robin, least-connections, consistent hashing)

### 0.2 Hệ điều hành & hạ tầng
- Process vs thread, context switching
- I/O models: blocking, non-blocking, async, epoll/kqueue
- Memory: virtual memory, page cache, OOM
- File systems, disk I/O (HDD vs SSD, IOPS)

### 0.3 Cơ sở dữ liệu
- Relational: ACID, indexes (B-tree, hash), normalization
- NoSQL: key-value, document, wide-column, graph
- Transactions, isolation levels
- Replication (primary-replica, multi-primary), sharding

### 0.4 Phân tán systems cơ bản
- CAP theorem, PACELC
- Consistency models: strong, eventual, causal
- Consensus: Raft, Paxos
- Clocks: logical clocks, vector clocks, TrueTime

---

## Module 1 — Nền tảng System Design (Beginner)

### 1.1 Cách tiếp cận một bài toán system design
1. **Clarify requirements** — functional + non-functional
2. **Estimate scale** — QPS, storage, bandwidth (back-of-envelope)
3. **High-level design** — components, data flow
4. **Deep dive** — bottleneck, scale, failure handling
5. **Trade-offs** — justify decisions

### 1.2 Non-functional requirements (NFRs)
- Availability (99.9%, 99.99%, 99.999%)
- Latency vs throughput
- Durability, consistency, partition tolerance
- Scalability: vertical vs horizontal

### 1.3 Back-of-envelope estimation
- DAU/MAU, read/write ratio
- QPS = (DAU × actions/day) / 86400
- Storage = users × data per user × retention
- Bandwidth, cache size (Pareto 80/20)

### 1.4 Ví dụ: URL Shortener (TinyURL)
- Requirements, API design (`POST /shorten`, `GET /{code}`)
- Hash function, collision handling
- Storage schema, redirect (301 vs 302)
- Scale: 100M URLs, 10K QPS read

**Bài tập:** Thiết kế Pastebin.

---

## Module 2 — Building Blocks (Intermediate)

### 2.1 Load Balancer
- L4 vs L7, health checks, sticky sessions
- HAProxy, Nginx, AWS ALB/NLB
- Global load balancing (GSLB), anycast

### 2.2 Caching
- Cache-aside, read-through, write-through, write-back, write-around
- Eviction: LRU, LFU, TTL
- Invalidation strategies
- Distributed cache: Redis, Memcached
- Cache stampede, thundering herd, hot key

### 2.3 Database scaling
- Read replicas, connection pooling
- Sharding: range, hash, consistent hashing
- Federation, denormalization
- Polyglot persistence

### 2.4 Message Queue
- Point-to-point vs pub/sub
- Kafka, RabbitMQ, SQS
- Delivery semantics: at-most-once, at-least-once, exactly-once
- Ordering, partitioning, consumer groups
- Dead letter queue, retry with backoff

### 2.5 CDN
- Push vs pull, edge caching
- Cache invalidation, signed URLs
- Dynamic content acceleration

### 2.6 Search
- Inverted index, Elasticsearch
- Ranking (TF-IDF, BM25)
- Autocomplete, fuzzy search

**Bài tập:** Thiết kế Rate Limiter (token bucket, sliding window).

---

## Module 3 — Data & Storage Patterns (Intermediate)

### 3.1 Storage types
- Block, file, object storage (S3)
- Data warehouse vs data lake vs lakehouse
- Time-series DB (InfluxDB, TimescaleDB)

### 3.2 Indexing deep dive
- B+ tree, LSM tree (Cassandra, RocksDB)
- Bloom filters, skip lists
- Covering index, composite index

### 3.3 Replication patterns
- Single-leader, multi-leader, leaderless
- Quorum (R + W > N)
- Conflict resolution: LWW, CRDT, vector clocks

### 3.4 Sharding strategies
- Consistent hashing with virtual nodes
- Rebalancing, hotspot handling
- Cross-shard transactions (2PC, Saga)

### 3.5 Data pipeline
- ETL vs ELT, batch vs stream
- Kafka Streams, Flink, Spark
- Lambda vs Kappa architecture

**Bài tập:** Thiết kế News Feed (Twitter/Facebook).

---

## Module 4 — Distributed Systems (Advanced)

### 4.1 Consensus & coordination
- Raft algorithm chi tiết
- Leader election, log replication
- Distributed locks (Redlock, ZooKeeper)
- Service discovery (Consul, etcd, Eureka)

### 4.2 Distributed transactions
- Two-phase commit (2PC), 3PC
- Saga pattern: choreography vs orchestration
- Outbox pattern, idempotency
- Event sourcing, CQRS

### 4.3 Fault tolerance
- Circuit breaker, bulkhead, retry with exponential backoff + jitter
- Timeout, fallback, graceful degradation
- Chaos engineering (Chaos Monkey)

### 4.4 Observability
- Three pillars: metrics, logs, traces
- Prometheus, Grafana, ELK, Jaeger/Zipkin
- SLI, SLO, SLA, error budget
- Alerting, on-call

### 4.5 Security
- AuthN/AuthZ: OAuth2, OIDC, JWT, session
- Rate limiting, WAF, DDoS mitigation
- Encryption at rest/transit, secrets management
- Zero trust architecture

**Bài tập:** Thiết kế Distributed Lock Service.

---

## Module 5 — Classic System Design Problems (Advanced)

| # | Bài toán | Trọng tâm |
|---|----------|-----------|
| 1 | URL Shortener | Hashing, storage |
| 2 | Pastebin | Object storage, expiry |
| 3 | Rate Limiter | Token bucket, distributed counter |
| 4 | Consistent Hashing | Ring, virtual nodes |
| 5 | Key-Value Store | LSM, replication, quorum |
| 6 | Unique ID Generator | Snowflake, clock skew |
| 7 | Web Crawler | BFS, politeness, dedup |
| 8 | Notification System | Push/pull, fan-out |
| 9 | News Feed | Fan-out on write/read, ranking |
| 10 | Chat System | WebSocket, presence, message queue |
| 11 | Search Autocomplete | Trie, top-k, caching |
| 12 | YouTube / Netflix | CDN, transcoding, adaptive bitrate |
| 13 | Uber / Lyft | Geospatial index, matching |
| 14 | Ticket Booking | Concurrency, seat locking |
| 15 | Payment System | Idempotency, ledger, reconciliation |
| 16 | Distributed Cache | Consistent hashing, eviction |
| 17 | Metrics & Monitoring | Time-series, aggregation |
| 18 | Ad Click Aggregation | Stream processing, exactly-once |
| 19 | Google Docs | OT/CRDT, real-time collab |
| 20 | Dropbox | Sync, chunking, dedup |

Mỗi bài: requirements → estimation → API → high-level → deep dive → trade-offs.

---

## Module 6 — Cloud & Modern Architecture (Expert)

### 6.1 Cloud patterns
- Multi-tenancy, isolation
- Serverless (Lambda, Cloud Functions)
- Container orchestration (Kubernetes)
- Service mesh (Istio, Linkerd)

### 6.2 Microservices
- Decomposition (DDD, bounded context)
- API Gateway, BFF (Backend for Frontend)
- Inter-service comm: sync (REST/gRPC) vs async (events)
- Saga, outbox, CQRS

### 6.3 Resilience & SRE
- Error budgets, toil reduction
- Incident management, postmortem
- Capacity planning, autoscaling
- Multi-region, active-active vs active-passive

### 6.4 Cost optimization
- Right-sizing, reserved instances, spot
- Data transfer costs, egress
- Caching for cost reduction

### 6.5 Data governance
- GDPR, data retention, PII handling
- Audit logs, compliance

---

## Module 7 — Case Studies & Interview Prep (Expert)

### 7.1 Framework trả lời phỏng vấn
- **Clarify** (5 min): requirements, scope, constraints
- **Estimate** (5 min): QPS, storage, bandwidth
- **Design** (15 min): high-level + components
- **Deep dive** (15 min): pick 1-2 components
- **Wrap up** (5 min): trade-offs, bottlenecks, monitoring

### 7.2 Checklist khi thiết kế
- [ ] Single point of failure?
- [ ] Horizontal scaling path?
- [ ] Data consistency model?
- [ ] Failure modes & recovery?
- [ ] Monitoring & alerting?
- [ ] Security (auth, encryption)?
- [ ] Cost & complexity trade-off?

### 7.3 Tài nguyên học tập
- **Sách:** Designing Data-Intensive Applications (Kleppmann), System Design Interview (Alex Xu) vol 1 & 2
- **Courses:** Grokking System Design, ByteByteGo
- **Practice:** LeetCode system design, Pramp, Exponent
- **Blogs:** High Scalability, AWS Architecture Blog, Netflix Tech Blog, Uber Engineering

---

## Lộ trình đề xuất (Timeline)

| Tuần | Module | Mục tiêu |
|------|--------|----------|
| 1-2 | 0 | Nền tảng mạng, DB, phân tán |
| 3-4 | 1 | Approach + URL Shortener, Pastebin |
| 5-6 | 2 | Building blocks: cache, queue, LB |
| 7-8 | 3 | Data patterns, sharding, replication |
| 9-10 | 4 | Consensus, transactions, fault tolerance |
| 11-14 | 5 | 5-7 bài toán classic |
| 15-16 | 6 | Cloud, microservices, SRE |
| 17-18 | 7 | Mock interview, case studies |

**Tổng thời gian:** ~18 tuần (part-time) hoặc 9 tuần (full-time).

---

## Ghi chú học tập

- Luôn vẽ diagram (Excalidraw, draw.io)
- Viết ADR (Architecture Decision Record) cho mỗi quyết định
- Đọc postmortem thực tế (AWS, Google, Cloudflare)
- Build small: tự cài đặt mini Redis, mini Kafka để hiểu sâu
- Review codebase open-source: Kubernetes, etcd, TiDB

---

*Phiên bản 1.0 — Cập nhật theo xu hướng 2025: AI infra, vector DB, LLM serving, edge computing.*
file_path">
/Users/hieunguyen/Personal/learning/system-design/curriculum.md
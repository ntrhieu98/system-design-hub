# ADR 006: Kiến trúc Microservices

## Trạng thái: Đề xuất
## Ngày: 2025-01-01
## Tác giả: System Design Learning

## Bối cảnh

Cần quyết định kiến trúc cho hệ thống với:
- Team size đang grow
- Deploy frequency cao
- Cần scale independently
- Multiple tech stacks
- Observability requirements

## Yếu tố quyết định

### 1. Architecture Style
**Quyết định:** Modular monolith → Microservices (incremental)

**So sánh:**
| Aspect | Monolith | Microservices | Modular Monolith |
|--------|----------|---------------|------------------|
| Deploy | Single unit | Independent | Single unit |
| DB | Shared | Per-service | Shared (modules) |
| Team autonomy | Low | High | Medium |
| Complexity | Low | High | Medium |
| Scale | Limited | Unlimited | Limited |

**Chiến lược:** Bắt đầu modular monolith, tách services khi có bounded context rõ ràng.

### 2. Service Communication
**Quyết định:** REST (sync) + Message Queue (async)

**Patterns:**
- **Sync (REST/gRPC)**: Immediate response, simple. Dùng cho queries.
- **Async (MQ/events)**: Decoupled, resilient. Dùng cho commands, notifications.
- **gRPC**: High performance, streaming, binary. Dùng cho internal service-to-service.
- **REST**: Human-readable, cacheable. Dùng cho external APIs.

### 3. Service Discovery
**Quyết định:** DNS-based + Service mesh (Istio) cho production

**Options:**
- Client-side: Consul, Eureka
- Server-side: LB queries registry
- DNS-based: Simple, caching issues
- Service mesh: Sidecar proxy (Envoy), handles discovery, LB, retries, mTLS, observability

### 4. API Gateway & BFF
**Quyết định:** API Gateway (Kong/Envoy) + BFF per client type

**API Gateway:** Single entry point, routing, auth, rate limiting, aggregation
**BFF:** Separate gateway per client (web, mobile, admin). Shapes data per client needs.

### 5. Data Management
**Quyết định:** Database-per-service + Saga + CQRS

**Patterns:**
- **Database-per-service**: Loose coupling, polyglot persistence
- **Saga**: Distributed transactions via compensating actions
- **CQRS**: Separate read/write models, optimize independently
- **Event Sourcing**: Store events, replay to reconstruct state

### 6. Observability (3 Pillars)
**Quyết định:** Structured logging + Prometheus metrics + Jaeger tracing

**Pillars:**
- **Logs**: What happened (discrete events). JSON structured, centralized (ELK/Loki)
- **Metrics**: How much/how fast (aggregated). Counters, gauges, histograms (Prometheus/Grafana)
- **Traces**: Where time spent (request flow). Distributed traces (Jaeger/Zipkin)

**SLI/SLO:** Define service level objectives, alert on breach. Error budget = 1 - SLO.

## Hệ quả

### Tích cực
- Team autonomy và independent deployment
- Scale services independently
- Polyglot (chọn tech stack phù hợp per service)
- Fault isolation

### Tiêu cực
- Distributed system complexity
- Network latency giữa services
- Data consistency challenges (eventual consistency)
- Operational overhead (monitoring, deployment, testing)

### Rủi ro
- Distributed monolith (services tightly coupled)
- Cascade failures
- Data inconsistency
- Debugging complexity (distributed tracing needed)

## Tham khảo
- Alex Xu "System Design Interview" Ch.1: Microservices
- 60 Days ebook: API Gateway vs BFF, N+1 query, circuit breaker, observability
- Sam Newman "Building Microservices"

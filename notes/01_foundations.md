# Notes: Module 1 — Foundations System Design

## 1.1 Approach to System Design Problems

### 5-Step Framework
1. **Clarify requirements** — functional + non-functional
   - What features are essential vs nice-to-have?
   - What are the SLAs for availability, latency, throughput?
2. **Estimate scale** — QPS, storage, bandwidth (back-of-envelope)
   - Use DAU/MAU, read/write ratios
   - QPS = (DAU × actions/day) / 86400
3. **High-level design** — components, data flow
   - Box diagram: show components and arrows for data flow
   - Identify bottlenecks early
4. **Deep dive** — bottleneck, scale, failure handling
   - Single point of failure analysis
   - Worst-case scenario planning
5. **Trade-offs** — justify decisions
   - Document why chose A over B
   - Quantify the costs and benefits

### 1.2 Non-Functional Requirements (NFRs)

| NFR | Description | Target |
|-----|-------------|--------|
| **Availability** | System uptime | 99.9% (8.76h/year downtime), 99.99% (52.6min/year), 99.999% (5.26min/year) |
| **Latency vs Throughput** | Trade-off relationship | Lower latency often means less throughput |
| **Durability** | Data loss tolerance | Depends on use case (financial vs cache) |
| **Consistency** | Read-after-write guarantee | Strong, eventual, causal |
| **Scalability** | Vertical vs Horizontal | Vertical: bigger server; Horizontal: more servers |

### 1.3 Back-of-Envelope Estimation Formulas

```
DAU/MAU: Daily/Monthly Active Users
Actions per user per day: How many interactions each user makes

QPS = (DAU × actions/day) / 86400

Storage = users × data per user × retention period

Cache size (Pareto 80/20): 20% of keys serve 80% of traffic
  → Cache the hot portion, rest goes to database

Bandwidth = QPS × avg_response_size × 8 bits/byte
```

### 1.4 Example: URL Shortener (TinyURL)

**Requirements:**
- POST /shorten → long URL → short code
- GET /{code} → redirect to long URL
- Handle 10M URLs, 10K QPS read

**Key Decisions:**
- Base62 encoding for short codes (6 chars = ~57 bits)
- Hash function for code generation
- 301/302 redirect status codes
- Simple KV storage schema

**Exercise:** Design Pastebin (similar but for text storage)
- API: POST /pastes, GET /{code}
- Syntax highlighting option
- Expiration time
- Public vs private pastes

## 1.4 Exercise: Pastebin Design
(Same as URL Shortener but for text storage with additional features)
- Text content storage (potentially large)
- Syntax highlighting selection
- Expiration/auto-deletion
- Public vs private modes
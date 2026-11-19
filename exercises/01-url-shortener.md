# Exercise 1: URL Shortener (TinyURL/Pastebin)

## Objective
Design a URL shortening service that can handle 10K QPS read traffic with sub-100ms latency.

## Requirements

### Functional Requirements
1. **Shorten URL**: Given a long URL, generate a short code and store the mapping
2. **Redirect**: Given a short code, redirect to the original URL
3. **Custom aliases**: Allow users to specify custom short codes (optional)

### Non-Functional Requirements
1. **Availability**: 99.9% uptime
2. **Latency**: < 100ms for redirect operations
3. **Scalability**: Support 10M+ URLs, 10K QPS read
4. **Consistency**: Read-after-write consistency not critical; eventual consistency acceptable

## Hints & Guidelines

### Back-of-Envelope Estimates
- **Storage**: 10M URLs × 500 bytes avg = ~5GB data
- **QPS**: 10K reads, 1K writes (10% write ratio)
- **Bandwidth**: 10K × 500 bytes × 3600s = 18GB/hour, 432GB/day

### High-Level Architecture
```
Client → Load Balancer → API Service → Cache (Redis) → Database (SQL/NoSQL)
```

### Key Design Decisions
1. **Code Generation**: Base62 (0-9, a-z, A-Z) → 6 chars = 56.8 bits ≈ 72M combinations
2. **Storage**: Simple key-value (code → original URL)
3. **Caching**: Cache-aside pattern with Redis (code → URL)
4. **Scaling**: Sharding by hash(code) % N

### Database Schema (Simplified)
```sql
CREATE TABLE urls (
    code VARCHAR(6) PRIMARY KEY,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    click_count INTEGER DEFAULT 0
);
```

### API Design
```
POST /shorten
{
  "long_url": "https://example.com/very/long/path",
  "custom_alias": "my-custom-code"  // optional
}

GET /{code}
# Returns: 301/302 redirect to original_url
```

### Failure Handling
- What if code already exists? → Generate new code or use custom alias
- What if URL not found? → 404 Not Found
- Cache miss? → Query database, populate cache

## Deliverables
1. **Diagram**: Architecture diagram (use Excalidraw, draw.io, or ASCII art)
2. **ADR**: Architecture Decision Record for key design choices
3. **Scaling plan**: How to handle 100M URLs, 100K QPS
4. **Failure modes**: Cache miss, database down, code collision

## Success Criteria
- [ ] Diagram shows complete data flow
- [ ] ADR covers code generation, caching, scaling
- [ ] Estimates are reasonable and documented
- [ ] Failure modes identified and addressed
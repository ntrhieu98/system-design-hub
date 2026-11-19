# ADR 001: URL Shortener Design (TinyURL/Pastebin)

## Status: Proposed
## Date: 2025-01-01
## Author: System Design Learning

## Context

We are building a URL shortener service similar to TinyURL or Pastebin as part of Module 1.4 system design exercises. The system needs to handle:
- Shortening long URLs to short codes
- Redirecting short codes to original URLs
- High read throughput (estimated 10K QPS)
- Low latency redirects
- Simple storage schema

## Decision Drivers

### 1. API Design
**Decision:** Use RESTful API with endpoints:
- `POST /shorten` — Create a short URL
- `GET /{code}` — Redirect to original URL

**Alternative considered:** GraphQL API
- Pros: Flexible queries, single endpoint
- Cons: Overkill for simple CRUD, more complex client implementation
- **Chosen:** REST for simplicity and cacheability

### 2. Hash Function & Collision Handling
**Decision:** Use stable hash function (FNV-1a or similar) with base62 encoding, implement collision resolution via retry

**Alternative considered:** UUID-based short codes
- Pros: No collisions guaranteed
- Cons: Longer codes (~12 chars vs ~6 chars), less human-friendly
- **Chosen:** Hash-based for shorter codes (6 chars base62 = 56.8 bits)

### 3. Storage Schema
**Decision:** Simple key-value store
- Table: `urls(code PRIMARY KEY, original_url TEXT, created_at TIMESTAMP)`
- Index on `code` for O(1) lookups

**Alternative considered:** Full relational schema with normalized tables
- Pros: More flexible for future attributes
- Cons: Unnecessary complexity for simple use case
- **Chosen:** Simple KV for minimal overhead

### 4. Scaling to 10M URLs / 10K QPS
**Decision:** Sharding strategy
- Use consistent hashing on the short code to distribute across N shards
- Each shard operates independently
- Monitor load and add shards as needed

**Alternative considered:** Single database instance
- Pros: Simpler operations
- Cons: Will not scale beyond single-instance limits
- **Chosen:** Sharding for horizontal scalability

### 5. Read Path Optimization
**Decision:** Read-through cache (Redis)
- Cache: `code -> original_url` mapping
- Cache miss: Query database, populate cache
- Set TTL for stale data handling

**Alternative considered:** Direct database reads only
- Pros: Simple, no cache coherence issues
- Cons: Will not meet latency requirements at scale
- **Chosen:** Cache-first for performance

## Consequences

### Positive
- Short codes (6 chars base62) are human-friendly
- REST API is simple to implement and understand
- Cache layer provides low-latency reads
- Sharding enables horizontal scaling

### Negative
- Added complexity of cache invalidation
- Sharding introduces operational overhead
- Collision handling adds minor latency on hash collisions

## Related ADRs
- ADR 002: Rate Limiter Design (Module 2.3)
- ADR 003: Cache-Aside Pattern (Module 2.2)

## References
- Curriculum Module 1.4: URL Shortener exercise
- Curriculum Module 2.2: Caching patterns
- Curriculum Module 2.3: Database scaling
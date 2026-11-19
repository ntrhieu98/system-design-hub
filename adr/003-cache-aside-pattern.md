# ADR 003: Cache-Aside Pattern (Lazy Loading)

## Status: Proposed
## Date: 2025-01-01
## Author: System Design Learning

## Context

As part of Module 2.2 exercise, we need to implement the cache-aside pattern for efficient data access in distributed systems. This pattern is fundamental for high-performance web services.

## Decision Drivers

### 1. Cache Interaction Pattern
**Decision:** Cache-aside (Lazy Loading) pattern
- Application code checks cache first
- On cache miss, fetch from database and populate cache
- Write-through is not used; cache is always stale-aware

**Alternative considered:** Write-through pattern
- Pros: Cache always consistent with database
- Cons: Every write incurs 2 round-trips (write to DB + write to cache), higher write latency
- **Chosen:** Cache-aside for write performance

### 2. Cache Key Design
**Decision:** Consistent key format across services
- Key format: `resource:{entity_type}:{entity_id}`
- Example: `user:123`, `product:456`
- Enables easy cache warming and invalidation

**Alternative considered:** Ad-hoc key naming
- Pros: Flexible for unique use cases
- Cons: Hard to manage globally, difficult cache invalidation
- **Chosen:** Consistent naming convention

### 3. Cache Expiration Strategy
**Decision:** TTL-based expiration with write-behind cleanup
- Set TTL based on data volatility (e.g., 5-30 minutes for hot data)
- On cache miss or expiry, fetch fresh data from DB
- Periodic cleanup task removes stale entries

**Alternative considered:** Write-behind with immediate invalidation
- Pros: Cache always fresh
- Cons: Complex invalidation logic, risk of data loss
- **Chosen:** TTL-based for simplicity and reliability

### 4. Cache Miss Handling
**Decision:** Graceful degradation with fallback
- On cache miss: Query database directly
- If DB query succeeds: Populate cache and return data
- If DB query fails: Return appropriate error response
- Never block the entire request on cache availability

**Alternative considered:** Fail-closed on cache miss
- Pros: Guarantees data consistency
- Cons: High latency, poor user experience on transient cache issues
- **Chosen:** Fail-open with DB fallback for resilience

## Consequences

### Positive
- **Performance:** Hot data retrieved from cache in sub-millisecond time
- **Simplicity:** Code is straightforward, no complex invalidation logic
- **Scalability:** Reduces DB load, enables higher QPS
- **Flexibility:** Works with any database and cache technology

### Negative
- **Cache Stale Data:** May return slightly outdated data until TTL expires
- **Cache Miss Penalty:** First request after miss incurs DB latency
- **Cache Coherency:** Multiple instances may have stale data simultaneously
- **Thundering Herd:** Many simultaneous cache misses can overwhelm DB

## Related ADRs
- ADR 001: URL Shortener Design (Module 1.4)
- ADR 002: Rate Limiter Design (Module 2.3)
- ADR 005: Database Scaling Design (Module 3.4)

## Implementation Notes
- Cache-aside pattern is also known as "Lazy Loading"
- Redis `GET` then `SET` (or `SETNX`) for atomic cache population
- Consider using Redis Lua scripts for atomic check-and-populate
- Monitor cache hit/miss ratio for optimization
- Set appropriate TTL based on data criticality
# ADR 002: Rate Limiter Design (Token Bucket)

## Status: Proposed
## Date: 2025-01-01
## Author: System Design Learning

## Context

As part of Module 2.6 exercise, we need to design a rate limiter to protect services from abuse and ensure fair resource allocation. The task requires implementing a token bucket algorithm.

## Decision Drivers

### 1. Algorithm Selection
**Decision:** Token Bucket algorithm with configurable parameters
- Rate: tokens per second (refill rate)
- Capacity: maximum tokens bucket can hold
- Burst allowance: number of requests permitted when bucket is full

**Alternative considered:** Leaky Bucket algorithm
- Pros: Smooths out bursty traffic, constant output rate
- Cons: Less flexible, does not allow burst handling
- **Chosen:** Token Bucket for burst handling and fairness

### 2. Storage Pattern
**Decision:** In-memory rate limiter with Redis backup
- Primary: In-memory map (client_id -> bucket state)
- Secondary: Redis for distributed rate limiting across instances
- TTL: Auto-expiry based on token refill timing

**Alternative considered:** Pure database-backed rate limiter
- Pros: Persistent, survives restarts
- Cons: Excessive latency for per-request checks
- **Chosen:** In-memory + Redis for performance

### 3. Key Granularity
**Decision:** Client identifier-based rate limiting
- Key format: `rate_limit:{client_id}` where client_id = IP address or API key
- Supports per-client isolation
- Group-based rates possible via key prefixes

**Alternative considered:** Global rate limiting only
- Pros: Simpler implementation
- Cons: Does not protect against individual client abuse
- **Chosen:** Per-client for fair resource allocation

### 4. Enforcement Point
**Decision:** Enforce at edge / API gateway level
- Positioned before request reaches business logic
- Rejects with HTTP 429 (Too Many Requests)
- Includes `Retry-After` header for client guidance

**Alternative considered:** Enforce at application level
- Pros: More flexible logic
- Cons: Wasted processing on requests that will be rejected
- **Chosen:** Edge enforcement for efficiency

### 5. Metrics & Monitoring
**Decision:** Track rate limit metrics per client
- Current bucket level
- Last reset time
- Rejected request count
- Burst usage patterns

**Alternative considered:** No metrics (silent limiting)
- Pros: Simpler code
- Cons: Hard to tune parameters, no observability
- **Chosen:** Full metrics for operational awareness

## Consequences

### Positive
- Token bucket allows controlled burst handling
- In-memory + Redis pattern provides both speed and distribution
- Edge enforcement prevents wasted computation
- Metrics enable parameter tuning and capacity planning

### Negative
- Added system complexity (Redis dependency)
- Edge services need capacity to handle rejection logic
- Clock synchronization needed for distributed buckets
- TTL management required for auto-expiry

## Related ADRs
- ADR 001: URL Shortener Design (Module 1.4)
- ADR 003: Cache-Aside Pattern (Module 2.2)

## Implementation Notes
- Refill rate = desired QPS / bucket_size
- Typical setup: 100 tokens, 10 refill/sec = 10 requests/sec sustained, 100 request burst
- Redis Lua scripts for atomic operations (check-and-consume)
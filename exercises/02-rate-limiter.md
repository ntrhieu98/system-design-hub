# Exercise 2: Rate Limiter Design

## Objective
Design a rate limiting system using the token bucket algorithm to protect an API from abuse.

## Requirements

### Functional Requirements
1. **Track requests per client**: Identify clients by IP address or API key
2. **Enforce rate limits**: Reject requests exceeding the configured limit
3. **Support burst traffic**: Allow temporary bursts up to a maximum capacity
4. **Reset mechanism**: Tokens refill at a constant rate

### Non-Functional Requirements
1. **Latency**: Rate check must complete in < 1ms
2. **Scalability**: Support distributed deployment across multiple instances
3. **Accuracy**: Rate limit enforcement must be precise (no over- or under-limiting)
4. **Observability**: Metrics on current rate, rejections, bucket state

## Token Bucket Algorithm

### Parameters
- **rate**: Refill rate (tokens per second)
- **capacity**: Maximum tokens the bucket can hold
- **burst**: Maximum burst size allowed (typically = capacity)

### How It Works
1. Bucket starts full (capacity tokens)
2. Each request consumes 1 token
3. Tokens refill at `rate` tokens per second
4. If bucket is full, refilling stops (capacity cap)
5. If bucket is empty, requests are rejected

### Mathematical Model
```
tokens(t) = min(capacity, tokens(t-1) + rate × Δt)
allowed = tokens(t) > 0 && consume_token()
```

### Example Setup
- rate = 10 tokens/sec (sustained 10 req/sec)
- capacity = 100 tokens (burst up to 100 requests)
- Normal operation: 10 req/sec sustained
- Burst: Up to 100 requests in quick succession
- After burst: 10 seconds to refill fully

## Implementation Patterns

### 1. In-Memory Only (Single Instance)
```python
rate_limits = {}  # client_id -> {tokens, last_refill}

def check_rate(client_id, rate, capacity):
    now = time.time()
    if client_id not in rate_limits:
        rate_limits[client_id] = {"tokens": capacity, "last_refill": now}
    
    limit = rate_limits[client_id]
    # Refill tokens based on elapsed time
    elapsed = now - limit["last_refill"]
    add_tokens = elapsed * rate
    limit["tokens"] = min(capacity, limit["tokens"] + add_tokens)
    limit["last_refill"] = now
    
    if limit["tokens"] > 0:
        limit["tokens"] -= 1
        return True  # Allow request
    return False  # Reject request
```

### 2. Redis-Backed (Distributed)
- Use Redis Lua script for atomic check-and-consume
- Key format: `rate_limit:{client_id}`
- TTL auto-expiry based on token refill

### 3. Hybrid Approach
- In-memory cache for hot clients
- Redis fallback for cold clients or cross-instance consistency

## API Gateway Integration

### HTTP 429 Response
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 3600
{
  "error": "rate_limit_exceeded",
  "limit": 10,
  "remaining": 0,
  "reset": 1704067200
}
```

### Headers (Recommended)
- `X-RateLimit-Limit`: Total allowed per period
- `X-RateLimit-Remaining`: Requests remaining in current period
- `X-RateLimit-Reset`: Epoch seconds when counter resets

## Design Decisions

### 1. Key Granularity
**Decision:** Client identifier (IP or API key)
- Pros: Per-client isolation, easy to understand
- Cons: Shared IPs (NAT) count as one client
- **Chosen:** Per-client for targeted limiting

### 2. Enforcement Point
**Decision:** API gateway / edge layer
- Pros: Reject early, save backend resources
- Cons: Additional hop, need gateway capacity
- **Chosen:** Edge enforcement for efficiency

### 3. Delivery Semantics
**Decision:** At-least-once with idempotent consumers
- Not directly applicable to rate limiting, but concept similar
- Rate limiter should be deterministic
- **Chosen:** Deterministic token refill for predictability

## Deliverables
1. **Design**: Token bucket specification with parameters
2. **Implementation**: Pseudocode or actual code for rate check
3. **Metrics**: Track rejection rate, average bucket level
4. **Testing**: Unit tests for boundary conditions (exactly at limit, just under, just over)

## Success Criteria
- [ ] Token bucket parameters clearly defined
- [ ] Rate check implementation correct for boundary conditions
- [ ] API gateway integration pattern documented
- [ ] Metrics and monitoring strategy defined
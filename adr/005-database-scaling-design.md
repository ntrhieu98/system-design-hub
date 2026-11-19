# ADR 005: Database Scaling Design

## Status: Proposed
## Date: 2025-01-01
## Author: System Design Learning

## Context

As part of Module 3.3 exercise, we need to design strategies for scaling databases to handle growing workloads and data volumes.

## Decision Drivers

### 1. Replication Strategy
**Decision:** Primary-Replica (Single Leader) replication
- Single writer (primary), multiple readers (replicas)
- Asynchronous replication with configurable lag tolerance
- Read queries can be routed to replicas for load distribution

**Alternative considered:** Multi-master / Multi-primary replication
- Pros: Any node can accept writes, higher write availability
- Cons: Complex conflict resolution, replication lag issues, split-brain scenarios
- **Chosen:** Primary-replica for simplicity and operational familiarity

### 2. Sharding Strategy
**Decision:** Consistent hashing with virtual nodes
- Even distribution of data across N shards
- Minimal rebalancing when adding/removing shards
- Virtual nodes per physical shard improve distribution

**Alternative considered:** Range-based sharding
- Pros: Simple to understand, easy range queries
- Cons: Hotspot issues when some ranges get more traffic, rebalancing is disruptive
- **Chosen:** Consistent hashing for even distribution and hotspot avoidance

### 3. Read-Write Splitting
**Decision:** Application-level routing with replica awareness
- Read queries automatically routed to nearest replica
- Write queries always go to primary
- Connection pooling per-replica for efficiency

**Alternative considered:** Database proxy middleware
- Pros: Transparent to application, centralized routing logic
- Cons: Additional hop, potential single point of failure, latency
- **Chosen:** Application-level routing for simplicity and control

### 4. Consistency Model
**Decision:** Eventual consistency with read-your-writes session consistency
- Replication is asynchronous; replicas may be stale
- Client sessions read their own writes via primary or sticky sessions
- Trade-off between consistency and availability/latency

**Alternative considered:** Strong consistency (synchronous replication)
- Pros: Always-read-the-latest-data guarantees
- Cons: High write latency, replica lag, reduced availability during partitions
- **Chosen:** Eventual consistency for better performance and availability

### 5. Connection Pooling & Management
**Decision:** Sized connection pools per replica with circuit breaker
- Maximum connections based on database max_connections
- Health checks and automatic failover detection
- Circuit breaker opens circuit on repeated failures

**Alternative considered:** Single shared connection pool
- Pros: Simpler configuration
- Cons: No failover, all connections affected by one bad replica
- **Chosen:** Per-replica pools with circuit breakers for resilience

## Consequences

### Positive
- **Scalability:** Horizontal scaling through sharding and replicas
- **Availability:** Multiple replicas provide failover capability
- **Performance:** Read scaling via replica distribution, reduced primary load
- **Resilience:** Circuit breakers prevent cascading failures

### Negative
- **Replication Lag:** Replicas may be behind primary; read-your-writes requires care
- **Operational Complexity:** Managing shards, replicas, failover requires expertise
- **Data Consistency:** Eventual consistency means reads may return stale data
- **Rebalancing Cost:** Adding/removing shards requires data migration, temporary downtime

## Related ADRs
- ADR 001: URL Shortener Design (Module 1.4)
- ADR 003: Cache-Aside Pattern (Module 2.2)
- ADR 004: Message Queue Design (Module 2.4)

## Implementation Notes
- Use tools like ProxySQL, Vitess, or application-level routing
- Monitor replication lag continuously
- Set appropriate write concern and read concern levels
- Test failover procedures regularly
- Consider logical replication for cross-cloud setups
- Use connection pooling (PgBouncer for PostgreSQL, c3p0/Hikari for Java)
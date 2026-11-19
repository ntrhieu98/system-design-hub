# ADR 004: Message Queue Design (Pub/Sub Pattern)

## Status: Proposed
## Date: 2025-01-01
## Author: System Design Learning

## Context

As part of Module 2.4 exercise, we need to design a message queue system for asynchronous processing, decoupling, and reliable event delivery.

## Decision Drivers

### 1. Queue Type Selection
**Decision:** Publish-Subscribe (Pub/Sub) pattern
- Publishers send messages to topics without knowing subscribers
- Multiple subscribers can receive the same message independently
- Decouples producers from consumers completely

**Alternative considered:** Point-to-Point (Queue)
- Pros: Guarantees exactly-one processing per message
- Cons: Only one consumer receives each message, no broadcast capability
- **Chosen:** Pub/Sub for fan-out and event broadcasting

### 2. Message Delivery Semantics
**Decision:** At-least-once delivery with idempotent consumers
- Messages are not lost, may be delivered multiple times
- Consumers must handle duplicate processing gracefully
- Avoids data inconsistency from lost messages

**Alternative considered:** Exactly-once delivery
- Pros: No duplicate processing, perfect data consistency
- Cons: Very high overhead, complex coordination, performance penalty
- **Chosen:** At-least-once for performance with idempotent consumers

### 3. Message Ordering
**Decision:** Per-partition ordering with consistent hashing
- Messages with same key go to same partition
- Within each partition, messages are ordered
- Enables parallel processing while preserving order where needed

**Alternative considered:** Global ordering
- Pros: Strict ordering of all messages
- Cons: Limits parallelism, single bottleneck, poor scalability
- **Chosen:** Per-partition ordering for balanced throughput and order

### 4. Dead Letter Queue (DLQ)
**Decision:** Automatic DLQ for failed messages
- Messages that fail N retry attempts move to DLQ
- Enables manual inspection and reprocessing
- Prevents failed messages from blocking the main queue

**Alternative considered:** No DLQ (silent drop)
- Pros: Simpler implementation
- Cons: Messages lost without trace, hard to debug
- **Chosen:** DLQ for observability and reliability

### 5. Throughput & Scalability
**Decision:** Partitioned topics with horizontal scaling
- Topics split across multiple partitions
- Each partition can be consumed by one consumer in a group
- Add more partitions or consumer groups to scale

**Alternative considered:** Single queue instance
- Pros: Simpler, guaranteed ordering
- Cons: Limited throughput, single point of failure
- **Chosen:** Partitioned for horizontal scalability

## Consequences

### Positive
- **Decoupling:** Producers and consumers evolve independently
- **Resilience:** Failed consumers don't block producers
- **Scalability:** Add partitions to handle higher throughput
- **Reliability:** DLQ ensures no message loss
- **Flexibility:** Multiple consumers can process same events

### Negative
- **Complexity:** More moving parts to monitor and manage
- **Eventual Consistency:** System state reflects processed events over time
- **Ordering Trade-offs:** Per-partition vs global ordering choice
- **Operational Overhead:** Topic/partition management, consumer group tracking

## Related ADRs
- ADR 001: URL Shortener Design (Module 1.4)
- ADR 002: Rate Limiter Design (Module 2.3)
- ADR 003: Cache-Aside Pattern (Module 2.2)
- ADR 005: Database Scaling Design (Module 3.4)

## Implementation Notes
- Consider Redis Streams, Kafka, RabbitMQ, or AWS SQS/SNS
- Partition key design is critical for even distribution
- Consumer group coordination prevents duplicate processing
- Monitor lag between producers and consumers
- Set appropriate retry policies and backoff strategies
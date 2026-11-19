# ADR 006: Microservices Architecture Design

## Status: Proposed
## Date: 2025-01-01
## Author: System Design Learning

## Context

As part of Module 6.4 exercise, we need to design a microservices architecture for building scalable, maintainable, and independently deployable services.

## Decision Drivers

### 1. Service Decomposition Strategy
**Decision:** Bounded Contexts with Domain-Driven Design
- Services organized around business capabilities and domains
- Each service owns its data and business logic
- Clear boundaries prevent tight coupling

**Alternative considered:** Feature-based decomposition
- Pros: Easy to find services for a given feature
- Cons: Services share databases, tight coupling, difficult to refactor
- **Chosen:** Bounded context decomposition for loose coupling and independent evolution

### 2. Service Communication
**Decision:** Hybrid sync/async communication
- Synchronous (HTTP/REST) for request-response operations
- Asynchronous (message queue) for events and background processing

**Alternative considered:** Pure synchronous or pure asynchronous
- Pros of pure sync: Simple, immediate responses, easy debugging
- Cons of pure sync: Tight coupling, cascading failures, poor resilience
- Pros of pure async: Decoupling, resilience, batch processing
- Cons of pure async: No immediate responses, complex correlation, eventual consistency
- **Chosen:** Hybrid for best of both worlds: REST for user-facing ops, messaging for background

### 3. API Gateway & Edge Services
**Decision:** API Gateway at edge, service mesh for internal communication
- API Gateway: Authentication, rate limiting, request routing, protocol translation
- Service Mesh: mTLS, service discovery, observability, traffic management between services

**Alternative considered:** No gateway/mesh (each service handles independently)
- Pros: Simpler initial setup, fewer moving parts
- Cons: Duplicate security logic, inconsistent observability, harder cross-cutting concerns
- **Chosen:** Gateway + mesh for operational efficiency and consistency

### 4. Data Management per Service
**Decision:** Each service owns its database (database-per-service)
- No shared databases between services
- Prevents tight coupling and makes refactoring easier
- eventual consistency via integration events

**Alternative considered:** Shared database
- Pros: Simpler initially, no data migration needed
- Cons: Tight coupling, schema coordination overhead, difficult to refactor services independently
- **Chosen:** Database-per-service for independence and evolution flexibility

### 5. Deployment & Orchestration
**Decision:** Containerized deployment with Kubernetes
- Services packaged as Docker containers
- Kubernetes provides auto-scaling, self-healing, service discovery
- Helm charts for application deployment management

**Alternative considered:** Virtual machines / bare metal deployment
- Pros: No container overhead, familiar infrastructure
- Cons: Slower scaling, no built-in service discovery, manual health checks
- **Chosen:** Kubernetes for modern microservices infrastructure

## Consequences

### Positive
- **Independence:** Services can be developed, deployed, scaled independently
- **Resilience:** Failure in one service doesn't cascade to others (with proper circuit breakers)
- **Scalability:** Scale services based on their specific load profiles
- **Technology Heterogeneity:** Each service can use its optimal language/database
- **Team Autonomy:** Teams can own and evolve services independently

### Negative
- **Operational Complexity:** Many services to monitor, deploy, and manage
- **Distributed Tracing:** Harder to debug end-to-end requests across service boundaries
- **Data Consistency:** Eventual consistency requires careful design, distributed transactions are complex
- **Network Latency:** Inter-service communication over network vs in-process calls
- **Testing Complexity:** Integration testing requires spinning up multiple services

## Related ADRs
- ADR 001: URL Shortener Design (Module 1.4)
- ADR 002: Rate Limiter Design (Module 2.3)
- ADR 003: Cache-Aside Pattern (Module 2.2)
- ADR 004: Message Queue Design (Module 2.4)
- ADR 005: Database Scaling Design (Module 3.3)

## Implementation Notes
- Start with monolith, extract to microservices when boundaries become clear
- Use OpenAPI/Swagger for API documentation and contract testing
- Implement circuit breakers (Hystrix, Resilience4j) for inter-service calls
- Centralized logging (ELK/EFK stack), metrics (Prometheus+Grafana), tracing (Jaeger/Zipkin)
- API Gateway patterns: Route, Composition, Aggregation, Authentication, Rate Limiting
- Service Mesh features: mTLS, traffic splitting, retries, timeouts, circuit breaking
- Consider gradual migration: Strangler Fig pattern to replace monolith piece by piece
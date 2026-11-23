# System Architecture & Design (Day 1)

## 1. Bounded Contexts (Domain-Driven Design)

1. **Catalog (`restaurants`, `menu`, `search`)**: Restaurant profiles, menus, pricing, geo/hybrid search.
2. **Orders (`cart`, `orders`)**: Cart state, order creation, order state machine, live order queue.
3. **Payments (`payments`, `coupons`)**: Razorpay/Stripe charges, webhooks, idempotency, refunds.
4. **Dispatch (`delivery`, `realtime`, `notifications`)**: Rider assignment, live location tracking, route batching, FCM/email alerts.
5. **AI (`ai`)**: Bridge to Python FastAPI + LangGraph service (RAG, embeddings, multi-agent orchestration, ML predictions).

---

## 2. C4 Container Diagram

```mermaid
C4Container
  title Food Delivery Platform - Container Diagram
  Person(customer, "Customer / Owner / Rider", "Web (React SPA) & Mobile (Expo)")
  System_Boundary(platform, "Food Delivery Platform") {
    Container(web, "React SPA", "React + Vite + JS", "Customer ordering, Restaurant & Admin dashboards")
    Container(api, "Core Backend API", "Node.js + Express", "Auth, Catalog, Cart, Orders, Payments, Dispatch")
    Container(ai, "AI & ML Service", "Python FastAPI + LangGraph", "RAG chatbot, Multi-agent MCP, ETA/Fraud ML")
    Container(worker, "Workflow & Job Workers", "Temporal / BullMQ", "Order Saga, async notifications, outbox relay")
    ContainerDb(db, "Supabase Postgres", "PostgreSQL + PostGIS + pgvector", "Primary transactional store with RLS")
    ContainerDb(redis, "Redis", "In-memory cache & queue", "Rate limits, caching, BullMQ")
    Container(kafka, "Redpanda / Kafka", "Event Broker", "Domain events (order.placed, order.paid)")
  }
  Rel(customer, web, "Uses", "HTTPS")
  Rel(web, api, "REST / JSON + JWT", "HTTPS")
  Rel(api, db, "Reads/Writes with RLS", "TLS/SQL")
  Rel(api, redis, "Cache & Locks")
  Rel(api, kafka, "Publishes via Outbox")
  Rel(api, ai, "Calls AI/ML endpoints", "HTTP")
  Rel(worker, kafka, "Consumes events")
  Rel(worker, db, "Updates state")
```

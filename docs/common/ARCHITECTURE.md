# Kiến trúc Hệ thống – QR Dine‑in Ordering Platform

> **Mục đích**: Mô tả kiến trúc tổng thể, các thành phần chính, luồng dữ liệu, công nghệ và quyết định thiết kế cho nền tảng gọi món QR đa tenant.

- **Version**: 1.0  
- **Created**: 2025‑01‑11  
- **Last Updated**: 2025‑01‑11

---

## 1. Tổng quan Kiến trúc

### 1.1. Nguyên tắc Thiết kế
- **Multi‑tenant**: Cách ly dữ liệu hoàn toàn giữa các tenant (nhà hàng)
- **API‑first**: Backend cung cấp RESTful API chuẩn OpenAPI
- **Mobile‑first**: Giao diện khách hàng tối ưu cho thiết bị di động
- **Scalable**: Kiến trúc cho phép mở rộng theo chiều ngang
- **Secure**: Xác thực, phân quyền và mã hóa ở mọi tầng
- **Observable**: Logging, monitoring và audit trail đầy đủ

### 1.2. Kiến trúc Tổng thể (High‑Level)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Customer   │  │   Waiter    │  │   Kitchen   │          │
│  │  PWA/Web    │  │   Console   │  │     KDS     │          │
│  │  (Mobile)   │  │ (Responsive)│  │  (TV/Tab)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                           │
                    [HTTPS / WSS]
                           │
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / CDN                        │
│  - Rate Limiting                                            │
│  - SSL Termination                                          │
│  - Request Routing                                          │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Backend API Service                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐   │  │
│  │  │ Tenants  │ │  Menu    │ │  Orders  │ │Analytics│   │  │
│  │  │ Module   │ │  Module  │ │  Module  │ │ Module  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │  │
│  │  │  Tables  │ │ Payments │ │   Auth   │               │  │
│  │  │   & QR   │ │ Module   │ │  Module  │               │  │
│  │  └──────────┘ └──────────┘ └──────────┘               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  PostgreSQL  │  │    Redis     │  │  Object      │       │
│  │  (Primary)   │  │    Cache     │  │  Storage     │       │
│  │  + RLS       │  │  + Session   │  │  (Images)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Payment    │  │  SMS/Email   │  │  Monitoring  │       │
│  │   Gateway    │  │  Notification│  │  & Logging   │       │
│  │  (Stripe)    │  │   Service    │  │ (Grafana)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Các Thành Phần Chính

### 2.1. Client Layer

#### 2.1.1. Customer PWA (Progressive Web App)
**Mô tả**: Ứng dụng web tối ưu cho mobile, cho phép khách hàng quét QR và gọi món.

**Đặc điểm**:
- **Công nghệ**: React/Vite + Tailwind CSS
- **Responsive**: Mobile‑first, hỗ trợ tablet
- **Offline**: Service Worker cho trải nghiệm offline cơ bản
- **PWA**: Có thể cài đặt, hoạt động như native app

**Tính năng chính**:
- Quét QR code (hoặc nhập link)
- Xem menu theo tenant
- Quản lý giỏ hàng
- Checkout và thanh toán
- Theo dõi trạng thái đơn hàng

#### 2.1.2. Waiter Console
**Mô tả**: Giao diện web responsive cho nhân viên phục vụ.

**Đặc điểm**:
- **Công nghệ**: React + Responsive UI
- **Thiết bị**: Tablet, điện thoại, PC
- **Real‑time**: WebSocket cho cập nhật đơn hàng

**Tính năng chính**:
- Xem danh sách đơn hàng theo trạng thái
- Lọc theo bàn, thời gian
- Nhắc bếp với đơn chậm
- Đánh dấu món đã giao

#### 2.1.3. Kitchen Display System (KDS)
**Mô tả**: Màn hình hiển thị cho bếp, tối ưu cho TV/màn hình lớn.

**Đặc điểm**:
- **Công nghệ**: React + Large UI Components
- **Thiết bị**: TV, tablet lớn, màn hình PC
- **Display**: Font lớn, dễ đọc từ xa

**Tính năng chính**:
- Hàng đợi đơn hàng theo thời gian
- Chuyển trạng thái: Received → Preparing → Ready
- Âm thanh thông báo đơn mới
- Highlight đơn chờ lâu

### 2.2. API Gateway / CDN

**Vai trò**:
- Load balancing
- Rate limiting (chống abuse)
- SSL termination
- Caching tĩnh (menu images)
- Request routing theo tenant

**Công nghệ gợi ý**:
- Cloudflare / AWS CloudFront
- NGINX / Traefik

### 2.3. Backend API Service

#### 2.3.1. Kiến trúc Backend
**Mô hình**: Monolithic Modular (MVP) → Microservices (tương lai)

**Công nghệ**:
- **Runtime**: Node.js 20+ / Bun
- **Framework**: NestJS (cấu trúc module rõ ràng)
- **Language**: TypeScript
- **API Style**: RESTful + OpenAPI 3.0

**Modules**:

##### Tenants Module
- Quản lý thông tin nhà hàng
- Cấu hình: giờ mở cửa, địa chỉ, branding
- Subscription/pricing tiers

##### Tables & QR Module
- CRUD tables
- Sinh QR code (signed token)
- Quản lý token lifecycle (revoke/regenerate)

##### Menu Module
- Quản lý categories, items, modifiers
- Pricing và variants
- Menu versioning (publish không downtime)

##### Orders Module
- Tạo đơn hàng từ customer
- State machine: Received → Preparing → Ready → Served
- Audit trail đầy đủ

##### Payments Module
- Tích hợp payment gateway (Stripe)
- Redirect flow (MVP)
- Webhook handling

##### Auth Module
- JWT‑based authentication
- Tenant‑scoped authorization
- Role‑based access control (Customer, Waiter, Kitchen, Admin)

##### Analytics Module
- Tổng hợp metrics: đơn/ngày, conversion, AOV
- Kitchen SLA: thời gian xử lý
- Retention và funnel analysis

#### 2.3.2. Middleware Pipeline

```
Request → Auth Check → Tenant Isolation → Rate Limit → Handler → Response
                ↓              ↓              ↓           ↓
              JWT        tenantId scope   Redis       Business
            Verify       + RLS filter    Counter      Logic
```

### 2.4. Data Layer

#### 2.4.1. PostgreSQL (Primary Database)
**Vai trò**: Lưu trữ dữ liệu chính, ACID transactions

**Schema Design**:
- **Tenant Isolation**: Field‑level `tenantId` + Row‑Level Security (RLS)
- **Indexes**: Composite indexes trên `(tenantId, ...)`
- **Audit**: Trigger hoặc application‑level logging

**Tables chính**:
```sql
tenants (id, name, slug, settings, created_at, ...)
tables (id, tenant_id, label, qr_token_hash, active, ...)
menu_categories (id, tenant_id, name, display_order, ...)
menu_items (id, tenant_id, category_id, name, price, ...)
modifiers (id, item_id, name, price_delta, ...)
orders (id, tenant_id, table_id, customer_info, state, ...)
order_items (id, order_id, item_id, modifiers, qty, ...)
audit_logs (id, tenant_id, entity, action, user, timestamp, ...)
```

**Migrations**: Sử dụng migration tool (Prisma, TypeORM, Drizzle)

#### 2.4.2. Redis
**Vai trò**:
- Session storage
- Cache menu data (hot data)
- Rate limiting counters
- Real‑time pub/sub (optional)

**Data Types**:
- **Strings**: Session tokens, cache
- **Sets**: Active tables per tenant
- **Sorted Sets**: Order queue by timestamp
- **Pub/Sub**: Real‑time notifications

#### 2.4.3. Object Storage
**Vai trò**: Lưu trữ assets (ảnh menu, QR codes)

**Công nghệ**:
- AWS S3 / Cloudflare R2 / MinIO (self‑hosted)

**Cấu trúc**:
```
/tenants/{tenantId}/menu/{itemId}.jpg
/tenants/{tenantId}/qr/{tableId}.png
```

**CDN**: Phục vụ qua CloudFront/Cloudflare để giảm latency

### 2.5. External Services

#### 2.5.1. Payment Gateway
**Provider**: Stripe Checkout (MVP)

**Flow**:
1. Customer checkout → Backend tạo Stripe session
2. Redirect đến Stripe hosted page
3. Webhook nhận kết quả → Cập nhật order status

**Post‑MVP**: Stripe Elements (native integration)

#### 2.5.2. Notification Service
**Channels**:
- **Email**: Xác nhận đơn, receipt (SendGrid/SES)
- **SMS**: Thông báo đơn sẵn sàng (Twilio) – optional

#### 2.5.3. Monitoring & Observability
**Stack**:
- **Logs**: Winston/Pino → Loki/CloudWatch
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry → Jaeger
- **Alerts**: PagerDuty / Slack webhooks

---

## 3. Luồng Dữ liệu (Data Flow)

### 3.1. Customer Ordering Flow

```
┌─────────┐     1. Scan QR      ┌─────────┐
│Customer │ ─────────────────→  │ Browser │
└─────────┘                     └─────────┘
                                      │
                        2. Parse token (tableId, tenantId)
                                      │
                                      ↓
                              ┌──────────────┐
                         3. GET /menu        │
                              │  + token     │
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Backend    │ ←─── 4. Verify token
                              │              │      5. Fetch menu (cache)
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │  + Redis     │
                              └──────────────┘
                                      │
                        6. Return menu JSON
                                      ↓
                              ┌──────────────┐
                              │   Browser    │ ←─── 7. Display menu
                              └──────────────┘
                                      │
                        8. Add to cart, checkout
                                      │
                                      ↓
                        9. POST /orders {items, ...}
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Backend    │ ←─── 10. Validate
                              │              │      11. Create order (DB)
                              │              │      12. Emit event (WebSocket)
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Waiter     │ ←─── 13. New order notification
                              │   Console    │
                              └──────────────┘
                                      │
                                      ↓
                              ┌──────────────┐
                              │   Kitchen    │ ←─── 14. Order appears in KDS
                              │     KDS      │
                              └──────────────┘
```

### 3.2. Order State Transition Flow

```
Customer Order → [Received]
                      │
                      │ Kitchen accepts
                      ↓
                  [Preparing]
                      │
                      │ Kitchen completes
                      ↓
                   [Ready]
                      │
                      │ Waiter delivers
                      ↓
                   [Served]
                      │
                      │ Customer pays
                      ↓
                   [Closed]

Each transition:
  - Logged in audit_logs
  - Timestamp recorded
  - Actor identified (userId)
  - WebSocket event emitted
```

### 3.3. QR Code Generation Flow

```
Admin → [Create Table]
           │
           ↓
    Generate signed token
    {tenantId, tableId, exp}
           │
           ↓
    Sign with secret key (HMAC)
           │
           ↓
    Generate QR code image (PNG/SVG)
           │
           ↓
    Upload to Object Storage
           │
           ↓
    Return public URL + download link
```

**Token Structure**:
```json
{
  "tid": "tenant123",
  "tbl": "table5",
  "exp": 1735689600,
  "sig": "base64_signature"
}
```

---

## 4. Security Architecture

### 4.1. Authentication & Authorization

#### 4.1.1. Customer Flow
- **Token‑based**: QR token chứa signed payload
- **No registration**: Nhập thông tin tối thiểu (tên, SĐT)
- **Session**: Short‑lived session trong Redis

#### 4.1.2. Staff Flow
- **JWT‑based**: Login → Nhận JWT token
- **Refresh token**: Stored in httpOnly cookie
- **Claims**: `{userId, tenantId, roles[]}`

#### 4.1.3. Role‑Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| Customer | Read menu, Create order (own) |
| Waiter | Read orders (tenant), Update order state |
| Kitchen | Read orders (tenant), Update order state (Preparing/Ready) |
| Admin | Full CRUD on tenant resources |

### 4.2. Multi‑tenant Isolation

**Strategies**:
1. **Database Level**: Row‑Level Security (RLS) policies
2. **Application Level**: Middleware kiểm tra `tenantId` trong mọi query
3. **API Level**: Token phải chứa tenant scope

**Example RLS Policy**:
```sql
CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 4.3. Data Encryption

- **In Transit**: TLS 1.3 (HTTPS)
- **At Rest**: Database encryption (PostgreSQL + disk encryption)
- **Sensitive Fields**: PII (phone, email) → AES‑256 encryption

### 4.4. Rate Limiting

**Levels**:
- **API Gateway**: 1000 req/min per IP
- **Application**: 100 req/min per user
- **QR Scan**: 10 scans/min per QR code (chống spam)

---

## 5. Scalability & Performance

### 5.1. Horizontal Scaling

**Stateless Backend**:
- Multiple API instances behind load balancer
- Session stored in Redis (shared state)
- WebSocket sticky sessions (optional: Redis adapter)

**Database**:
- Read replicas cho analytics/reports
- Connection pooling (PgBouncer)

### 5.2. Caching Strategy

**Layers**:
1. **CDN**: Static assets (images, QR codes)
2. **Application Cache**: Menu data (Redis, TTL 5m)
3. **Database Cache**: Query result caching

**Cache Invalidation**:
- Menu update → Invalidate cache by `tenantId`
- Order state change → Invalidate order cache

### 5.3. Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Menu Load Time | < 1s |
| Order Submission | < 500ms |
| WebSocket Latency | < 100ms |
| Database Query (p95) | < 50ms |

---

## 6. Deployment Architecture

### 6.1. Environment Strategy

**Environments**:
- **Development**: Local Docker Compose
- **Staging**: Cloud (mimic production)
- **Production**: Cloud (multi‑region optional)

### 6.2. Infrastructure (Suggested)

**Option 1: Cloud Managed Services**
```
Frontend: Vercel / Netlify
Backend: Fly.io / Render / Railway
Database: Neon / Supabase (managed Postgres)
Redis: Upstash / Redis Cloud
Storage: Cloudflare R2 / AWS S3
```

**Option 2: Container Orchestration**
```
Platform: Docker + Kubernetes (GKE/EKS)
Services: Pods with auto‑scaling
Database: Cloud SQL / RDS
Redis: ElastiCache / Memorystore
```

### 6.3. CI/CD Pipeline

```
Code Push (GitHub)
     │
     ↓
GitHub Actions
     │
     ├─→ Lint & Test
     ├─→ Build Docker Image
     ├─→ Push to Registry
     ↓
Deployment
     │
     ├─→ Staging (auto)
     └─→ Production (manual approval)
```

**Steps**:
1. Run tests (unit, integration)
2. Build Docker image
3. Push to container registry
4. Deploy to staging
5. Run smoke tests
6. Manual approval → Deploy to production
7. Health check & rollback if needed

---

## 7. Monitoring & Observability

### 7.1. Logging

**Structured Logs**:
```json
{
  "timestamp": "2025-01-11T10:30:00Z",
  "level": "info",
  "service": "api",
  "tenantId": "tenant123",
  "userId": "user456",
  "action": "order.created",
  "orderId": "order789",
  "duration": 145
}
```

**Centralized**: Loki / ELK / CloudWatch Logs

### 7.2. Metrics

**Key Metrics**:
- Request rate, error rate, latency (RED)
- Database connections, query time
- Cache hit rate
- Order conversion rate

**Dashboards**: Grafana với alerts

### 7.3. Tracing

**Distributed Tracing**:
- OpenTelemetry instrumentation
- Trace request từ frontend → backend → database
- Visualize trong Jaeger

### 7.4. Alerts

**Critical Alerts**:
- API error rate > 5%
- Database connection pool exhausted
- Payment webhook failure
- Disk usage > 80%

**Channels**: PagerDuty, Slack, Email

---

## 8. Technology Stack Summary

### 8.1. Frontend

| Component | Technology |
|-----------|-----------|
| Customer App | React + Vite + TypeScript |
| Waiter Console | React + TypeScript |
| KDS | React + TypeScript |
| UI Framework | Tailwind CSS + shadcn/ui |
| State Management | Zustand / Jotai |
| API Client | TanStack Query |
| PWA | Workbox (Service Worker) |

### 8.2. Backend

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20+ / Bun |
| Framework | NestJS |
| Language | TypeScript |
| API Docs | OpenAPI 3.0 (Swagger) |
| Validation | class‑validator + class‑transformer |
| ORM | Prisma / Drizzle ORM |

### 8.3. Database & Storage

| Component | Technology |
|-----------|-----------|
| Primary DB | PostgreSQL 16+ |
| Cache | Redis 7+ |
| Object Storage | AWS S3 / Cloudflare R2 |
| Search (future) | Elasticsearch / Meilisearch |

### 8.4. Infrastructure

| Component | Technology |
|-----------|-----------|
| Container | Docker |
| Orchestration | Docker Compose (dev) / Kubernetes (prod) |
| CI/CD | GitHub Actions |
| Hosting | Fly.io / Render / Vercel |
| CDN | Cloudflare |

### 8.5. Observability

| Component | Technology |
|-----------|-----------|
| Logging | Winston/Pino → Loki |
| Metrics | Prometheus + Grafana |
| Tracing | OpenTelemetry + Jaeger |
| Errors | Sentry |

---

## 9. Non‑Functional Requirements

### 9.1. Availability
- **Target**: 99.5% uptime (MVP), 99.9% (production)
- **Strategy**: Load balancing, health checks, auto‑restart

### 9.2. Reliability
- **Database**: Automated backups (daily), point‑in‑time recovery
- **Idempotency**: Order creation với idempotency keys
- **Retry Logic**: Exponential backoff cho external APIs

### 9.3. Maintainability
- **Code Quality**: ESLint, Prettier, Husky hooks
- **Documentation**: OpenAPI, JSDoc, Architecture Decision Records (ADR)
- **Testing**: Unit (>80%), Integration, E2E

### 9.4. Security
- **OWASP Top 10**: Mitigated
- **Secrets Management**: Environment variables, Vault (future)
- **Vulnerability Scanning**: Dependabot, Snyk

---

## 10. Future Enhancements

### 10.1. Phase 2 Features
- **Real‑time Updates**: WebSocket/SSE cho order status
- **Multi‑location**: Support chuỗi nhà hàng với nhiều địa điểm
- **Advanced Analytics**: Cohort analysis, heatmaps
- **Inventory Management**: Light inventory tracking

### 10.2. Technical Improvements
- **Microservices**: Tách modules thành services độc lập
- **Event‑Driven**: Message queue (RabbitMQ/Kafka) cho async tasks
- **GraphQL**: Thay thế REST cho flexible queries
- **Edge Computing**: Deploy logic gần user (Cloudflare Workers)

### 10.3. Integrations
- **POS Systems**: Tích hợp với POS phổ biến (Square, Toast)
- **Kitchen Printers**: In đơn tự động
- **Loyalty Programs**: Tích điểm, rewards
- **Third‑party Delivery**: Grab, Shopee Food

---

## 11. Quyết định Kiến trúc (ADR)

### ADR‑001: Monolithic Modular (MVP)
**Quyết định**: Bắt đầu với monolith có cấu trúc module rõ ràng.  
**Lý do**: Đơn giản triển khai, dễ debug, đủ cho MVP.  
**Trade‑off**: Khó scale độc lập từng module, nhưng có thể refactor sau.

### ADR‑002: PostgreSQL + RLS
**Quyết định**: Dùng PostgreSQL với Row‑Level Security cho multi‑tenant.  
**Lý do**: ACID, mature, RLS built‑in, cost‑effective.  
**Trade‑off**: Phức tạp hơn separate DBs, nhưng đủ cho SMB scale.

### ADR‑003: JWT cho Auth
**Quyết định**: JWT stateless cho staff/admin, token‑based cho customer.  
**Lý do**: Không cần session server, scale dễ dàng.  
**Trade‑off**: Không thể revoke JWT ngay lập tức (dùng short TTL + refresh token).

### ADR‑004: Redirect Payment (MVP)
**Quyết định**: Dùng Stripe Checkout redirect thay vì native integration.  
**Lý do**: Nhanh triển khai, Stripe handle PCI compliance.  
**Trade‑off**: UX không mượt bằng native, nhưng đủ cho MVP.

---

## 12. Tài liệu Tham khảo

### 12.1. Internal Docs
- [Product Readme](./readme.md)
- [User Stories](./doca/01-product/06-USER_STORIES.md) *(TBD)*
- [OpenAPI Specification](./doca/03-openapi.yaml) *(TBD)*

### 12.2. External Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [OpenTelemetry](https://opentelemetry.io/)

---

## 13. Ghi chú & Cập nhật

**Change Log**:
- **2025‑01‑11**: Phiên bản đầu tiên – kiến trúc tổng quan, modules, tech stack
- *(Future)*: Cập nhật khi có thay đổi lớn về kiến trúc

**Contributors**:
- *(TBD)*

**Review Cycle**: Quarterly hoặc khi có major feature/refactor

---

**END OF ARCHITECTURE DOCUMENT**

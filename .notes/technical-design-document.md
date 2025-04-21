## SimpleQueue Technical Specification (Revised)

## System Design

-   **Architecture Type**: Multi-tenant SaaS with isolated data per tenant
-   **Deployment Model**: Cloud-based with serverless components
-   **Scalability Approach**: Horizontal scaling with stateless API layer
-   **Service Boundaries**:
    -   Frontend UI Service (Dashboard)
    -   Queue Management API
    -   Publishing API
    -   Consumption API
    -   Analytics Processing
    -   Authentication Service

## Architecture Pattern

-   **Frontend**: Next.js Single-Page Application with React
    -   Server-side rendering for initial load
    -   Client-side navigation for responsiveness
    -   Incremental Static Regeneration for documentation pages
-   **Backend**: API-First Microservices
    -   REST APIs for management, publishing, and consumption
    -   Serverless functions for API implementation
    -   Event-driven internal architecture
-   **Data Layer**:
    -   Tinybird for message storage and real-time analytics
    -   Supabase for account management, queue metadata, and authentication
-   **Integration Pattern**:
    -   Webhook consumers (future)
    -   REST APIs for core functionality
    -   Real-time metrics via WebSockets/Server-Sent Events

## State Management

-   **Frontend State**:
    -   React Context for global UI state (authentication, preferences)
    -   React Query for server state and data fetching
    -   Local component state for UI-specific interactions
-   **Queue State**:
    -   Queue metadata stored in Supabase
    -   Active/paused state managed through flags
    -   Queue statistics computed from Tinybird aggregations
-   **Message State**:
    -   Messages stored in Tinybird append-only tables
    -   Message lifecycle tracked through state fields
    -   Consumption state maintained through acknowledgment records
-   **User Session State**:
    -   JWT-based authentication via Supabase Auth
    -   Role-based permissions stored in Supabase
    -   API key management through Supabase

## Data Flow

### Message Publishing Flow:

1.  Client authenticates with API key
2.  Client sends message(s) to Publishing API
3.  API validates message format and permissions
4.  Message is batched and inserted into Tinybird
5.  Confirmation is returned to client
6.  Asynchronous metrics update is triggered

### Message Consumption Flow:

1.  Consumer authenticates with API key
2.  Consumer requests messages from Consumption API
3.  API queries available messages from Tinybird
4.  Messages are marked as "in flight" with timestamp
5.  Messages are returned to consumer
6.  Consumer processes messages
7.  Consumer acknowledges (or rejects) messages
8.  API updates message state in Tinybird

### Dashboard Metrics Flow:

1.  User logs into dashboard
2.  Initial metrics loaded from Tinybird via REST
3.  Dashboard establishes WebSocket connection
4.  Real-time updates streamed for active metrics
5.  Time-series data loaded on demand as user interacts
6.  User actions trigger API calls to manage queues

## Technical Stack

### Frontend

-   **Framework**: Next.js 14+ with React 18+
-   **UI Components**: v0/Bolt/Lovable for rapid development
-   **State Management**: React Query + Context API
-   **Styling**: Tailwind CSS
-   **Charting**: Recharts for time-series visualizations
-   **API Client**: Axios with request interceptors
-   **TypeScript**: For type safety and developer experience

### Backend

-   **API Framework**: Supabase Edge Functions (Deno)
-   **Real-time Analytics**: Tinybird
-   **Authentication**: Supabase Auth
-   **Database**: Supabase PostgreSQL
-   **Message Storage**: Tinybird Data Sources
-   **Metrics Processing**: Tinybird SQL Pipes
-   **Rate Limiting**: Implemented at API Gateway level

### Development Tools

-   **CI/CD**: GitHub Actions
-   **Testing**: Jest, React Testing Library, Playwright
-   **Documentation**: OpenAPI Specification
-   **Monitoring**: Tinybird for internal metrics

## Authentication Process

1.  **Registration Flow**:
    -   User signs up via email/password or OAuth provider
    -   Supabase Auth creates user account
    -   Default organization created in Supabase DB
    -   Welcome email sent via Supabase
2.  **Login Flow**:
    -   User logs in via Supabase Auth
    -   JWT token issued with appropriate claims
    -   User permissions loaded from Supabase
    -   Session established with refresh token mechanism
3.  **API Authentication**:
    -   API keys generated and stored in Supabase
    -   Keys scoped to specific queues and permissions
    -   Key presented in Authorization header
    -   Rate limiting applied per API key
    -   Key validation cached for performance
4.  **Permission Model**:
    -   Organization-level roles (Admin, Member, Viewer)
    -   Queue-level permissions (Publish, Consume, Manage)
    -   API keys with fine-grained scope
    -   JWTs contain minimal claims for authorization

## Route Design

### Frontend Routes

-   `/` - Landing page
-   `/dashboard` - Main dashboard
-   `/queues` - List of all queues
-   `/queues/[id]` - Queue detail view
-   `/queues/[id]/messages` - Message explorer
-   `/queues/[id]/settings` - Queue configuration
-   `/queues/[id]/metrics` - Detailed queue analytics
-   `/settings` - Account settings
-   `/settings/api-keys` - API key management
-   `/docs` - API documentation
-   `/docs/quickstart` - Getting started guide

### API Routes

-   `/api/v1/queues` - Queue management
-   `/api/v1/queues/:id` - Queue operations
-   `/api/v1/queues/:id/pause` - Pause queue
-   `/api/v1/queues/:id/resume` - Resume queue
-   `/api/v1/queues/:id/messages` - Get messages
-   `/api/v1/queues/:id/publish` - Publish messages
-   `/api/v1/queues/:id/ack` - Acknowledge messages
-   `/api/v1/queues/:id/reject` - Reject messages
-   `/api/v1/queues/:id/metrics` - Queue metrics
-   `/api/v1/users` - User management
-   `/api/v1/api-keys` - API key management

## API Design

### Queue Management API

```
<div><pre><code id="code-lang-bash">GET /api/v1/queues
POST /api/v1/queues
GET /api/v1/queues/:id
DELETE /api/v1/queues/:id
PATCH /api/v1/queues/:id
POST /api/v1/queues/:id/pause
POST /api/v1/queues/:id/resume</code></pre></div>
```

### Message Publishing API

```
<div><pre><code id="code-lang-bash">POST /api/v1/queues/:id/publish</code></pre></div>
```

-   Request body: Single message or array of messages
-   Response: Message IDs and confirmation

### Message Consumption API

```
<div><pre><code id="code-lang-bash">GET /api/v1/queues/:id/messages?limit=10
POST /api/v1/queues/:id/ack
POST /api/v1/queues/:id/reject</code></pre></div>
```

### Metrics API

```
<div><pre><code id="code-lang-ruby">GET /api/v1/queues/:id/metrics
GET /api/v1/queues/:id/metrics/depth
GET /api/v1/queues/:id/metrics/throughput
GET /api/v1/queues/:id/metrics/age</code></pre></div>
```

### User Management API

```
<div><pre><code id="code-lang-bash">GET /api/v1/users
POST /api/v1/users
GET /api/v1/users/:id
PATCH /api/v1/users/:id
DELETE /api/v1/users/:id</code></pre></div>
```

### API Key Management

```
<div><pre><code id="code-lang-bash">GET /api/v1/api-keys
POST /api/v1/api-keys
DELETE /api/v1/api-keys/:id</code></pre></div>
```

## Database Design

### Supabase PostgreSQL Schema

**organizations**

-   `id` (uuid, PK)
-   `name` (text)
-   `created_at` (timestamp)
-   `updated_at` (timestamp)
-   `plan` (text)
-   `owner_id` (uuid, FK to auth.users)

**queues**

-   `id` (uuid, PK)
-   `name` (text)
-   `organization_id` (uuid, FK to organizations)
-   `created_at` (timestamp)
-   `updated_at` (timestamp)
-   `retention_days` (integer)
-   `status` (enum: 'active', 'paused')

**api\_keys**

-   `id` (uuid, PK)
-   `name` (text)
-   `key_hash` (text)
-   `organization_id` (uuid, FK to organizations)
-   `created_at` (timestamp)
-   `created_by` (uuid, FK to auth.users)
-   `expires_at` (timestamp, nullable)
-   `last_used_at` (timestamp, nullable)

**api\_key\_permissions**

-   `id` (uuid, PK)
-   `api_key_id` (uuid, FK to api\_keys)
-   `queue_id` (uuid, FK to queues, nullable)
-   `permission` (enum: 'publish', 'consume', 'manage')

**user\_organizations**

-   `id` (uuid, PK)
-   `user_id` (uuid, FK to auth.users)
-   `organization_id` (uuid, FK to organizations)
-   `role` (enum: 'admin', 'member', 'viewer')
-   `created_at` (timestamp)

### Tinybird Data Sources

**queue\_messages**

-   `message_id` (UUID)
-   `organization_id` (UUID)
-   `queue_id` (UUID)
-   `client_id` (String, Nullable)
-   `payload` (JSON)
-   `inserted_at` (DateTime)
-   `status` (String) - \['available', 'in\_flight', 'acknowledged', 'rejected'\]
-   `consumer_id` (String, Nullable)
-   `consumed_at` (DateTime, Nullable)
-   `acknowledged_at` (DateTime, Nullable)

**queue\_metrics**

-   `timestamp` (DateTime)
-   `organization_id` (UUID)
-   `queue_id` (UUID)
-   `published_count` (UInt32)
-   `consumed_count` (UInt32)
-   `acknowledged_count` (UInt32)
-   `rejected_count` (UInt32)
-   `current_depth` (UInt32)

### Tinybird Pipes for Analytics

**queue\_depth\_current**

```
<div><p>sql</p><div><pre><code id="code-lang-sql">SELECT 
  countIf(status = 'available' OR status = 'in_flight') AS current_depth,
  max(inserted_at) AS latest_message_time,
  now() AS query_time
FROM queue_messages
WHERE 
  organization_id = {{organization_id}}
  AND queue_id = {{queue_id}}</code></pre></div></div>
```

**queue\_throughput**

```
<div><p>sql</p><div><pre><code id="code-lang-sql">SELECT 
  toStartOfMinute(inserted_at) AS minute,
  count() AS published,
  countIf(status = 'acknowledged') AS acknowledged,
  countIf(status = 'rejected') AS rejected
FROM queue_messages
WHERE 
  organization_id = {{organization_id}}
  AND queue_id = {{queue_id}}
  AND inserted_at &gt;= now() - interval 24 hour
GROUP BY minute
ORDER BY minute</code></pre></div></div>
```

**queue\_age\_oldest**

```
<div><p>sql</p><div><pre><code id="code-lang-sql">SELECT 
  max(now() - inserted_at) AS oldest_message_age_seconds
FROM queue_messages
WHERE 
  organization_id = {{organization_id}}
  AND queue_id = {{queue_id}}
  AND status = 'available'</code></pre></div></div>
```

**organization\_queues\_overview**

```
<div><p>sql</p><div><pre><code id="code-lang-sql">SELECT
  queue_id,
  countIf(status = 'available' OR status = 'in_flight') AS current_depth,
  countIf(status = 'available' AND now() - inserted_at &gt; 3600) AS stale_messages,
  max(now() - inserted_at) AS oldest_message_age_seconds
FROM queue_messages
WHERE
  organization_id = {{organization_id}}
  AND inserted_at &gt;= now() - interval 7 day
GROUP BY queue_id</code></pre></div></div>
```

**message\_consumption**

```
<div><p>sql</p><div><pre><code id="code-lang-sql">SELECT
  message_id,
  payload,
  inserted_at
FROM queue_messages
WHERE
  organization_id = {{organization_id}}
  AND queue_id = {{queue_id}}
  AND status = 'available'
ORDER BY inserted_at
LIMIT {{limit:UInt16}}</code></pre></div></div>
```

**update\_message\_status**

```
<div><p>sql</p><div><pre><code id="code-lang-sql">-- This would be a materialized view that gets updated when messages are acknowledged
-- In practice, we would use Tinybird's Events API to update message status
-- This pipe demonstrates the query structure for documentation purposes
SELECT
  count() AS updated_count
FROM queue_messages
WHERE
  organization_id = {{organization_id}}
  AND queue_id = {{queue_id}}
  AND message_id IN ({{message_ids:Array(UUID)}})
  AND status = 'in_flight'</code></pre></div></div>
```

This revised technical specification implements multi-tenant tables in Tinybird with organization\_id and queue\_id as columns rather than creating separate tables per organization/queue. The Tinybird pipes have been updated to use these IDs as parameters, allowing for better resource sharing, simplified management, and more efficient querying across the system.
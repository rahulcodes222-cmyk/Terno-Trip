# Terno Trip Planner

A full-stack travel booking platform built with **Next.js 14**, **Node.js/Express microservices**, **MongoDB**, and **TypeScript**.

---

## Architecture

```
terno_trip/
├── apps/
│   └── web/                    # Next.js 14 frontend (port 3000)
├── services/
│   ├── api-gateway/            # Public entry point (port 4000)
│   ├── auth-service/           # Auth & JWT (port 4001)
│   ├── user-service/           # User profiles (port 4002)
│   ├── trip-service/           # Trip catalogue + seeding (port 4003)
│   ├── booking-service/        # Booking lifecycle (port 4004)
│   ├── payment-service/        # Mock payment provider (port 4005)
│   └── notification-service/   # In-app notifications (port 4006)
├── packages/
│   └── shared/                 # Shared TypeScript types & schemas
└── services/shared-events/     # In-memory event bus
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- A MongoDB connection URL (Atlas or local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in each service and fill in your MongoDB URI:

```bash
# Do this for each service:
copy services\api-gateway\.env.example    services\api-gateway\.env
copy services\auth-service\.env.example   services\auth-service\.env
copy services\user-service\.env.example   services\user-service\.env
copy services\trip-service\.env.example   services\trip-service\.env
copy services\booking-service\.env.example  services\booking-service\.env
copy services\payment-service\.env.example  services\payment-service\.env
copy services\notification-service\.env.example services\notification-service\.env
copy apps\web\.env.local.example apps\web\.env.local
```

Edit each `.env` file and set your `MONGODB_URI`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

Generate strong secrets for JWT and internal service communication:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Build shared packages

```bash
npm run build --workspace=packages/shared
npm run build --workspace=services/shared-events
```

### 4. Start all services

```bash
npm run dev
```

Or start services individually:

| Service | Command | Port |
|---|---|---|
| API Gateway | `npm run dev -w services/api-gateway` | 4000 |
| Auth Service | `npm run dev -w services/auth-service` | 4001 |
| User Service | `npm run dev -w services/user-service` | 4002 |
| Trip Service | `npm run dev -w services/trip-service` | 4003 |
| Booking Service | `npm run dev -w services/booking-service` | 4004 |
| Payment Service | `npm run dev -w services/payment-service` | 4005 |
| Notification Service | `npm run dev -w services/notification-service` | 4006 |
| Frontend | `npm run dev -w apps/web` | 3000 |

### 5. Verify services

```
GET http://localhost:4000/health   → API Gateway
GET http://localhost:4001/health   → Auth
GET http://localhost:4003/health   → Trip (includes auto-seeded trips)
```

### 6. Open the app

```
http://localhost:3000
```

---

## Environment Variables Reference

| Variable | Services | Description |
|---|---|---|
| `MONGODB_URI` | All (except gateway) | MongoDB connection string |
| `JWT_ACCESS_SECRET` | auth-service, api-gateway | Sign access tokens (15min) |
| `JWT_REFRESH_SECRET` | auth-service | Sign refresh tokens (7d) |
| `INTERNAL_SERVICE_SECRET` | All | Authenticates inter-service HTTP calls |
| `FRONTEND_URL` | api-gateway, trip-service | CORS allowed origin |
| `NODE_ENV` | All | `development` or `production` |
| `PORT` | All | Service listening port |

---

## Mock Payment Scenarios

The payment service includes a mock provider for development. Select a scenario in the payment modal:

| Scenario | Result |
|---|---|
| `success` | Payment completes, booking confirmed |
| `failure` | Payment fails, booking stays Pending |
| `pending` | Payment left pending, check My Bookings |
| `timeout` | Gateway timeout simulation |

> ⚠️ Mock provider is **disabled in production** (`NODE_ENV=production`). To integrate a real gateway (Razorpay, Stripe), implement `IPaymentProvider` in `services/payment-service/src/providers/` and set `PAYMENT_PROVIDER=razorpay` in `.env`.

---

## User Journey

1. **Home** → Browse featured trips & categories
2. **Explore** → Search, filter, sort trips
3. **Trip Detail** → View itinerary, inclusions, book
4. **Register/Login** → Booking intent is preserved across auth redirect
5. **Checkout** → Enter traveller details, see server-calculated price
6. **Payment** → Mock payment with scenario selection
7. **Confirmation** → Booking reference generated
8. **My Bookings** → View history, cancel, see details
9. **Notifications** → In-app status updates
10. **Profile** → Update personal information

---

## Database Structure

Each service uses its own MongoDB logical database:

| Service | Database |
|---|---|
| auth-service | `terno_auth` |
| user-service | `terno_users` |
| trip-service | `terno_trips` |
| booking-service | `terno_bookings` |
| payment-service | `terno_payments` |
| notification-service | `terno_notifications` |

---

## Notes

- **Trip seeding** runs automatically on trip-service startup if the collection is empty — 12 Indian destination trips.
- **Event bus** is in-memory (EventEmitter). Cross-service events use direct HTTP POST. Replace with RabbitMQ/Redis Streams for production durability.
- **Prices** are always calculated server-side. Frontend price display is for UX only.
- **JWT** uses HTTP-only cookies (`access_token`, `refresh_token`). The API Gateway verifies tokens and injects `x-user-id` / `x-user-role` headers downstream.

---

## API Documentation

Once the API Gateway is running, open:

| URL | Description |
|---|---|
| `http://localhost:4000/api-docs` | Swagger UI — interactive API explorer |
| `http://localhost:4000/api-docs.json` | Raw OpenAPI 3.0 JSON spec |

The spec covers all 25+ endpoints across Auth, Trips, Users, Bookings, Payments, Notifications, and Admin sections. Authentication uses the `access_token` HTTP-only cookie (set automatically on login/register).

---

## Running Tests

Tests use **Vitest** with mocked Mongoose models — no database connection required.

Run a single service:
```powershell
npm run test --workspace=services/auth-service
npm run test --workspace=services/trip-service
npm run test --workspace=services/booking-service
npm run test --workspace=services/payment-service
```

Run all at once:
```powershell
npm run test --workspaces --if-present
```

Watch mode (reruns on file changes):
```powershell
npm run test:watch --workspace=services/auth-service
```

---

## Docker Deployment

### Prerequisites
- Docker Desktop installed and running

### Full stack with Docker Compose

```powershell
# 1. Copy and fill .env files for every service (see Quick Start above)

# 2. Build and start everything
docker-compose up --build -d

# 3. Check all containers are healthy
docker-compose ps

# 4. Open the app
# http://localhost:3000
```

### Start only MongoDB locally (use npm run dev for services)

```powershell
docker-compose up -d mongodb
npm run dev
```

### Stop everything

```powershell
docker-compose down
```

### Stop and remove volumes (wipes database)

```powershell
docker-compose down -v
```

---

## Security Features

| Feature | Implementation |
|---|---|
| Security headers | `helmet()` on all 7 backend services |
| Password hashing | bcryptjs, 12 salt rounds |
| JWT cookies | `httpOnly: true`, `secure: true` (production), `sameSite: strict` |
| Payload limit | `10kb` max on all services |
| Rate limiting | 200 requests / 15 min per IP (API Gateway) |
| CORS | Restricted to `FRONTEND_URL` env var |
| Input validation | Zod schemas on every request body |
| Audit logging | Immutable `AuditEvent` collection in auth-service |
| Role-based access | Admin routes protected by `adminAuth` middleware in trip-service |
| Error responses | Sanitized — no stack traces in production |
| Token rotation | Refresh token rotated on every use; reuse detected and all tokens cleared |

---

## Admin Access

Admin endpoints allow managing trips, pricing, availability, and content:

```
POST   /api/v1/admin/trips                      Create a new trip
PUT    /api/v1/admin/trips/:id                  Update a trip
DELETE /api/v1/admin/trips/:id                  Soft-delete a trip (isActive = false)
PATCH  /api/v1/admin/trips/:id/availability     Update available seats
```

To promote a user to admin, run this in **mongosh** or MongoDB Atlas:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Admin routes require authentication. The API Gateway passes `x-user-role` to the trip-service, which checks it with the `adminAuth` middleware.

---

## Password Change

Authenticated users can change their password from the **Profile → Security** page, or via API:

```
PATCH /api/v1/auth/change-password
Body: { currentPassword, newPassword }
```

On success:
- Password is updated with a fresh bcrypt hash
- All existing refresh tokens are cleared (forces re-login on all devices)
- An audit event is recorded

---

## Seeded Trip Destinations

The trip-service seeds 12 sample trips automatically on first startup:

| # | Trip | Category | Price |
|---|---|---|---|
| 1 | Manali Adventure Trek | Adventure | ₹8,999 |
| 2 | Goa Beach Getaway | Beach | ₹6,499 |
| 3 | Rajasthan Royal Heritage | Cultural | ₹12,999 |
| 4 | Kerala Backwaters Escape | Budget | ₹7,499 |
| 5 | Ladakh Bike Expedition | Adventure | ₹18,999 |
| 6 | Andaman Island Retreat | Beach | ₹15,499 |
| 7 | Coorg Coffee Country | Mountain | ₹5,999 |
| 8 | Varanasi Spiritual Journey | Cultural | ₹4,999 |
| 9 | Jim Corbett Wildlife Safari | Wildlife | ₹9,999 |
| 10 | Meghalaya Living Roots | Adventure | ₹11,499 |
| 11 | Rishikesh Yoga & Rafting | Adventure | ₹5,499 |
| 12 | Spiti Valley Expedition | Mountain | ₹16,999 |

> ⚠️ Sample data only — availability, accommodation, and schedules shown are illustrative and not live inventory.

---

## Folder Structure

```
terno_trip/
├── apps/
│   └── web/                         # Next.js 14 App Router (port 3000)
│       ├── src/app/                 # Pages: home, trips, checkout, bookings, profile…
│       ├── src/components/          # UI, layout, trip, booking, checkout components
│       ├── src/contexts/            # AuthContext
│       ├── src/hooks/               # useTrips, useBookings, usePayment, useNotifications
│       ├── src/lib/                 # api-client, query-client, session-storage, utils
│       └── src/types/               # TypeScript interfaces
├── services/
│   ├── api-gateway/                 # JWT verify + proxy (port 4000)
│   ├── auth-service/                # Register/Login/JWT/AuditEvent (port 4001)
│   ├── user-service/                # Profile & preferences (port 4002)
│   ├── trip-service/                # Catalogue + seed + admin (port 4003)
│   ├── booking-service/             # Booking lifecycle (port 4004)
│   ├── payment-service/             # Mock payment provider (port 4005)
│   ├── notification-service/        # In-app notifications (port 4006)
│   └── shared-events/               # In-memory EventEmitter bus
├── packages/
│   └── shared/                      # @terno/shared — types, schemas, utils
├── docker-compose.yml               # Full stack orchestration
├── .env.example                     # Root env template
└── tsconfig.json                    # Base TypeScript config
```

---

## Definition of Done

- [x] Next.js frontend connected to API Gateway
- [x] All microservices run independently
- [x] MongoDB persists users, trips, bookings, payments, notifications
- [x] Auth, validation, and error handling work end-to-end
- [x] Guests browse trips; authenticated users complete the full booking flow
- [x] Mock payment demonstrates success, failure, pending, and timeout
- [x] Only verified payment success produces a confirmed booking
- [x] Duplicate requests cannot create duplicate bookings or charges
- [x] Users can view trips, itineraries, notifications, and profile
- [x] Password change invalidates all other sessions
- [x] Admin endpoints protected by role check
- [x] Security headers, cookie hardening, payload limits applied
- [x] Audit log records all critical auth events
- [x] Swagger UI documents all endpoints
- [x] Vitest unit tests for auth, trips, bookings, payments
- [x] Dockerfiles and docker-compose for full-stack deployment
- [x] README explains MongoDB setup and all startup commands

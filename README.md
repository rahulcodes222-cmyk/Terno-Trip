# Terno Trip Planner

A production-oriented travel booking platform built with Next.js 14, Node.js, Express, MongoDB, and a microservices architecture.

---

## Port Map

| Service | Port |
|---|---|
| Web (Next.js) | 3000 |
| API Gateway | 4000 |
| Auth Service | 4001 |
| User Service | 4002 |
| Trip Service | 4003 |
| Booking Service | 4004 |
| Payment Service | 4005 |
| Notification Service | 4006 |
| MongoDB (Docker) | 27017 |

---

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **npm 10+** — comes with Node 20
- **MongoDB URI** — a connection string from MongoDB Atlas or a local MongoDB instance  
  (if using Docker: `docker-compose up -d mongodb` will start a local instance)

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd terno_trip
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```
MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/terno_trip
JWT_ACCESS_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run the same command again for a different value>
INTERNAL_SERVICE_SECRET=<same again>
```

All other values default correctly for local development.

### 3. Start all services

```bash
npm run dev
```

This starts all 7 microservices and the Next.js frontend concurrently.  
Each service will print its startup logs with a colour-coded prefix.

### 4. Verify

- Frontend: http://localhost:3000  
- API Gateway health: http://localhost:4000/health  
- Auth Service health: http://localhost:4001/health  
- Trip Service health: http://localhost:4003/health

---

## Project Structure

```
terno_trip/
├── apps/
│   └── web/                    # Next.js 14 App Router frontend
├── services/
│   ├── api-gateway/            # Public entry point, JWT validation, routing (port 4000)
│   ├── auth-service/           # Registration, login, logout, sessions (port 4001)
│   ├── user-service/           # Profiles, preferences (port 4002)
│   ├── trip-service/           # Trip catalogue, availability, pricing (port 4003)
│   ├── booking-service/        # Booking lifecycle, references (port 4004)
│   ├── payment-service/        # Payment orders, mock provider (port 4005)
│   ├── notification-service/   # In-app notifications (port 4006)
│   └── shared-events/          # In-memory event bus (@terno/shared-events)
├── packages/
│   └── shared/                 # Shared TypeScript types, Zod schemas, utils (@terno/shared)
├── .env.example                # Environment variable template
├── docker-compose.yml          # MongoDB container (services run locally via npm run dev)
├── package.json                # npm workspaces root
└── tsconfig.json               # Base TypeScript config extended by all packages
```

---

## Service Descriptions

### API Gateway (4000)
The single public entry point. Validates JWT access tokens, injects `x-user-id` and `x-user-role` headers, then proxies requests to the appropriate downstream service. All frontend requests go through here.

### Auth Service (4001)
Handles user registration, login, logout, and token refresh. Issues JWT access tokens (15 min) and refresh tokens (7 days) as HTTP-only cookies. Never exposes tokens in response bodies.

### User Service (4002)
Manages user profiles, avatars, and preferences. Accepts only pre-authenticated requests (from the API Gateway with `x-user-id`).

### Trip Service (4003)
Owns the trip catalogue. Supports full-text search, filtering by category/price/duration, sorting, and pagination. The authoritative source for trip pricing and available seats.

### Booking Service (4004)
Manages the booking lifecycle: `Pending → Confirmed → Cancelled/Refunded`. Generates human-readable booking references (TERNO-XXXXXX). Never trusts frontend-submitted prices — re-fetches from the Trip Service.

### Payment Service (4005)
Abstracts payment providers behind a clean interface. Ships with a **mock payment provider** supporting simulated success, failure, pending, and timeout scenarios. Replace the mock adapter with Razorpay/Stripe without changing any other service.

### Notification Service (4006)
Stores and serves in-app notifications. Subscribes to domain events (BOOKING_CREATED, PAYMENT_SUCCEEDED, etc.) via the event bus and creates user-facing notifications automatically.

### @terno/shared-events
An in-memory EventEmitter singleton that decouples event publishers from subscribers within a single process. **Not durable** — replace with a message broker (RabbitMQ, AWS SQS, Redis Streams) for production multi-process deployments.

---

## Mock Payment Provider

During development, the payment service uses a mock provider. To test different scenarios, pass a `scenario` field when initiating payment:

| Scenario | Result |
|---|---|
| `success` (default) | Payment succeeds immediately |
| `failure` | Payment fails with a provider error |
| `pending` | Payment stays in pending state (simulates delayed confirmation) |
| `timeout` | Request times out after 5 seconds |

---

## Building for Production

```bash
npm run build
```

Each service compiles its TypeScript to `dist/`. Deploy each `dist/` directory as a Node.js process, or build Docker images using the Dockerfiles in each service directory.

---

## Environment Variables Reference

See [.env.example](.env.example) for the full list with descriptions.

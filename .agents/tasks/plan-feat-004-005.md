# Implementation Plan — FEAT-004 (API Gateway) + FEAT-005 (Next.js Frontend)

> Canonical FEAT specs live in `.agents/tasks/terno-trip-planner/features/FEAT-004.json`
> and `FEAT-005.json`. This file is the human-readable summary consumed by the workflow.

---

## Baseline facts (read from code — do not re-derive)

- All backend services follow: `src/index.ts` (dotenv + listen) → `src/app.ts` (Express setup) → `src/routes/` → `src/controllers/` → `src/services/`.
- tsconfig pattern: `extends: "../../tsconfig.json"`, `paths: {}` to clear root aliases, `outDir: ./dist`, `rootDir: ./src`. **Critical — omitting `paths: {}` causes TypeScript to resolve `@terno/shared` to the source `.ts` files via the root alias, which breaks in production where the dist output is used.**
- All services: `"type": "module"` in package.json, ESM imports with `.js` extensions, `tsx watch` for dev.
- JWT payload shape (from `auth-service/src/utils/jwt.ts`): `{ sub: string, role: string, type: 'access' }`. Gateway reads `sub` → `id`, `role` → `role`.
- Downstream services read `x-user-id` and `x-user-role` headers (not cookies) — see `trip-service/src/middleware/extractUser.ts`.
- Internal HTTP calls use `x-internal-secret` header — see `booking-service/src/services/booking.service.ts`.
- Cross-process events use direct HTTP POST (NOT EventEmitter) — see FEAT-003 findings.
- Root `package.json` already has `concurrently` and a `dev` script covering all services including `api-gateway` and `apps/web`.

---

## FEAT-004: API Gateway — `services/api-gateway/`

### Design decisions
- No database. No Mongoose. Pure proxy + JWT verification.
- `http-proxy-middleware` v3 is ESM — use named import `{ createProxyMiddleware }`. The `on.proxyReq` callback is the v3 API (not `onProxyReq`).
- `express-rate-limit` for in-memory rate limiting. Documented as needing Redis for multi-instance prod.
- `crypto.randomUUID()` for correlation IDs — built-in Node 16+, no extra dependency.
- Gateway verifies JWT itself (no call to auth-service) using `JWT_ACCESS_SECRET`. This is the established pattern described in the spec.
- `optionalAuthenticate` is needed for `/api/v1/trips/*` — unauthenticated users must be able to browse.

### Gotchas
1. **http-proxy-middleware v3 ESM import**: must be `import { createProxyMiddleware } from 'http-proxy-middleware'`. Using `import hpm from ...` then `hpm.createProxyMiddleware` fails.
2. **proxyReq handler signature in v3**: callback is `(proxyReq, req, res) => void` — `res` type is `http.ServerResponse`, not Express `Response`. Use `any` cast for `req` to access `req.user` and `req.correlationId`.
3. **TypeScript `req.correlationId`**: Extend `Express.Request` with `correlationId?: string` in `correlationId.ts` middleware via module augmentation.
4. **moduleResolution Node16**: import paths inside the service must use `.js` extensions even for `.ts` source files.
5. **No `dotenv` in app.ts**: call `dotenv.config()` at the very top of `src/index.ts` **before** importing env — same pattern as auth-service.

### Files to create

```
services/api-gateway/
├── package.json
├── tsconfig.json
├── .env.example
├── .env                          (copy of .env.example, safe defaults)
└── src/
    ├── config/
    │   └── env.ts
    ├── middleware/
    │   ├── authenticate.ts       (authenticate + optionalAuthenticate)
    │   ├── correlationId.ts      (UUID via crypto.randomUUID, module augmentation)
    │   ├── rateLimiter.ts        (express-rate-limit)
    │   └── errorHandler.ts
    ├── proxy/
    │   └── createProxy.ts        (createServiceProxy factory)
    ├── routes/
    │   └── index.ts              (route table with comment block)
    ├── app.ts
    └── index.ts
```

### Ordered steps

- [ ] 1. Create `services/api-gateway/package.json` — name `@terno/api-gateway`, type `module`, scripts dev/build/start matching other services. Dependencies as specified.
      Files: `services/api-gateway/package.json`
      Verify: `cd services/api-gateway && npm install` (or from root `npm install`)

- [ ] 2. Create `services/api-gateway/tsconfig.json` — extends root, `paths: {}`, `outDir: ./dist`, `rootDir: ./src`, no `moduleResolution` override needed (inherits Node16 from root).
      Files: `services/api-gateway/tsconfig.json`
      Verify: `cd services/api-gateway && npx tsc --noEmit` passes after all source files are created.

- [ ] 3. Create `services/api-gateway/.env.example` and `services/api-gateway/.env` with safe defaults. PORT=4000, JWT secrets as placeholder strings, service URLs pointing to localhost ports.
      Files: `services/api-gateway/.env.example`, `services/api-gateway/.env`

- [ ] 4. Create `services/api-gateway/src/config/env.ts` — Zod schema validating all 11 env vars. Export `env` object. Follow `auth-service/src/config/env.ts` exactly.
      Files: `services/api-gateway/src/config/env.ts`

- [ ] 5. Create `services/api-gateway/src/middleware/correlationId.ts` — module augment `Express.Request` with `correlationId?: string`, generate UUID via `crypto.randomUUID()`, set on `req.correlationId` and response header `x-correlation-id`.
      Files: `services/api-gateway/src/middleware/correlationId.ts`

- [ ] 6. Create `services/api-gateway/src/middleware/authenticate.ts` — `authenticate` (rejects 401 if no valid token) and `optionalAuthenticate` (attaches user if valid, continues without if missing/invalid). Reads `access_token` cookie first, then `Authorization: Bearer` header. Verifies with `jwt.verify(token, env.JWT_ACCESS_SECRET)`. Extracts `payload.sub` as `id` and `payload.role`. Module-augments `Express.Request` with `user?: { id: string; role: string }`.
      Files: `services/api-gateway/src/middleware/authenticate.ts`

- [ ] 7. Create `services/api-gateway/src/middleware/rateLimiter.ts` — `express-rate-limit` with `windowMs: 15 * 60 * 1000`, `max: 200`, `standardHeaders: true`, `legacyHeaders: false`.
      Files: `services/api-gateway/src/middleware/rateLimiter.ts`

- [ ] 8. Create `services/api-gateway/src/middleware/errorHandler.ts` — same pattern as `auth-service`. Handles ECONNREFUSED → 503 SERVICE_UNAVAILABLE. Generic → 500.
      Files: `services/api-gateway/src/middleware/errorHandler.ts`

- [ ] 9. Create `services/api-gateway/src/proxy/createProxy.ts` — `createServiceProxy(targetUrl: string)` using named import `createProxyMiddleware`. In `on.proxyReq`: set `x-user-id`, `x-user-role`, `x-internal-secret`, `x-correlation-id` from `req` (cast as `any`). In `on.error`: return 503 JSON. Set `changeOrigin: true`.
      Files: `services/api-gateway/src/proxy/createProxy.ts`

- [ ] 10. Create `services/api-gateway/src/routes/index.ts` — route table comment block + all 6 proxy mounts:
      - `/api/v1/auth/*` → no auth middleware (auth-service owns its own auth)
      - `/api/v1/users/*` → `authenticate` required
      - `/api/v1/trips/*` → `optionalAuthenticate`
      - `/api/v1/bookings/*` → `authenticate` required
      - `/api/v1/payments/*` → `authenticate` required
      - `/api/v1/notifications/*` → `authenticate` required
      Files: `services/api-gateway/src/routes/index.ts`

- [ ] 11. Create `services/api-gateway/src/app.ts` — cors (origin: `env.FRONTEND_URL`, credentials: true), cookie-parser, express.json(), morgan, correlationId, rateLimiter, routes, GET /health (includes upstreamServices object), errorHandler.
      Files: `services/api-gateway/src/app.ts`

- [ ] 12. Create `services/api-gateway/src/index.ts` — `dotenv.config()` first, then `env` import, then `app.listen(env.PORT)` with startup log listing all upstream service URLs.
      Files: `services/api-gateway/src/index.ts`

- [ ] 13. Build verification.
      Verify: `cd services/api-gateway && npm run build` — exits 0, `dist/` produced.

---

## FEAT-005: Next.js Frontend — `apps/web/`

### Design decisions
- Next.js 14 App Router. All pages under `src/app/`. Components under `src/components/`.
- TanStack Query v5 for all server state — note v5 API differs from v4: `useQuery` takes object with `queryKey`/`queryFn`, `useMutation` has `mutationFn` key.
- `withCredentials: true` on axios so cookies are sent cross-origin to the gateway.
- `next.config.js` must be **CommonJS** (`module.exports = ...`), NOT ESM. This is a Next.js constraint — it runs before the TS/ESM compilation.
- Auth context uses TanStack Query internally but also provides imperative `login`/`logout`/`register` methods (returning Promises) so form components don't need to use `useMutation`.
- Protected pages use a `ProtectedRoute` client component wrapper — Next.js App Router does not support server-side redirect based on cookie parsing in client components, so the protection is client-side.
- Booking intent persisted in `sessionStorage` (not `localStorage`) so it clears on tab close.
- `src/lib/session-storage.ts` wraps all `sessionStorage` calls in try/catch for SSR safety.

### Gotchas
1. **`next.config.js` must be CJS**: `module.exports = nextConfig`, not `export default nextConfig`.
2. **TanStack Query v5 breaking changes**: `useQuery({ queryKey: [...], queryFn: ... })` — no positional overloads. `useMutation({ mutationFn: ... })`.
3. **`'use client'` placement**: AuthContext, all hooks using browser APIs, Navbar, all interactive components must have `'use client'` as the first line.
4. **`sessionStorage` in SSR**: Always guard with `typeof window !== 'undefined'` check.
5. **axios 401 intercept loop**: The response interceptor must check if the original URL is `/auth/refresh` to avoid infinite retry loop.
6. **Next.js Image component**: Remote patterns for `picsum.photos` must be declared in `next.config.js` under `images.remotePatterns`.
7. **`src/app/error.tsx`**: Must be a client component (`'use client'`), must accept `{ error, reset }` props — Next.js App Router contract.
8. **TanStack Query v5 `useQuery` with nullable key**: Use `enabled: !!slug` to skip queries when params are undefined.
9. **Inter font**: Use `next/font/google` in `layout.tsx`, apply via `className` on `<body>` — not via CSS import.
10. **TypeScript strict + `useState` type inference**: Provide explicit generics where needed (e.g. `useState<ITrip | null>(null)`).

### Files to create

```
apps/web/
├── package.json
├── tsconfig.json
├── next.config.js              (CJS, module.exports)
├── tailwind.config.ts
├── postcss.config.js
├── .env.local.example
└── src/
    ├── app/
    │   ├── layout.tsx           (root layout, Inter font, Providers)
    │   ├── page.tsx             (Home)
    │   ├── providers.tsx        ('use client', QueryClientProvider + AuthProvider)
    │   ├── globals.css          (Tailwind directives + base styles)
    │   ├── loading.tsx          (full-page spinner)
    │   ├── error.tsx            ('use client', error boundary)
    │   ├── not-found.tsx        (404 page)
    │   ├── trips/
    │   │   ├── page.tsx         (Explore — client, URL state sync)
    │   │   └── [slug]/
    │   │       └── page.tsx     (Trip detail — booking sidebar)
    │   ├── auth/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── checkout/
    │   │   └── page.tsx         (protected)
    │   ├── bookings/
    │   │   ├── page.tsx         (My Bookings — protected)
    │   │   └── [ref]/page.tsx   (Booking detail — protected)
    │   ├── profile/
    │   │   └── page.tsx         (protected)
    │   └── notifications/
    │       └── page.tsx         (protected)
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Badge.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── ErrorMessage.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── Pagination.tsx
    │   │   ├── Modal.tsx
    │   │   └── PriceDisplay.tsx
    │   ├── trips/
    │   │   ├── TripCard.tsx
    │   │   ├── TripGrid.tsx
    │   │   ├── TripFilters.tsx
    │   │   ├── TripImageGallery.tsx
    │   │   ├── ItineraryAccordion.tsx
    │   │   └── InclusionsExclusions.tsx
    │   ├── checkout/
    │   │   └── PaymentModal.tsx
    │   └── auth/
    │       └── ProtectedRoute.tsx
    ├── contexts/
    │   └── AuthContext.tsx
    ├── hooks/
    │   ├── useTrips.ts
    │   ├── useBookings.ts
    │   ├── usePayment.ts
    │   └── useNotifications.ts
    ├── lib/
    │   ├── api-client.ts        (axios instance, 401 intercept)
    │   ├── query-client.ts      (TanStack QueryClient singleton)
    │   ├── utils.ts             (cn, formatCurrency, formatDate, etc.)
    │   └── session-storage.ts   (booking intent helpers)
    └── types/
        └── index.ts             (IUser, ITrip, IBooking, INotification, ApiResponse, PaginatedResponse)
```

### Ordered steps

**Setup (steps 1–6)**

- [ ] 1. Create `apps/web/package.json` with exact versions from spec.
      Files: `apps/web/package.json`
      Verify: `cd apps/web && npm install` completes without peer dep errors.

- [ ] 2. Create config files: `apps/web/tsconfig.json`, `apps/web/next.config.js` (CJS `module.exports`), `apps/web/tailwind.config.ts`, `apps/web/postcss.config.js`, `apps/web/.env.local.example`.
      Files: `apps/web/tsconfig.json`, `apps/web/next.config.js`, `apps/web/tailwind.config.ts`, `apps/web/postcss.config.js`, `apps/web/.env.local.example`
      Verify: `cd apps/web && npx next build` — no config parse errors.

**Foundation (steps 3–9)**

- [ ] 3. Create `src/types/index.ts` — interfaces: `IUser`, `ITrip` (with itinerary, inclusions, exclusions, startDates, highlights, etc.), `IBooking` (with travellers, tripSnapshot, etc.), `INotification`, `ApiResponse<T>`, `PaginatedResponse<T>`. No Zod, no imports from `@terno/shared`.
      Files: `apps/web/src/types/index.ts`

- [ ] 4. Create `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatCurrency(amount)` (Intl Indian rupees ₹), `formatDate(date, format?)`, `truncateText(text, maxLength)`, `getStatusColor(status)`.
      Files: `apps/web/src/lib/utils.ts`

- [ ] 5. Create `src/lib/session-storage.ts` — `saveBookingIntent`, `getBookingIntent`, `clearBookingIntent`. All calls wrapped in `typeof window !== 'undefined'` guard.
      Files: `apps/web/src/lib/session-storage.ts`

- [ ] 6. Create `src/lib/api-client.ts` — axios instance `baseURL: process.env.NEXT_PUBLIC_API_URL`, `withCredentials: true`. Response interceptor: on 401 and URL does NOT include `/auth/refresh`, attempt POST `/api/v1/auth/refresh`, on success retry, on failure `window.location.href = '/auth/login'`.
      Files: `apps/web/src/lib/api-client.ts`

- [ ] 7. Create `src/lib/query-client.ts` — `new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 }, mutations: { retry: 0 } } })`. Export singleton.
      Files: `apps/web/src/lib/query-client.ts`

**Auth (steps 8–9)**

- [ ] 8. Create `src/contexts/AuthContext.tsx` — `'use client'`. `useQuery` with key `['auth', 'me']` calling `GET /api/v1/auth/me`, `retry: false`, returns `null` on 401. `login` mutation calls `POST /api/v1/auth/login`. `register` mutation calls `POST /api/v1/auth/register`. `logout` calls `POST /api/v1/auth/logout` then invalidates `['auth', 'me']`. Exports `AuthProvider` and `useAuth`.
      Files: `apps/web/src/contexts/AuthContext.tsx`

- [ ] 9. Create all four hooks: `src/hooks/useTrips.ts`, `src/hooks/useBookings.ts`, `src/hooks/usePayment.ts`, `src/hooks/useNotifications.ts`. All use `apiClient` from `src/lib/api-client.ts`. `useUnreadCount` polls every 30s via `refetchInterval: 30_000`.
      Files: `apps/web/src/hooks/useTrips.ts`, `useBookings.ts`, `usePayment.ts`, `useNotifications.ts`

**App shell (steps 10–12)**

- [ ] 10. Create `src/app/globals.css` (Tailwind directives + base body styles), `src/app/providers.tsx` (`'use client'`, QueryClientProvider + AuthProvider + ReactQueryDevtools), `src/app/layout.tsx` (Inter font via `next/font/google`, wraps in `<Providers>`).
      Files: `apps/web/src/app/globals.css`, `apps/web/src/app/providers.tsx`, `apps/web/src/app/layout.tsx`

- [ ] 11. Create layout components: `src/components/layout/Navbar.tsx` (responsive, auth-aware, notification bell), `src/components/layout/Footer.tsx`.
      Files: `apps/web/src/components/layout/Navbar.tsx`, `Footer.tsx`

- [ ] 12. Create all UI primitives: Button, Input, Badge, LoadingSpinner, ErrorMessage, EmptyState, Pagination, Modal, PriceDisplay.
      Files: `apps/web/src/components/ui/*.tsx` (9 files)
      Verify: `cd apps/web && npx tsc --noEmit` — no type errors on these files.

**Trip components (steps 13–15)**

- [ ] 13. Create trip display components: TripCard, TripGrid (with loading skeleton), TripFilters (search + category + price + duration + sort), TripImageGallery, ItineraryAccordion, InclusionsExclusions.
      Files: `apps/web/src/components/trips/*.tsx` (6 files)

- [ ] 14. Create auth components: `src/components/auth/ProtectedRoute.tsx` — `'use client'`, shows spinner while `isLoading`, redirects to `/auth/login?returnUrl=<current>` if not authenticated using `useRouter`.
      Files: `apps/web/src/components/auth/ProtectedRoute.tsx`

- [ ] 15. Create checkout component: `src/components/checkout/PaymentModal.tsx` — Modal wrapping order summary, mock payment notice banner, scenario selector (dev only), pay button, success/failure screens.
      Files: `apps/web/src/components/checkout/PaymentModal.tsx`

**Pages (steps 16–25)**

- [ ] 16. Create `src/app/page.tsx` (Home) — Hero section with `next/image` and picsum URL, `useFeaturedTrips`, categories grid with Lucide icons, `useTrendingTrips`, Why Terno section, CTA banner. Export `metadata`.
      Files: `apps/web/src/app/page.tsx`

- [ ] 17. Create `src/app/trips/page.tsx` (Explore) — `'use client'`, `useSearchParams`/`useRouter` for URL state, TripFilters + TripGrid + Pagination.
      Files: `apps/web/src/app/trips/page.tsx`

- [ ] 18. Create `src/app/trips/[slug]/page.tsx` (Trip Detail) — `'use client'` (needs booking interaction). `useTrip(slug)`. TripImageGallery, trip header, sticky booking sidebar on desktop / bottom bar on mobile. Departure date selector from `trip.startDates`. Travellers stepper. 'Book Now' → session storage intent + redirect or checkout redirect.
      Files: `apps/web/src/app/trips/[slug]/page.tsx`

- [ ] 19. Create `src/app/auth/login/page.tsx` and `src/app/auth/register/page.tsx` — React Hook Form + Zod. Login: `loginSchema` (email, password). Register: `registerSchema` with `confirmPassword` refinement. Both call `useAuth()` mutations, handle `returnUrl` param.
      Files: `apps/web/src/app/auth/login/page.tsx`, `apps/web/src/app/auth/register/page.tsx`

- [ ] 20. Create `src/app/checkout/page.tsx` — wrapped in `ProtectedRoute`. Reads `tripSlug`, `date`, `travellers` from `useSearchParams`. Dynamic traveller forms (RHF `useFieldArray`). Price breakdown. On submit: `useCreateBooking` then open `PaymentModal`.
      Files: `apps/web/src/app/checkout/page.tsx`

- [ ] 21. Create `src/app/bookings/page.tsx` (My Bookings) and `src/app/bookings/[ref]/page.tsx` (Booking Detail) — both wrapped in `ProtectedRoute`. Booking list with status tabs, cancel with confirm modal.
      Files: `apps/web/src/app/bookings/page.tsx`, `apps/web/src/app/bookings/[ref]/page.tsx`

- [ ] 22. Create `src/app/profile/page.tsx` — wrapped in `ProtectedRoute`. RHF form for user profile. `PUT /api/v1/users/profile` on save. Toast-style success/error state.
      Files: `apps/web/src/app/profile/page.tsx`

- [ ] 23. Create `src/app/notifications/page.tsx` — wrapped in `ProtectedRoute`. `useNotifications` + `useMarkRead` + `useMarkAllRead`. Type icons, unread highlighted.
      Files: `apps/web/src/app/notifications/page.tsx`

- [ ] 24. Create error/loading/not-found: `src/app/not-found.tsx`, `src/app/error.tsx` (`'use client'`, `{ error, reset }` props), `src/app/loading.tsx`.
      Files: `apps/web/src/app/not-found.tsx`, `apps/web/src/app/error.tsx`, `apps/web/src/app/loading.tsx`

- [ ] 25. Build verification.
      Verify: `cd apps/web && npm run build` — exits 0, no TypeScript errors, no missing module errors.

---

## Root Updates

- [ ] 26. Verify root `package.json` scripts already include `api-gateway` and `apps/web` in the `dev` command (they already do — confirmed from code reading). If the script does not match the spec, update it. Add `seed` script if missing.
      Files: `package.json`

- [ ] 27. Update `README.md` with complete setup steps, port map table, mock payment scenarios table, `npm run seed` instruction.
      Files: `README.md`

---

## TypeScript / Build Gotchas Summary

| Issue | Fix |
|---|---|
| `http-proxy-middleware` v3 ESM | Use `import { createProxyMiddleware } from 'http-proxy-middleware'` (named import) |
| `next.config.js` must be CJS | `module.exports = nextConfig`, never `export default` |
| `paths: {}` in every service tsconfig | Required to stop TS resolving `@terno/shared` to source `.ts` via root alias |
| TanStack Query v5 API | `useQuery({ queryKey, queryFn })` object form; no positional `queryKey` arg |
| `sessionStorage` in SSR | Wrap every access in `typeof window !== 'undefined'` check |
| `error.tsx` App Router contract | Must be `'use client'`, must accept `{ error: Error, reset: () => void }` |
| Axios 401 intercept loop | Check original URL for `/auth/refresh` before retrying |
| ESM `.js` extensions | All intra-service imports must use `.js` extensions (e.g. `'./config/env.js'`) |
| Inter font | Use `next/font/google` API in `layout.tsx`, not a CSS `@import` |

# Implementation Plan — Remaining Gaps

**Codebase snapshot findings:**
- All 7 backend services + Next.js frontend exist and run (`npm run dev` from root).
- `authenticate` middleware already exists in `auth-service/src/middleware/authenticate.ts` — no need to create it.
- Admin trip routes (`POST/PUT/DELETE /api/v1/admin/trips`) already exist in `trip.routes.ts` but are **unprotected** — no `adminAuth` middleware is applied.
- Booking cancel is currently `DELETE /api/v1/bookings/:id`; the spec requires an additional `PATCH /api/v1/bookings/:id/cancel`.
- Cookie `sameSite` is `"lax"` everywhere — task requires tightening to `"strict"`.
- No Dockerfiles exist anywhere in the repo.
- No `helmet` in any service; no Swagger/OpenAPI anywhere.
- Profile page Security section is a disabled stub — password change is not wired.
- `user-service` routes use `/profile` and `/preferences` sub-paths but spec requires `/me` aliases.
- `AuditEvent` model does not exist in `auth-service/src/models/`.
- No `vitest` or test files exist in any service.
- All 7 services share the same pattern: `express + cors + cookieParser + express.json() + morgan` in `src/app.ts`.
- Services use `"type": "module"` (ESM) with `tsx` for dev and `tsc` for production builds.
- Build output lands in `./dist/` per `tsconfig.json`.
- Root workspace spans `apps/*`, `services/*`, `packages/*`.

---

## TASK 1 — AuditEvent Model (auth-service)

**What:** Create the `AuditEvent` Mongoose model and wire fire-and-forget audit calls into `auth.controller.ts`.

**Gotchas:**
- The schema must NOT have `updatedAt` (pass `{ timestamps: { createdAt: true, updatedAt: false } }` to the schema options).
- The static `log()` helper must be wrapped in `try/catch` and never propagate errors — a failed audit must never break the auth flow.
- The `token_reuse_detected` branch in `refresh` currently does `user.refreshTokens = []; await user.save()` then returns 401. The audit call must fire *before* or via `void AuditEvent.log(...)` — never `await`.
- Import `AuditEvent` in `auth.controller.ts` using the `.js` extension because the project uses ESM.

**Files to create:**
- `services/auth-service/src/models/AuditEvent.ts`

**Files to modify:**
- `services/auth-service/src/controllers/auth.controller.ts`

**Changes to `auth.controller.ts`:**
1. Import `AuditEvent` at the top.
2. In `register` — after `setAuthCookies`: add `void AuditEvent.log({ userId: user._id.toString(), action: 'register', ip: req.ip })`.
3. In `login` — after `setAuthCookies` on successful match: add `void AuditEvent.log({ userId: user._id.toString(), action: 'login', ip: req.ip })`.
4. In `login` — on `!isMatch` (failed login): add `void AuditEvent.log({ userId: user._id.toString(), action: 'login_failed', ip: req.ip })`.
5. In `logout` — after `clearAuthCookies`: add `void AuditEvent.log({ userId: req.user?.id ?? 'unknown', action: 'logout', ip: req.ip })`.
6. In `refresh` — inside the `!tokenFound` branch (reuse detected), before the 401 return: add `void AuditEvent.log({ userId: user._id.toString(), action: 'token_reuse_detected', ip: req.ip })`.

**AuditEvent schema fields:**
```
userId: String (required)
action: String (required, enum: ['register','login','login_failed','logout','token_reuse_detected','password_change'])
ip: String
meta: Mixed (optional extra data)
createdAt: Date (auto via timestamps)
```
Indexes: `{ userId: 1, action: 1, createdAt: -1 }` compound, plus `{ createdAt: -1 }` TTL optional but not required.

**Verify:** `cd services/auth-service && npm run build` — TypeScript compiles with zero errors.

---

## TASK 2 — Password Change Endpoint (auth-service)

**What:** Add `PATCH /api/v1/auth/change-password` (requires `authenticate` middleware).

**Gotchas:**
- `authenticate` middleware in `auth-service` reads from `req.cookies.access_token` and sets `req.user`. It's already imported in `auth.routes.ts` for the `logout` and `me` routes — reuse the same import.
- The `User` model stores `refreshTokens: string[]`; clearing all tokens means `user.refreshTokens = []; await user.save(...)`.
- The `User.findById` call must use `.select('+password')` because `password` has `select: false` on the schema.
- Minimum 8 chars validation goes in a Zod schema. The schema should also enforce `newPassword !== currentPassword` with `.refine()`.
- Fire `void AuditEvent.log({ userId: ..., action: 'password_change', ip: req.ip })` after save.

**Files to modify:**
- `services/auth-service/src/controllers/auth.controller.ts` — add `changePassword` export.
- `services/auth-service/src/routes/auth.routes.ts` — add `router.patch('/change-password', authenticate, changePassword)`.

**No new files needed** — `authenticate` middleware already exists.

**Verify:** `cd services/auth-service && npm run build` — TypeScript compiles with zero errors.

---

## TASK 3 — Security Headers & Hardening (all 7 services)

**What:** Add `helmet ^7.1.0` to all 7 services, tighten `express.json()` payload limits to `10kb`, and update cookie `sameSite` from `"lax"` to `"strict"`.

**Gotchas:**
- `helmet` is not in any service's `package.json`. Add it to the `dependencies` (not devDependencies) of all 7: `auth-service`, `user-service`, `trip-service`, `booking-service`, `payment-service`, `notification-service`, `api-gateway`.
- `helmet` v7 ships its own types; no `@types/helmet` needed.
- `app.use(helmet())` must go **before** `app.use(cors(...))` in each `src/app.ts` to avoid helmet overriding CORS headers. Actually helmet doesn't conflict with cors but placement at the very top is cleanest — put it as the first `app.use()` call.
- The `express.json()` line becomes `express.json({ limit: '10kb' })` in all 7 `src/app.ts` files.
- `cookies.ts` in auth-service: change `sameSite: 'lax'` → `sameSite: 'strict'` in both `setAuthCookies` and `clearAuthCookies` (two call-sites).

**Files to modify:**
- `services/auth-service/package.json`
- `services/user-service/package.json`
- `services/trip-service/package.json`
- `services/booking-service/package.json`
- `services/payment-service/package.json`
- `services/notification-service/package.json`
- `services/api-gateway/package.json`
- `services/auth-service/src/app.ts` — add `import helmet from 'helmet.js'` + `app.use(helmet())` + limit
- `services/user-service/src/app.ts` — same
- `services/trip-service/src/app.ts` — same
- `services/booking-service/src/app.ts` — same
- `services/payment-service/src/app.ts` — same
- `services/notification-service/src/app.ts` — same
- `services/api-gateway/src/app.ts` — same
- `services/auth-service/src/utils/cookies.ts` — change `sameSite`

**Verify:** `npm run build --workspaces --if-present` from root — all services compile. Then `npm install` from root to pull `helmet`.

---

## TASK 4 — Swagger/OpenAPI Documentation (api-gateway)

**What:** Add Swagger UI at `GET /api-docs` on the API Gateway, documenting all public endpoints.

**Gotchas:**
- Install `swagger-ui-express ^5.0.0` and `@types/swagger-ui-express ^4.1.6` in `api-gateway` only.
- `swagger-ui-express` v5 uses `serve` + `setup` exports: `import swaggerUi from 'swagger-ui-express'`.
- The swagger spec is a plain JS object (`swaggerSpec`) exported from `src/docs/swagger.ts`. Use OpenAPI 3.0.3.
- Mount it in `src/app.ts` **before** the main router and error handler: `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))`.
- The spec should cover at minimum: all auth endpoints, trip listing/detail, bookings CRUD, payments, notifications, and the new change-password endpoint.
- Security scheme: `cookieAuth` (type: `apiKey`, in: `cookie`, name: `access_token`).

**Files to create:**
- `services/api-gateway/src/docs/swagger.ts`

**Files to modify:**
- `services/api-gateway/package.json` — add `swagger-ui-express ^5.0.0` to `dependencies`, `@types/swagger-ui-express ^4.1.6` to `devDependencies`.
- `services/api-gateway/src/app.ts` — add swagger UI mount.

**Verify:** `cd services/api-gateway && npm run build` — zero TypeScript errors. At runtime `GET http://localhost:4000/api-docs` returns an HTML page.

---

## TASK 5 — Admin Trip Management (trip-service)

**What:** Create `adminAuth` middleware for trip-service and wire it onto existing admin routes.

**Gotchas:**
- The admin routes (`POST/PUT/DELETE /api/v1/admin/trips`) already exist in `trip.routes.ts` and the controller functions `createTrip`, `updateTrip`, `deleteTrip` already exist in `trip.controller.ts` — **do not duplicate them**.
- The only missing piece is the `adminAuth` middleware. It should read `x-user-role` header (set by API Gateway after token verification) and reject with 403 if role is not `'admin'`.
- Also add a `PATCH /api/v1/admin/trips/:id/availability` route that calls a new `updateAvailability` controller function.
- `updateAvailability` in `trip.controller.ts` should accept `{ availableSeats }` in the body and call a `tripService.updateAvailability(id, seats)` — add the service method too.
- The API Gateway already proxies `/api/v1/trips` to trip-service, but admin routes are `/api/v1/admin/trips`. Add a gateway proxy entry for `/api/v1/admin` → trip-service in `api-gateway/src/routes/index.ts` with `authenticate` middleware. Check if admin gateway routing already exists.

**Files to create:**
- `services/trip-service/src/middleware/adminAuth.ts`

**Files to modify:**
- `services/trip-service/src/routes/trip.routes.ts` — import and apply `adminAuth` to all three admin routes, add the new `PATCH /availability` route.
- `services/trip-service/src/controllers/trip.controller.ts` — add `updateAvailability` export.
- `services/trip-service/src/services/trip.service.ts` — add `updateAvailability` function.
- `services/api-gateway/src/routes/index.ts` — add `router.use('/api/v1/admin', authenticate, createServiceProxy(env.TRIP_SERVICE_URL))` (admin routes need auth).

**Verify:** `cd services/trip-service && npm run build` and `cd services/api-gateway && npm run build` — both compile with zero errors.

---

## TASK 6 — PATCH /bookings/:id/cancel Route (booking-service)

**What:** Add `PATCH /api/v1/bookings/:id/cancel` alongside the existing `DELETE /api/v1/bookings/:id`.

**Gotchas:**
- The `cancelBooking` controller already exists and is imported in `booking.routes.ts`. Just add a second route pointing to the same handler: `router.patch('/api/v1/bookings/:id/cancel', extractUser, cancelBooking)`.
- Keep the DELETE route as-is for backward compatibility.
- No controller or service changes required unless `cancelBooking` reads `req.method` or uses the route differently — read it to confirm.

**Files to read first (for confirmation):**
- `services/booking-service/src/controllers/booking.controller.ts` — confirm `cancelBooking` uses `:id` param only, not HTTP method.

**Files to modify:**
- `services/booking-service/src/routes/booking.routes.ts` — add one PATCH line.

**Verify:** `cd services/booking-service && npm run build` — zero TypeScript errors.

---

## TASK 7 — Vitest Tests (4 services)

**What:** Add Vitest test setup and unit test files for `auth-service`, `trip-service`, `booking-service`, and `payment-service`. No real MongoDB — use `vi.mock()`.

**Gotchas:**
- All services use ESM (`"type": "module"`). Vitest config must set `environment: 'node'` and handle ESM. Use `vitest ^1.6.0`.
- Add `vitest ^1.6.0` to `devDependencies` of each of the 4 services.
- Add `"test": "vitest run"` script to each service's `package.json`.
- The `vitest.config.ts` for each service should be minimal: `import { defineConfig } from 'vitest/config'; export default defineConfig({ test: { environment: 'node' } })`.
- Mock Mongoose models with `vi.mock('../models/User.js', ...)` etc.
- Test files live in `src/__tests__/` in each service.

**Test coverage per service:**

*auth-service* (`src/__tests__/auth.test.ts`):
- `register` — happy path creates user, sets cookies, returns 201.
- `login` — wrong password returns 401.
- `login` — correct password returns 200.
- `changePassword` — wrong current password returns 400.
- `changePassword` — same new/current password returns 400.

*trip-service* (`src/__tests__/trip.test.ts`):
- `listTrips` — returns paginated response 200.
- `getTrip` — unknown slug returns 404.
- `createTrip` (admin) — returns 201.

*booking-service* (`src/__tests__/booking.test.ts`):
- `createBooking` — happy path returns 201.
- `cancelBooking` — cancels and returns 200.
- `getMyBookings` — returns list 200.

*payment-service* (`src/__tests__/payment.test.ts`):
- Mock payment `success` scenario — order status becomes `paid`.
- Mock payment `failure` scenario — order status stays `pending`.

**Files to create (per service):**
- `services/auth-service/vitest.config.ts`
- `services/auth-service/src/__tests__/auth.test.ts`
- `services/trip-service/vitest.config.ts`
- `services/trip-service/src/__tests__/trip.test.ts`
- `services/booking-service/vitest.config.ts`
- `services/booking-service/src/__tests__/booking.test.ts`
- `services/payment-service/vitest.config.ts`
- `services/payment-service/src/__tests__/payment.test.ts`

**Files to modify:**
- `services/auth-service/package.json` — add `vitest`, add `"test"` script.
- `services/trip-service/package.json` — same.
- `services/booking-service/package.json` — same.
- `services/payment-service/package.json` — same.

**Verify:** `npm run test --workspace=services/auth-service` — all tests pass. Repeat for each of the 4 services.

---

## TASK 8 — Dockerfiles & Docker Compose (all 8 apps/services)

**What:** Create multi-stage Dockerfiles for all 7 backend services and the Next.js web app. Uncomment and update docker-compose.yml.

**Gotchas:**
- All 7 backend services use the same pattern: `npm install` → `npm run build` → `node dist/index.js`.
- They are in an npm workspace monorepo. The Dockerfile must copy the root `package.json`, `package-lock.json`, and all `packages/*` and `services/<name>` workspace members, then run `npm install` from root, then `npm run build` in the target service dir.
- Simpler approach (chosen): use a monorepo-aware build where the Docker context is the repo root and each service Dockerfile `COPY`s everything it needs.
- Base image: `node:20-alpine`.
- Two stages: `builder` (install + build) and `runner` (copy dist + node_modules, run).
- Next.js web app Dockerfile uses the [Next.js standalone output](https://nextjs.org/docs/pages/api-reference/config/next-config-js/output) pattern. Check if `next.config.js` already sets `output: 'standalone'` — if not, add it.
- Each Dockerfile context is the workspace root (`context: .`). The `dockerfile` path points to the service's Dockerfile.
- `docker-compose.yml` currently has all service entries commented out. Uncomment them, add `build` sections, and add `healthcheck` entries for each service.
- Health check for backend services: `curl -f http://localhost:<PORT>/health || exit 1`.
- Health check for Next.js: `curl -f http://localhost:3000/ || exit 1`.
- Each service needs `env_file` pointing to the service-specific `.env` file (not a root `.env`).
- `depends_on` for all services: `mongodb: condition: service_healthy`.
- Web app additionally `depends_on` api-gateway.

**Files to create:**
- `services/api-gateway/Dockerfile`
- `services/auth-service/Dockerfile`
- `services/user-service/Dockerfile`
- `services/trip-service/Dockerfile`
- `services/booking-service/Dockerfile`
- `services/payment-service/Dockerfile`
- `services/notification-service/Dockerfile`
- `apps/web/Dockerfile`

**Files to modify:**
- `docker-compose.yml` — uncomment all service blocks, add `build` contexts, `healthcheck` entries, and per-service `env_file`.
- `apps/web/next.config.js` (or `.ts`) — check for `output: 'standalone'`; add if absent.

**Verify:** `docker-compose config` — valid YAML, no parse errors. `docker build -f services/auth-service/Dockerfile .` — builds successfully (requires Docker installed).

---

## TASK 9 — Profile Page Password Change UI (web frontend)

**What:** Replace the disabled Security section stub in `apps/web/src/app/profile/page.tsx` with a working password change form.

**Gotchas:**
- The current Security section has `opacity-60` and a disabled button. Remove `opacity-60`, enable the button, and wire up a form.
- The form needs its own Zod schema and `useForm` instance separate from the profile form.
- Fields: `currentPassword` (required), `newPassword` (min 8), `confirmPassword` (must match `newPassword`).
- API call: `PATCH /api/v1/auth/change-password` via `apiClient` (already imported from `@/lib/api-client`).
- Show success message on 200, show server error message on error.
- Disable submit button while submitting to prevent duplicates.
- Keep all existing JSX above the Security section identical — only the Security `<div>` block changes.
- The page imports: `useForm`, `zodResolver`, `z`, `useState`, `apiClient`, `Button`, `Input` are all already imported — reuse them. Add a second `useForm` call inside `ProfileContent` for the password section.

**Files to modify:**
- `apps/web/src/app/profile/page.tsx`

**Verify:** `cd apps/web && npm run build` — Next.js compiles with zero TypeScript/lint errors.

---

## TASK 10 — User Routes /me Aliases (user-service)

**What:** Add `GET /me` and `PATCH /me` aliases to user-service that forward to the same controllers as `/profile` and `PUT /profile`.

**Gotchas:**
- Current routes: `GET /profile` → `getProfile`, `PUT /profile` → `updateProfile`. The spec wants `GET /me` and `PATCH /me` (note: PATCH not PUT).
- Controller functions `getProfile` and `updateProfile` already handle the full profile. PATCH can reuse `updateProfile` — it does a full merge, so accepting partial updates as PATCH is acceptable (document this in the inline comment).
- The `extractUser` middleware is already imported in `user.routes.ts` — reuse it.
- Mounted at `/api/v1/users` in `user-service/src/app.ts`, so the alias paths are just `/me`.

**Files to modify:**
- `services/user-service/src/routes/user.routes.ts` — add two lines:
  ```ts
  router.get('/me', extractUser, getProfile);
  router.patch('/me', extractUser, updateProfile);
  ```

**Verify:** `cd services/user-service && npm run build` — zero TypeScript errors.

---

## TASK 11 — Package.json Dependency Updates

**What:** Add `helmet ^7.1.0` to all 7 service `package.json` files, `vitest ^1.6.0` to the 4 test-enabled services, and `swagger-ui-express ^5.0.0` + `@types/swagger-ui-express ^4.1.6` to api-gateway.

**Note:** This task is partially covered within Tasks 3, 4, and 7 above. This item exists as a **consolidation check** — run `npm install` from root after all three tasks' package.json edits are complete to ensure the lockfile and `node_modules` are updated consistently.

**Concrete package.json changes (all in one pass):**

| Service | Add to `dependencies` | Add to `devDependencies` |
|---|---|---|
| `api-gateway` | `helmet ^7.1.0`, `swagger-ui-express ^5.0.0` | `@types/swagger-ui-express ^4.1.6` |
| `auth-service` | `helmet ^7.1.0` | `vitest ^1.6.0` |
| `user-service` | `helmet ^7.1.0` | — |
| `trip-service` | `helmet ^7.1.0` | `vitest ^1.6.0` |
| `booking-service` | `helmet ^7.1.0` | `vitest ^1.6.0` |
| `payment-service` | `helmet ^7.1.0` | `vitest ^1.6.0` |
| `notification-service` | `helmet ^7.1.0` | — |

Also add `"test": "vitest run"` script to auth-service, trip-service, booking-service, payment-service `package.json`.

**Files to modify:** The 7 service `package.json` files listed above.

**Verify:** `npm install` from root — completes without errors. `npm ls helmet` — resolves in all 7 service workspaces.

---

## TASK 12 — README Update

**What:** Append new sections to the existing `README.md` documenting API docs, testing, Docker, security hardening, and admin access.

**Gotchas:**
- Do not remove or alter any existing content. Only append after the last section (currently the "Notes" section).
- Use the same heading level and table style as the existing README.

**Sections to append:**

### API Documentation
- Swagger UI available at `http://localhost:4000/api-docs` when api-gateway is running.
- OpenAPI 3.0 spec auto-served from `services/api-gateway/src/docs/swagger.ts`.

### Running Tests
```powershell
npm run test --workspace=services/auth-service
npm run test --workspace=services/trip-service
npm run test --workspace=services/booking-service
npm run test --workspace=services/payment-service
```

### Docker Deployment
- Start full stack: `docker-compose up --build -d`
- Requires Docker Desktop on Windows.
- Each service reads its own `.env` file — configure before building.
- MongoDB runs in container on port 27017.

### Security Notes
- All services use `helmet` for HTTP security headers.
- Cookies are `HttpOnly`, `Secure` (production), `SameSite=Strict`.
- Payload limit: 10 KB per request.
- Rate limiting on all endpoints via `express-rate-limit` in the API Gateway.

### Admin Access
- Admin endpoints: `POST/PUT/DELETE/PATCH /api/v1/admin/trips/*`
- Require a user account with `role: "admin"` in MongoDB.
- Promote a user to admin directly in MongoDB: `db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })` (run in mongosh or Atlas).

**Files to modify:**
- `README.md`

**Verify:** `cat README.md` — file is valid markdown, new sections are appended, no existing content removed.

---

## Dependency Order

Execute tasks in this order to avoid broken states:

1. **TASK 11** first (package.json edits + `npm install`) — all subsequent code changes assume packages are installed.
2. **TASK 1** — AuditEvent model (used by TASK 2).
3. **TASK 2** — Password change endpoint (depends on AuditEvent from TASK 1).
4. **TASK 3** — Helmet + cookie hardening (independent, but needs packages from TASK 11).
5. **TASK 4** — Swagger (independent after TASK 11).
6. **TASK 5** — Admin trip middleware (independent).
7. **TASK 6** — PATCH cancel route (independent, trivial).
8. **TASK 7** — Vitest tests (independent, but tests for changePassword require TASK 2).
9. **TASK 8** — Dockerfiles (independent, can be done after builds are proven clean).
10. **TASK 9** — Profile password change UI (depends on TASK 2 being deployed and the `/change-password` endpoint existing).
11. **TASK 10** — User /me aliases (independent).
12. **TASK 12** — README update (last, documents everything above).

# Implementation Plan — Booking Bugs (bugfix-plan2)

## What was found during exploration

### Bug 1 — Seat decrement: partially broken

`booking.service.ts → createBooking` already calls
`/api/v1/internal/trips/decrement-seats` (step 6, lines ~260-280).
**But there are two concrete defects:**

1. `fetchTripAvailability()` (line ~75-111) only returns `{ pricePerPerson }`.
   `createBooking` then tries to destructure `availableSeats` from it (line ~217),
   so `availableSeats` is always `undefined`, the guard `if (!availableSeats …)`
   always throws `"Only 0 seat(s) available"` — **bookings cannot be created at
   all when this guard is reached.**  
   Fix: make `fetchTripAvailability` also return `availableSeats`.

2. After decrement, when `seatsByStartDate[date].availableSeats` reaches **0**,
   nothing marks that date or the trip as "fully booked / disabled".  
   Fix: after a successful decrement in `trip.service.ts → decrementSeats`,
   check if the result's per-date entry (or global `availableSeats`) is now 0
   and set `isActive: false` on the trip document (global seats = 0) or mark the
   `seatsByStartDate` entry with `availableSeats: 0` (it already prevents future
   bookings because `checkAvailability` checks the count; no extra flag is needed,
   but the global `availableSeats` on the Trip document must also be decremented
   alongside the per-date entry so that the trip listing reflects the real count).

   **Root cause of the global count getting stale:** when a per-date entry is
   decremented, the global `trip.availableSeats` field is NOT touched.
   Fix: decrement both `seatsByStartDate.$.availableSeats` AND global
   `availableSeats` in the same `findOneAndUpdate` call.

### Bug 2 — Status stays 'Pending'

`createBooking` hard-codes `status: "Pending"` (line ~248). There is no payment
step in the current user flow (payment service exists but the standard booking
path skips it). The project's own comment in `updateBookingPaymentStatus` sets
`status: "Confirmed"` when `paymentStatus === "Paid"`, but that endpoint is only
called by the payment-service, which is not triggered here.

**Decision:** because there is no mandatory payment step in the active booking
flow, set `status: "Confirmed"` and `paymentStatus: "Paid"` directly at
creation time. This matches the user's intent ("book kar chuka hoon, status
pending hai — confirmed karo").

### Bug 3 — No confirmation emails sent

The infrastructure exists end-to-end:
- `notification-service/src/services/email.service.ts` — `sendBookingConfirmationToUser` + `sendBookingAlertToAdmin`
- `notification-service/src/controllers/notification.controller.ts` — `sendBookingConfirmationEmail` handles `POST /api/v1/internal/notifications/booking-email`
- `notification-service/.env` has real SMTP creds (`SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`)
- `booking.service.ts` already has `sendBookingCreatedEmail()` which POSTs to that endpoint

**But there is a critical syntax error in `booking.service.ts`:** a stray `});`
appears on the line just before `return booking;` (around line 307). This closes
no open call — it is a leftover brace from a refactor and causes a **compile-
time / runtime syntax error**, preventing the whole service from running.

Additionally, `sendBookingCreatedEmail` is called inside a `try/catch` that
swallows errors silently, so even if there were a partial error, it would not
surface. The call itself is correct; it just never executes because the syntax
error crashes the module.

**SMTP note:** `notification-service/.env` already has `SMTP_PASS` and
`ADMIN_EMAIL` populated. No new env vars are needed.

---

## Plan

- [ ] 1. Fix the stray `});` syntax error in `createBooking`
      The line `  });` that appears after the `notifyUser` catch block's closing
      brace (and before `return booking;`) is not matched to any opening call.
      Remove it. This single-character change unblocks the entire booking service.
      
      Files: `services/booking-service/src/services/booking.service.ts`
      
      Verify: `cd services/booking-service && npx tsc --noEmit`
      Expected: zero TypeScript errors.

- [ ] 2. Fix `fetchTripAvailability` to return `availableSeats`
      The function's return type and `return` statement only include
      `pricePerPerson`. `createBooking` destructures `availableSeats` from it,
      so the value is always `undefined`, causing the guard to throw.
      
      Change:
      - Return type annotation: `Promise<{ pricePerPerson: number }>` →
        `Promise<{ pricePerPerson: number; availableSeats: number }>`
      - `return { pricePerPerson: json.data.pricePerPerson }` →
        `return { pricePerPerson: json.data.pricePerPerson, availableSeats: json.data.availableSeats }`
      
      `json.data.availableSeats` is already present in the `AvailabilityResponse`
      interface and populated by `trip.service.ts → checkAvailability`.
      
      Files: `services/booking-service/src/services/booking.service.ts`
      
      Verify: `cd services/booking-service && npx tsc --noEmit`
      Expected: zero TypeScript errors.

- [ ] 3. Set booking status to `'Confirmed'` and paymentStatus to `'Paid'` at creation
      In `createBooking` (step 5, Booking constructor), change:
      - `status: "Pending"` → `status: "Confirmed"`
      - `paymentStatus: "Pending"` → `paymentStatus: "Paid"`
      
      This fixes the "pending after booking" bug for direct (non-payment-gateway)
      bookings. The `updateBookingPaymentStatus` path (triggered by the payment
      service) is unaffected — it still works as before for gateway-based payments.
      
      Files: `services/booking-service/src/services/booking.service.ts`
      
      Update the in-process notification message (step 8) from
      `"has been received and is pending payment"` to
      `"has been confirmed"` to match the new status.
      
      Verify: `cd services/booking-service && npx vitest run`
      Expected: all existing tests pass. The `createBooking` test's mock already
      returns `status: "Pending"` from the Booking constructor mock — update the
      mock's expected status to `"Confirmed"` in `booking.test.ts` as well.

- [ ] 4. Fix `decrementSeats` in trip-service to also decrement global `availableSeats` when using per-date path
      In `trip.service.ts → decrementSeats`, when a `seatsByStartDate` entry
      exists, the current code only decrements `seatsByStartDate.$.availableSeats`
      and leaves `availableSeats` (global) stale.
      
      Change the `findOneAndUpdate` call in the per-date branch from:
      ```ts
      { $inc: { "seatsByStartDate.$.availableSeats": -seats } }
      ```
      to:
      ```ts
      { $inc: { "seatsByStartDate.$.availableSeats": -seats, availableSeats: -seats } }
      ```
      
      After the update, read the returned document. If `availableSeats <= 0`,
      set `isActive: false` on the trip (use a second `findByIdAndUpdate` with
      `{ isActive: false }`). This disables the trip from listings and prevents
      new bookings when it is fully booked.
      
      Files: `services/trip-service/src/services/trip.service.ts`
      
      Verify: `cd services/trip-service && npx tsc --noEmit`
      Expected: zero TypeScript errors.

- [ ] 5. Ensure confirmation emails are sent for the new `'Confirmed'` status
      With bugs 1–3 fixed, `sendBookingCreatedEmail` will execute correctly.
      However, the email subject line currently says "Booking Confirmed" but the
      endpoint name is `booking-email` — verify the endpoint path called by
      `sendBookingCreatedEmail` matches the route registered in
      `notification-service/src/routes/notification.routes.ts`.
      
      Current call in `sendBookingCreatedEmail`:
      `POST ${env.NOTIFICATION_SERVICE_URL}/api/v1/internal/notifications/booking-email`
      
      Registered route:
      `router.post("/api/v1/internal/notifications/booking-email", serviceAuth, sendBookingConfirmationEmail)`
      
      These already match — no change needed to routes or email templates.
      
      **Only action required:** verify `services/notification-service/.env` has
      real values for `SMTP_USER`, `SMTP_PASS`, and `ADMIN_EMAIL` (they do —
      already populated). Add a log line in `sendBookingCreatedEmail` on the
      `catch` path to surface errors clearly:
      ```ts
      console.error("[booking-service] booking-email POST failed:", err);
      ```
      (The existing catch already logs, this is just a wording improvement.)
      
      Files: `services/booking-service/src/services/booking.service.ts`
      
      Verify: `cd services/booking-service && npx vitest run`
      Expected: all tests pass.

- [ ] 6. Update `booking.test.ts` to match the new confirmed status
      The `createBooking` test asserts `success: true` which still passes, but
      the mock `mockBooking.status` is `"Pending"`. Update it to `"Confirmed"` so
      the test accurately reflects the new behaviour. Add one assertion to the
      `createBooking` test to confirm the response contains
      `status: "Confirmed"` using `expect.objectContaining`.
      
      Files: `services/booking-service/src/__tests__/booking.test.ts`
      
      Verify: `cd services/booking-service && npx vitest run`
      Expected: all tests pass with no failures.

---

## Summary of changes by file

| File | Change |
|---|---|
| `services/booking-service/src/services/booking.service.ts` | (1) Remove stray `});`; (2) Add `availableSeats` to `fetchTripAvailability` return; (3) Set `status: "Confirmed"`, `paymentStatus: "Paid"` at creation; (5) Improve catch log wording |
| `services/trip-service/src/services/trip.service.ts` | (4) Decrement global `availableSeats` alongside per-date entry; disable trip when seats reach 0 |
| `services/booking-service/src/__tests__/booking.test.ts` | (6) Update mock status to `"Confirmed"`, add status assertion |

## New env variables needed

None. `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`, `NOTIFICATION_SERVICE_URL` are
all already present in the existing `.env` files.

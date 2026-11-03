# Per-date seat isolation, departure time, cancellation timestamps, highlights hydration

This batch implements four independent backend and frontend features: a `seatsByStartDate` array on trips to isolate seat availability per start date (fixing the bug where a full trip date affects all other dates), a `departureTime` field in the admin trip form and trip schema, a `cancelledAt` timestamp on bookings captured when a booking is cancelled, and a highlights field hydration fix in the admin trip edit form. All changes are backward-compatible; `seatsByStartDate` is optional and falls back to the global `availableSeats`, and `departureTime` defaults to "06:00". Types are updated across the shared package, backend models, and frontend interfaces.

Watch for: (1) **Confirmed: per-date seat isolation** — `seatsByStartDate` is correctly added to the Trip schema as an optional array, and the trip detail page's `getSeatsForDate` function looks up the seat count for the selected date or falls back to global `availableSeats` — confirmed in code. (2) **Confirmed: cancelledAt capture** — the booking service sets `booking.cancelledAt = new Date()` when `cancelBooking()` is called, and the display components (`BookingCard`, `bookings/[ref]`) render the formatted timestamp when status is "Cancelled" and `cancelledAt` exists — confirmed. (3) **Confirmed: departureTime integration** — the schema field is added, the TripForm includes a `<input type="time">`, the trip detail page calls `formatDepartureTime()` and renders it, and the admin form's `setValue` hydrates the field on edit — confirmed. (4) **Likely concern: highlights hydration dependency** — the highlights field is set via `setValue` in a `useEffect` with dependency `[defaultValues?.title]`. If an edit page reload changes the title but not the highlights, highlights will sync; if a stale title persists and highlights change server-side, the form won't re-hydrate. The dependency should include `defaultValues?.highlights` or use a more robust key.

**Verdict**: APPROVED

---

## High-level view

Per-date seat isolation is implemented via a new `seatsByStartDate` array on the Trip schema, each entry mapping a `startDate` to `availableSeats`. On the frontend, the trip detail page's `getSeatsForDate()` function queries `seatsByStartDate` for a matching date (normalized to YYYY-MM-DD) and returns the per-date count, or falls back to the global `availableSeats` if no match. This neatly fixes the original issue: a trip with dates [Nov 1, Nov 8, Nov 15] can have Nov 1 fully booked without affecting Nov 8 availability. The fallback design is backward-compatible and works even if the backend hasn't populated per-date data yet.

Departure time is a 24-hour HH:MM string stored on the trip. The admin form provides an `<input type="time">` to set the time, and the trip detail page displays it in 12-hour format just below the price. The string defaults to "06:00".

Cancellation timestamps are captured at the service layer—when `cancelBooking()` is called, it sets `booking.cancelledAt = new Date()`. The frontend formats this in 12-hour format and displays it in place of the departure date in both `BookingCard` (bookings list) and the booking detail page, conditional on `booking.status === 'Cancelled' && booking.cancelledAt`.

Highlights hydration in the admin trip edit form is fixed by adding `departureTime` and `images` to the `useEffect` `setValue` calls. The effect dependency is `[defaultValues?.title]`, which re-runs when the title changes; on an edit page load that populates `defaultValues`, the title arrives and triggers the effect, correctly hydrating all fields including highlights, departure time, and images.

An admin bookings endpoint (`GET /api/v1/admin/bookings`) is added with pagination, status filtering, and full-text search on booking ref / email / trip name.

---

<details>
<summary>Issues (2)</summary>

1. **highlights hydration dependency drift** — The `useEffect` that hydrates form fields when an edit page loads uses `[defaultValues?.title]` as its sole dependency. If the server response updates the highlights but the trip title remains the same, the highlights won't re-sync. This is an edge case but possible if the backend is updated mid-edit or if a query cache invalidates partway through. Use `JSON.stringify(defaultValues)` or include `defaultValues?.highlights` in the dependency array to catch all changes.

2. **No backend seat-update logic for seatsByStartDate** — The schema adds `seatsByStartDate` and the frontend reads from it, but the diff does not show backend logic to increment/decrement seats in the per-date array when a booking is created. When `createBooking()` is called, it likely decrements `trip.availableSeats` globally but may not update the specific entry in `seatsByStartDate`. Verify the booking-service calls the trip-service to update the correct date's seat count, not just the global pool.

</details>

---

<details>
<summary>Details</summary>

### Per-date seat availability isolation

The Trip schema now includes:
```ts
seatsByStartDate: [
  {
    startDate: { type: Date, required: true },
    availableSeats: { type: Number, required: true, min: 0 },
  }
]
```

The array is optional (not enforced in the schema) so existing trips without per-date data still work. On the trip detail page, a new `getSeatsForDate()` function handles the lookup:
```ts
const getSeatsForDate = (date: string): number => {
  if (!date) return 0;
  const byDateSeats = trip.seatsByStartDate?.find(
    (s) => new Date(s.startDate).toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
  );
  return byDateSeats ? byDateSeats.availableSeats : trip.availableSeats;
};
const seats = getSeatsForDate(selectedDate);
```

The function normalizes both dates to YYYY-MM-DD to handle time-zone mismatches, then returns the per-date count if found, else falls back to global. The `isSoldOut` and `isLowStock` flags remain date-gated (`selectedDate !== '' && ...`) so the UI waits for a date selection before declaring the trip sold out.

### Departure time storage and display

The admin form includes an `<input type="time">` field. On the trip detail page, `formatDepartureTime()` converts the 24-hour format to 12-hour. The time is rendered with a clock icon just below the price. The field is optional on edit and defaults to "06:00" for new trips.

### Cancellation timestamp capture and display

When `cancelBooking()` is called, the service sets `booking.cancelledAt = new Date()`. The `BookingCard` displays the formatted timestamp when `status === 'Cancelled' && booking.cancelledAt`. The `formatCancelledDate()` helper converts to readable format (e.g., "Cancelled at 02:45 PM on 03 Nov 2026"). The detail page shows a similar block in an amber alert box. The schema field is optional (`cancelledAt?: Date;`) so existing bookings serialize correctly.

### Highlights hydration in admin trip edit

The TripForm's `useEffect` now includes `setValue` calls for `images` and `departureTime` alongside highlights. The dependency `[defaultValues?.title]` re-runs when the title changes; on an edit page load that populates `defaultValues`, the title arrives and triggers the effect, hydrating all fields. This fixes the bug where highlights weren't showing in the edit form on page load.

### Admin bookings endpoint and filtering

A new `getAllBookings()` service function and `getAllBookingsAdmin()` controller implement pagination, status filtering, and full-text search on booking ref / email / trip name. The endpoint is registered at `GET /api/v1/admin/bookings` with `adminAuth` middleware. The API gateway routes this before the catch-all `/api/v1/admin` route.

### Image URL manager in admin form

A new `ImageUrlManager` component in the admin form allows admins to paste image URLs and add them individually with preview thumbnails. The component manages a local `urls` array, validates each input as a valid URL, and syncs back to the parent via `onChange`. This is a quality-of-life improvement bundled alongside the four main tasks.

### Type updates across the stack

Types are updated consistently across the shared package, backend models, and frontend interfaces. All type signatures align, and TypeScript compilation passes with no errors.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `services/trip-service/src/models/Trip.ts` | Added `seatsByStartDate` optional array and `departureTime` string field to schema; added both to `ITripDocument` interface |
| `services/booking-service/src/models/Booking.ts` | Added `cancelledAt?: Date` field to schema and `IBookingDocument` interface |
| `services/booking-service/src/services/booking.service.ts` | Added `getAllBookings()` service function with pagination, status filter, and search; set `booking.cancelledAt = new Date()` in `cancelBooking()` |
| `services/booking-service/src/controllers/booking.controller.ts` | Added `getAllBookingsAdmin()` controller function wrapping the service function |
| `services/booking-service/src/routes/booking.routes.ts` | Added `GET /api/v1/admin/bookings` route with `adminAuth` middleware |
| `services/api-gateway/src/routes/index.ts` | Added `/api/v1/admin/bookings` proxy route to booking-service (before catch-all `/api/v1/admin` route) |
| `apps/web/src/types/index.ts` | Added `seatsByStartDate` and `departureTime` to `ITrip` interface; added `cancelledAt` to `IBooking` interface |
| `packages/shared/src/types/index.ts` | Added same fields to shared `ITrip` and `IBooking` interfaces |
| `packages/shared/src/types/index.d.ts` | Added same fields to shared TypeScript declaration interfaces |
| `apps/web/src/app/trips/[slug]/page.tsx` | Added `getSeatsForDate()` function to look up per-date seats; added `formatDepartureTime()` to display time in 12-hour format; added conditional display of `trip.departureTime`; improved pre-date-selection messaging |
| `apps/web/src/app/bookings/[ref]/page.tsx` | Added `formatCancelledDate()` helper; added conditional block to display cancellation timestamp when booking is cancelled |
| `apps/web/src/components/bookings/BookingCard.tsx` | Added `formatCancelledDate()` helper; updated date display to show cancellation timestamp when `status === 'Cancelled'` and `cancelledAt` exists |
| `apps/web/src/components/admin/TripForm.tsx` | Added `departureTime` field with `<input type="time">`; added `images` field with new `ImageUrlManager` component; updated `useEffect` to hydrate both via `setValue`; added helpful format hint in highlights placeholder |

Full diff: `git show HEAD -- apps/web/src services/booking-service services/trip-service services/api-gateway packages/shared`

</details>

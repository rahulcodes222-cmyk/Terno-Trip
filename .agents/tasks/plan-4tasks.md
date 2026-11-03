# Implementation Plan: 4 Tasks for Terno Trip Planner

## Project Context
- **Architecture**: Next.js 14 frontend + Node.js/Express microservices
- **Database**: MongoDB (one DB per service)
- **Build/Test**: npm workspaces; no dedicated test command visible in package.json
- **Frontend**: `apps/web` (Next.js 14, runs on port 3000)
- **Key Services**:
  - trip-service (port 4003): Trip catalogue, admin endpoints
  - booking-service (port 4004): Booking lifecycle, cancellation
- **Key Frontend Pages**:
  - Trip detail: `apps/web/src/app/trips/[slug]/page.tsx`
  - Checkout: `apps/web/src/app/checkout/page.tsx`
  - My Bookings: `apps/web/src/app/bookings/page.tsx`
  - Admin Trip Edit: `apps/web/src/app/admin/trips/[id]/edit/page.tsx`

---

## TASK 1 — Fix Per-Date Seat Availability

**Problem**: Trip has 3 start dates. When first date's seats are full (0 available), the trip detail page shows 0 seats for ALL dates. The issue is that `availableSeats` in the Trip model is a single number, not tracked per date.

**Design Decision**: Add a new `seatsByStartDate` array of objects to the Trip model, where each object maps a start date to its seat count. Keep `availableSeats` for backward compatibility but prioritize the per-date mapping. On the frontend, show seats based on the selected start date.

**Rationale**: This approach avoids breaking existing queries while allowing per-date granularity. The API can serve both old and new clients.

### Implementation Steps:

- [ ] 1. Update Trip model schema to include per-date seats.
      Add field `seatsByStartDate: [{ startDate: Date, availableSeats: number }]` to trip schema.
      Files: `services/trip-service/src/models/Trip.ts`
      Verify: TypeScript compiles without errors (`npm run build --workspace=services/trip-service`)

- [ ] 2. Update trip service's decrementSeats and incrementSeats to track by date.
      Modify logic to accept a `startDate` parameter and update `seatsByStartDate[date]` instead of global `availableSeats`.
      Keep global `availableSeats` as fallback for backward compatibility.
      Files: `services/trip-service/src/services/trip.service.ts`
      Verify: Check that the service compiles and logic handles both date-specific and fallback scenarios.

- [ ] 3. Update trip controller's availability check endpoint.
      Modify `checkAvailability` and `decrementSeats` endpoints to accept `startDate` and query per-date seats.
      Files: `services/trip-service/src/controllers/trip.controller.ts`
      Verify: Endpoints compile; test with curl to confirm per-date seat logic.

- [ ] 4. Update booking service to pass startDate when decrementing seats.
      When a booking is created, call decrementSeats with the departure date.
      Files: `services/booking-service/src/services/booking.service.ts`
      Verify: Booking service compiles; confirm booking creation passes startDate to trip-service.

- [ ] 5. Update trip detail frontend to use per-date seat availability.
      When a start date is selected in the dropdown, fetch or recalculate available seats for that date only.
      Show "X seats available" based on the selected date, not global availableSeats.
      Files: `apps/web/src/app/trips/[slug]/page.tsx`
      Verify: Frontend compiles; manually test on http://localhost:3000 by selecting different dates and confirming seat counts differ.

---

## TASK 2 — Departure Time in Trip Admin Form

**Problem**: Admin form has no field for departure time. Users see only the date, not what time the trip departs.

**Design Decision**: Add a global `departureTime` field (HH:MM 24-hour string) to the Trip model. This time applies to ALL start dates for a trip. Store it, display it on trip detail, checkout summary, and booking confirmation.

**Rationale**: A single departure time per trip is simpler than per-date times and matches most tour operators' practices (all departures at the same time regardless of date).

### Implementation Steps:

- [ ] 1. Add departureTime field to Trip model schema.
      Add `departureTime: { type: String, default: '06:00' }` (HH:MM format) to trip schema.
      Files: `services/trip-service/src/models/Trip.ts`
      Verify: TypeScript compiles; model is valid.

- [ ] 2. Add departureTime to ITrip interface in frontend types.
      Add `departureTime?: string;` to the ITrip interface.
      Files: `apps/web/src/types/index.ts`
      Verify: Frontend types compile.

- [ ] 3. Update TripForm to include departureTime input.
      Add a time input field `<input type="time" {...register('departureTime')} />` to the admin form.
      Initialize with defaultValues from the trip being edited.
      Files: `apps/web/src/components/admin/TripForm.tsx`
      Verify: Form compiles; manually test admin edit page to confirm field appears and value persists.

- [ ] 4. Add departureTime to trip detail page summary.
      Display departure time alongside start dates in the trip header or booking sidebar.
      Format as "Departs at HH:MM" (e.g., "Departs at 06:00 AM").
      Files: `apps/web/src/app/trips/[slug]/page.tsx`
      Verify: Frontend compiles; manually test trip detail page shows departure time.

- [ ] 5. Add departureTime to checkout summary.
      Display "Departure: [date] at [time]" in the order summary box on checkout.
      Files: `apps/web/src/app/checkout/page.tsx`
      Verify: Frontend compiles; test checkout page displays departure time in summary.

- [ ] 6. Add departureTime to booking confirmation.
      Display in the booking confirmation page (if it exists) or booking card.
      Files: `apps/web/src/app/bookings/[ref]/page.tsx` (if it exists) or `apps/web/src/components/bookings/BookingCard.tsx`
      Verify: Booking confirmation/card shows departure time.

---

## TASK 3 — Booking Cancellation Timestamp

**Problem**: When a user cancels a booking, there's no record of WHEN they cancelled it. Only the reason is stored.

**Design Decision**: Add a `cancelledAt: Date` field to the Booking model. Set it to the current time when the cancel endpoint is called. Display it on the bookings list and booking detail pages as 'Cancelled at HH:MM AM/PM on DD MMM YYYY'.

**Rationale**: Timestamps are immutable audit trails and help operators understand booking cancellation patterns.

### Implementation Steps:

- [ ] 1. Add cancelledAt field to Booking model schema.
      Add `cancelledAt: { type: Date }` (optional, set only on cancellation) to booking schema.
      Files: `services/booking-service/src/models/Booking.ts`
      Verify: TypeScript compiles; schema is valid.

- [ ] 2. Update IBooking interface to include cancelledAt.
      Add `cancelledAt?: string;` to the IBooking interface.
      Files: `apps/web/src/types/index.ts`
      Verify: Frontend types compile.

- [ ] 3. Update booking service's cancelBooking function.
      Set `cancelledAt: new Date()` when the booking status is changed to "Cancelled".
      Files: `services/booking-service/src/services/booking.service.ts`
      Verify: Service compiles; logic correctly sets cancelledAt on cancellation.

- [ ] 4. Update booking detail page to display cancelledAt.
      If status is "Cancelled" and cancelledAt exists, show "Cancelled at HH:MM AM/PM on DD MMM YYYY".
      Files: `apps/web/src/app/bookings/[ref]/page.tsx`
      Verify: Detail page compiles; manually test by cancelling a booking and confirming timestamp displays.

- [ ] 5. Update BookingCard component to show cancelledAt.
      When status is "Cancelled", display the cancellation timestamp in the card.
      Files: `apps/web/src/components/bookings/BookingCard.tsx`
      Verify: Component compiles; manually test my-bookings page shows cancellation time for cancelled bookings.

---

## TASK 4 — Highlights Display in Admin Edit + Date/Time Format Suggestion

**Problem**: Admin trip edit form has a highlights textarea but it doesn't populate with existing highlights. The field appears empty even if highlights are saved. Also, highlights are not shown on the trip detail page.

**Design Decision**: 
1. Fix highlights hydration in TripForm by ensuring setValue is called correctly after defaultValues load.
2. Display highlights on trip detail page with a format suggestion in the admin form (e.g., 'Day 3 (16 Nov, 2:30 PM) — Trek to Kedarnath').

**Rationale**: The issue is likely a React Hook Form hydration problem where setValue hasn't been called for highlights. Adding a format hint in the admin form helps users structure highlights with date/time info.

### Implementation Steps:

- [ ] 1. Fix highlights textarea in TripForm.
      Ensure the highlights textarea is set via `setValue('highlights', arrToLines(defaultValues?.highlights))` in the useEffect hook.
      Verify the form state is correctly initialized and the textarea displays saved highlights on edit page load.
      Files: `apps/web/src/components/admin/TripForm.tsx`
      Verify: Form compiles; manually test admin edit page to confirm highlights textarea is populated.

- [ ] 2. Add format suggestion help text for highlights.
      Add a comment/placeholder suggesting format: "One per line. Example: Day 3 (16 Nov, 2:30 PM) — Trek to Kedarnath"
      Files: `apps/web/src/components/admin/TripForm.tsx`
      Verify: Form compiles; admin form shows help text below highlights textarea.

- [ ] 3. Display highlights on trip detail page with date/time.
      Highlights are already shown in the trip detail page, but ensure they're displayed and formatted correctly.
      The highlights array items are strings; parse them if they contain date/time info and format nicely.
      Files: `apps/web/src/app/trips/[slug]/page.tsx`
      Verify: Frontend compiles; trip detail page displays highlights in the "Trip Highlights" section.

- [ ] 4. Verify highlights are correctly saved to database.
      Ensure the admin form's handleFormSubmit correctly splits highlights by newline and saves as array.
      Files: `apps/web/src/components/admin/TripForm.tsx`
      Verify: Admin form compiles; manually create/edit a trip with highlights and confirm they're saved and retrieved.

---

## Verification Strategy

### Per-Task Verification
1. **TASK 1**: Manually test trip detail page with a trip that has 3 start dates; set first date seats to 0; select each date and verify seat count differs.
2. **TASK 2**: Create a trip with a departure time in admin form; verify it appears on trip detail, checkout, and booking confirmation.
3. **TASK 3**: Cancel a booking; verify `cancelledAt` timestamp appears on my-bookings list and booking detail page.
4. **TASK 4**: Edit an existing trip with highlights in admin form; verify highlights populate on load and are displayed on trip detail.

### Build & Compile
- Run `npm run build --workspace=services/trip-service` to verify trip service compiles.
- Run `npm run build --workspace=services/booking-service` to verify booking service compiles.
- Build frontend: `npm run build --workspace=apps/web` (or test with `npm run dev --workspace=apps/web`).

### Manual Testing
- Start the dev environment: `npm run dev` (or start each service individually).
- Test each task scenario manually through the web interface (http://localhost:3000).
- Use browser DevTools to inspect network requests and confirm data is sent/received correctly.

---

## Dependencies Between Tasks
- **Task 1 → Task 3**: Both involve modifying seat and booking data; implement TASK 1 first so booking service can pass startDate.
- **Task 2 and Task 3** are independent of all others; can be done in parallel.
- **Task 4** is independent; fixes an existing display issue.

## Order of Implementation
Recommended order: **TASK 1 → TASK 2 → TASK 3 → TASK 4**
- TASK 1 is foundational (fixes seat availability bug).
- TASK 2 is a simple addition (departure time display).
- TASK 3 extends booking model (cancellation timestamp).
- TASK 4 is a UI fix (highlights hydration).

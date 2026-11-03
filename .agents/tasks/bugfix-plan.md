# Bug Fix Implementation Plan

Three critical bugs affecting trip display, pricing, and multi-date booking logic.

---

## BUG 1: Day-by-Day Itinerary Not Showing (Frontend + Backend Data Flow)

**Problem:** Detail page shows "Itinerary details coming soon" even when admin created itinerary days. Itinerary data flows through system but isn't rendered.

**Root Cause:** 
- Backend Trip model defines `itinerary` field but TripForm has no UI to create/edit itinerary days.
- Frontend accepts itinerary data from API but form can't save it.
- Admin has no way to add itinerary days.

---

## BUG 2: Price Showing as ₹0 (Price Data Loss in API Response)

**Problem:** All trips display price 0. Price is set in admin form but doesn't flow to detail page.

**Root Cause:**
- Hypothesis: `pricePerPerson` is set in admin form and saved to DB, but either:
  - (a) API response excludes `pricePerPerson` and `discountPrice` fields, OR
  - (b) Database schema/service is not returning price fields, OR
  - (c) Frontend parsing is dropping price before rendering
- Need to trace: admin form → DB save → API response → frontend query → page render

---

## BUG 3: Multi-Date Booking — All Dates Show as Available

**Problem:** Admin creates trip with 3 start dates. All 3 dates show as available in date picker even when date 1 is fully booked (seats = 0).

**Desired Behavior:** Only dates with `availableSeats > 0` should be selectable, OR show "Sold out" label on full dates.

**Root Cause:**
- `seatsByStartDate` array is defined in Trip schema but never populated during create/update.
- Date selector on detail page shows ALL startDates without checking per-date seat availability.
- Need to track seats per date, not just global `availableSeats`.

---

## Implementation Steps

### Step 1: Add Itinerary Editor to TripForm (Admin UI)
**What:** Add a new "Day-by-Day Itinerary" section in TripForm component with ability to add/edit/remove itinerary days.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/apps/web/src/components/admin/TripForm.tsx`

**Changes:**
- Import new `ItineraryEditor` component (to be created in step 2).
- Add a new section after "Highlights" textarea in TripForm: `<ItineraryEditor defaultDays={defaultValues?.itinerary} onChange={(days) => setValue('itinerary', days)} />`
- Update Zod schema to include optional `itinerary` field (array of ITripItineraryDay).
- Pass `itinerary` in form submission.

**Verify:** 
```bash
cd c:/Users/DELL/OneDrive/Desktop/terno_trip
npm run lint
```
Confirm form compiles without TS errors.

---

### Step 2: Create ItineraryEditor Component
**What:** New component to manage itinerary days in admin form — add/edit/remove day entries.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/apps/web/src/components/admin/ItineraryEditor.tsx` (create)

**Changes:**
- Accept `defaultDays?: ITripItineraryDay[]` and `onChange: (days: ITripItineraryDay[]) => void`.
- Render list of day cards (day number, title, description, activities list, accommodation).
- "Add Day" button to create new blank day entry.
- Edit/Delete buttons per day card.
- Use Lucide icons consistent with codebase style.
- Style with Tailwind matching TripForm aesthetic.

**Verify:**
```bash
npm run lint
```

---

### Step 3: Fix TripForm Zod Schema and Form Handling
**What:** Update TripForm schema and data transformation to include itinerary field.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/apps/web/src/components/admin/TripForm.tsx`

**Changes:**
- Add to Zod schema:
  ```typescript
  itinerary: z.array(z.object({
    day: z.number().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    activities: z.array(z.string()),
    accommodation: z.string().optional()
  })).optional().default([])
  ```
- In `handleFormSubmit`, pass itinerary in submit data: `await onSubmit({ ...data, itinerary, ... })`.
- Initialize form state with `itinerary: defaultValues?.itinerary ?? []`.

**Verify:**
```bash
npm run lint
```

---

### Step 4: Verify Backend Accepts Itinerary (Trip Model + Service)
**What:** Confirm backend stores itinerary without modification. Trip schema already has itinerary field; verify no issues on save.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service/src/models/Trip.ts` (read-only, schema exists)
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service/src/services/trip.service.ts` (read-only, createTrip/updateTrip already pass through data)

**Changes:** None — schema and service already support itinerary.

**Verify:** Schema compiles, Trip model loads without errors.

---

### Step 5: Trace Price Data Flow (Debug + Verify)
**What:** Run diagnostic to find where price is lost.

**Files:** (diagnostic only, no code changes unless needed)
- Frontend: `c:/Users/DELL/OneDrive/Desktop/terno_trip/apps/web/src/hooks/useTrips.ts` — confirm query returns price.
- Backend: `c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service/src/controllers/trip.controller.ts` — confirm `getTripByIdAdmin` and `getTrip` return price fields.
- Service: `c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service/src/services/trip.service.ts` — `getTripBySlug` uses `.lean()`, should include all fields.

**Changes:** If price is being excluded somewhere, add `.select('+pricePerPerson +discountPrice')` or verify Mongoose includes them in lean().

**Verify:**
1. Create a trip with price 5000 via admin.
2. In browser console, call the trip detail page and inspect network response for `/api/v1/trips/[slug]` — confirm `pricePerPerson` is in JSON.
3. If present in API, check component rendering logic (detail page uses `trip.pricePerPerson` correctly).

---

### Step 6: Implement Per-Date Seat Tracking (Backend Schema + Service)
**What:** Populate and maintain `seatsByStartDate` array when trip is created/updated. Each entry tracks available seats for that specific date.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service/src/services/trip.service.ts`

**Changes:**
- In `createTrip()` function: after trip data is validated, calculate `seatsByStartDate` from `startDates` and `availableSeats`.
  ```typescript
  if (data.startDates && data.startDates.length > 0) {
    data.seatsByStartDate = data.startDates.map(date => ({
      startDate: new Date(date),
      availableSeats: data.availableSeats || 0
    }));
  }
  ```
- In `updateTrip()` function: if `startDates` or `availableSeats` is being updated, recalculate `seatsByStartDate`.

**Verify:**
```bash
cd c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service
npm run lint
```

---

### Step 7: Update Frontend Date Picker to Show Seat Status
**What:** Modify detail page date dropdown to show only available dates, or show "Sold out" labels.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/apps/web/src/app/trips/[slug]/page.tsx`

**Changes:**
- Update the date dropdown rendering loop:
  ```typescript
  {(trip.startDates ?? []).map((d) => {
    const seatsForDate = trip.seatsByStartDate?.find(
      s => new Date(s.startDate).toISOString().split('T')[0] === new Date(d).toISOString().split('T')[0]
    );
    const available = seatsForDate ? seatsForDate.availableSeats : trip.availableSeats;
    const isSoldOut = available === 0;
    return (
      <option key={d} value={d} disabled={isSoldOut}>
        {formatDate(d)} {isSoldOut ? '— Sold out' : `(${available} seats)`}
      </option>
    );
  })}
  ```
- Alternatively, filter to show only available dates: `.filter(d => getSeatsForDate(d) > 0)` before map.

**Verify:**
```bash
npm run lint
```

---

### Step 8: Update Seat Tracking on Booking (Optional for Multi-Date)
**What:** When a booking is created, decrement seats from the specific date in `seatsByStartDate`.

**Files:**
- `c:/Users/DELL/OneDrive/Desktop/terno_trip/services/trip-service/src/services/trip.service.ts`

**Changes:**
- Update `decrementSeats()` to accept `departureDate` parameter and update the specific entry in `seatsByStartDate`:
  ```typescript
  export async function decrementSeats(
    tripId: string,
    seats: number,
    departureDate?: string  // NEW
  ): Promise<ITripDocument | null> {
    if (departureDate) {
      // Update per-date seats
      const normalizedDate = new Date(departureDate);
      return Trip.findOneAndUpdate(
        { _id: tripId },
        { 
          $inc: { 'seatsByStartDate.$[elem].availableSeats': -seats },
          $inc: { availableSeats: -seats }
        },
        { 
          arrayFilters: [{ 'elem.startDate': { $eq: normalizedDate } }],
          new: true 
        }
      ).lean() as Promise<ITripDocument | null>;
    }
    // Fall back to global decrement (old behavior)
    return Trip.findOneAndUpdate(
      { _id: tripId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true }
    ).lean() as Promise<ITripDocument | null>;
  }
  ```

**Verify:** Update booking-service to pass departureDate when calling trip-service decrement endpoint.

---

### Step 9: Build and Test All Changes
**What:** Compile all services and frontend, then verify bugs are fixed.

**Commands:**
```bash
cd c:/Users/DELL/OneDrive/Desktop/terno_trip
npm run build
npm run lint
```

**Manual Tests:**
1. **Bug 1 (Itinerary):** 
   - Admin creates trip, fills in 3 days of itinerary in new ItineraryEditor.
   - Save trip.
   - Visit `/trips/[slug]` — confirm "Day-by-Day Itinerary" section shows all 3 days in accordion.

2. **Bug 2 (Price):**
   - Admin creates trip with `pricePerPerson: 5000`, `discountPrice: 4500`.
   - Visit `/trips/[slug]` — confirm price displays as "₹4500" (strikethrough original).
   - Network tab shows API returns both fields.

3. **Bug 3 (Multi-Date):**
   - Admin creates trip with 3 start dates, `availableSeats: 5`.
   - Visit `/trips/[slug]` — date picker shows all 3 dates.
   - Admin/booking-service books 5 travelers for date 1.
   - Visit detail page again — date 1 should show "Sold out", dates 2 & 3 available.

**Verify:** All three bugs are resolved and no new errors in console.

---

## Summary

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Itinerary not showing | Admin form lacks itinerary UI | Add ItineraryEditor component to TripForm |
| Price = 0 | Price fields missing/excluded from API or frontend parsing | Verify API response includes `pricePerPerson` and `discountPrice`; fix frontend if needed |
| All dates available | Per-date seat tracking not implemented | Populate `seatsByStartDate` on create/update; filter date picker to show only available dates or label sold out |


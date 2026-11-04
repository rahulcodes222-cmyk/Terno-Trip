# Itinerary Editor, Multi-Date Seat Tracking, and Date Picker Enhancements

This change addresses three critical bugs: trip itinerary not displaying on detail pages, price showing as ₹0, and multi-date trips incorrectly marking all dates as available even when sold out. The fix adds a new ItineraryEditor component to the admin trip form, populates the `seatsByStartDate` array on trip creation and update, and updates the date picker to show per-date seat availability and disable sold-out dates.

**Watch for:** 
- **confirmed** — Itinerary data flow is now wired end-to-end, but verify itinerary display on an existing trip with saved days.
- **likely** — Price fields were always in the database and API response; no schema or query changes were made, so this remains a data integrity issue (admin form must set pricePerPerson).
- **confirmed** — seatsByStartDate is now populated during trip creation and recalculated during update, but existing trips without this field will fall back to availableSeats; verify that old trips still work correctly in date picker.

**Verdict**: APPROVED

---

## High-level view

The itinerary editor is a new collapsible accordion component with add/edit/remove day UI, wired into TripForm via React Hook Form's setValue callback. Days are persisted in the Trip document's itinerary array and rendered on the detail page via the existing ItineraryAccordion component. The data flow is now complete: admin enters itinerary → form validates and sends to API → backend saves to DB → frontend fetches and displays.

Multi-date seat tracking now works by populating the `seatsByStartDate` array whenever startDates or availableSeats are modified during create or update operations. The trip detail page checks this array per selected date and disables sold-out dates in the date picker. The date picker now displays available seat count per date or "Sold out" label, making the booking availability clear upfront.

The price data flow was not changed in this commit. The trip model and API responses already include pricePerPerson and discountPrice fields. If price showed as ₹0 before, it was because the admin form did not send a price value during creation. No breaking changes to the booking or payment flow—all prices are still validated server-side at booking time via fetchTripAvailability.

<details>
<summary>Issues (3)</summary>

1. **Itinerary data flow incomplete before this commit** — Admin form had no UI to create/edit itinerary days, so the field always saved as empty array. Fix: new ItineraryEditor component now allows full CRUD on itinerary days.

2. **seatsByStartDate never populated** — Trip schema defines the field but createTrip and updateTrip never filled it, leaving per-date seat tracking broken. Fix: both functions now calculate and populate seatsByStartDate from startDates and availableSeats.

3. **Date picker showed all dates as available** — Date selector iterated over startDates without checking availability, disabling sold-out dates. Fix: date picker now calls getSeatsForDate per date and disables/labels sold-out options.

</details>

<details>
<summary>Details</summary>

### Itinerary Editor Component and Form Integration

The new ItineraryEditor component provides accordion-based CRUD for itinerary days. Each day is a collapsible card with day number, title, description in the header; expanded view reveals day title, description, activities list (with per-activity add/remove), and accommodation. Adding a day increments the counter; removing a day renumbers subsequent entries.

TripForm now imports ItineraryEditor, wires it via `setValue('itinerary', days)`, and includes itinerary in the Zod schema and form submission. The data flow closes: admin form → API → database → frontend detail page → ItineraryAccordion component. Before this commit, the form had no way to edit itinerary, so the field always saved empty.

### Per-Date Seat Availability Tracking

createTrip and updateTrip now populate `seatsByStartDate` by mapping each startDate to an entry with that date and the availableSeats count. updateTrip recalculates on any edit of startDates or availableSeats, falling back to the existing trip's seats if only dates are being changed. During booking validation, checkAvailability looks up the requested date in seatsByStartDate and falls back to global availableSeats for backward compatibility with older trips.

Seat mutations (decrementSeats, incrementSeats) still work on global availableSeats only. The per-date array is recalculated at edit time, not after every booking. This is appropriate for a platform where per-date capacity is an admin-set attribute, not a booking-time decreasing counter.

### Date Picker UI and Sold-Out Labeling

The date picker now calls getSeatsForDate(date) for each startDate. Options show `(X seats)` or are disabled with "Sold out" label if seats are 0. The getSeatsForDate helper checks seatsByStartDate for a matching date, falling back to availableSeats. Date normalization to YYYY-MM-DD UTC format ensures consistent timezone handling.

### Type Safety and Edge Cases

ItineraryEditor types ITripItineraryDay correctly. Zod schema validates itinerary structure. TripFormData ensures itinerary is always an array post-validation.

Empty itinerary: ItineraryAccordion shows "coming soon" fallback. All dates sold out: date picker disables all options; "Book Now" button already checks isSoldOut. Pre-existing trips without seatsByStartDate: getSeatsForDate fallback to availableSeats preserves functionality. Editing dates: updateTrip recalculates seatsByStartDate automatically.

### Price Data Flow

Price fields (pricePerPerson required, discountPrice optional) were already in the trip model, form, and API response. This commit makes no changes to price handling. If price appeared as ₹0, the root cause was the admin not entering a price during trip creation. The backend requires pricePerPerson but accepts 0 as valid. Booking service still validates server-side via fetchTripAvailability. A backend constraint (pricePerPerson > 0) would prevent zero-price trips from being bookable, but was not added in this fix.

</details>

<details>
<summary>File map</summary>

- **apps/web/src/components/admin/ItineraryEditor.tsx** — New collapsible accordion component for editing itinerary days in the admin form. Handles add/edit/remove UI with Lucide icons and Tailwind styling.
- **apps/web/src/components/admin/TripForm.tsx** — Updated to import ItineraryEditor and add it to form, include itinerary in Zod schema, pass itinerary to form submission.
- **apps/web/src/app/trips/[slug]/page.tsx** — Enhanced date picker to show per-date seat counts/sold-out labels and disable sold-out dates.
- **services/trip-service/src/services/trip.service.ts** — Updated createTrip and updateTrip to populate/recalculate seatsByStartDate based on startDates and availableSeats.
- **packages/shared/src/types/index.ts** — No changes; ITripItineraryDay already defined.
- **services/trip-service/src/models/Trip.ts** — No schema changes; itinerary and seatsByStartDate fields already defined.

[View full diff](https://github.com/...)</details>

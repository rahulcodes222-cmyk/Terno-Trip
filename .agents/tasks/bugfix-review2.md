# Seat decrement, confirmed status, and dual-email dispatch on booking creation

Three user-reported bugs fixed: bookings were created with `status: "Pending"` instead of `"Confirmed"`, seats were not decremented at booking time (only on payment), and no confirmation emails were sent. The fix shifts seat reservation and status finalization into `createBooking`, removes the deferred decrement from `updateBookingPaymentStatus`, and wires the existing `booking-email` notification endpoint into the booking creation path. Additionally, `decrementSeats` in trip-service now atomically decrements both the per-date slot and the global `availableSeats` counter, and marks the trip `isActive: false` when `availableSeats` reaches zero.

Watch for: (confirmed) TOCTOU race in the per-date seat path — availability is read in one Mongoose call, then decremented in a separate atomic update, meaning two concurrent bookings can both pass the in-memory guard; (confirmed) `isActive: false` is written in a second, non-atomic update after the decrement, so a concurrent reader can see `availableSeats <= 0` but `isActive: true` during the window between the two writes.

**Verdict**: NEEDS_CHANGES

---

## High-level view

`createBooking` now hard-codes `status: "Confirmed"` and `paymentStatus: "Paid"` from the moment of creation. This is a deliberate architectural decision — the system has no payment gateway flow at this time, so every booking is treated as a direct/cash booking. The corresponding seat decrement in `updateBookingPaymentStatus` was removed with a clear comment explaining why, which closes the double-decrement bug from the previous pass.

The `decrementSeats` function now decrements both `seatsByStartDate.$.availableSeats` and the global `availableSeats` in a single `$inc` operator for the per-date path. The two other code paths (fallback and legacy global) each use their own atomic `findOneAndUpdate` with a `$gte` guard. The sold-out deactivation (`isActive: false`) is applied by a follow-up `findByIdAndUpdate` after each decrement — it is not part of the same atomic operation.

Both user and admin emails are dispatched via `Promise.allSettled` inside the notification-service controller. `ADMIN_EMAIL` is read from `env` (validated by Zod schema) and is documented in the root `.env.example`. If `ADMIN_EMAIL` is empty, the admin email is silently skipped rather than erroring.

The per-date decrement path has a TOCTOU window: availability is checked against an in-memory `dateEntry.availableSeats` read before the atomic update. Two concurrent requests can both read `availableSeats = 1`, both pass the guard, and both proceed to decrement, yielding `-1` seats for that date.

---

<details>
<summary>Issues (3)</summary>

1. **TOCTOU in per-date seat path** — `decrementSeats` reads `dateEntry.availableSeats` from a `Trip.findById` result, then performs the atomic `$inc` without re-checking the count in the query filter. Two concurrent bookings for the same date can both pass the in-memory guard and both commit. Fix: add `"seatsByStartDate.$.availableSeats": { $gte: seats }` to the `findOneAndUpdate` filter, and return `null` if the update matches no document (same pattern used by the global-seats path).

2. **Non-atomic sold-out deactivation** — After each decrement, `isActive: false` is set in a separate `findByIdAndUpdate`. A concurrent trip-list query between these two writes will see a trip with `availableSeats <= 0` still listed as active. Fix: include `isActive: false` in the same `$set` as the `$inc` using a conditional update, or accept the brief inconsistency and document it explicitly.

3. **`paymentId: "Direct"` is a semantic placeholder, not a real ID** — The user email template surfaces `paymentId` as "Payment ID" to the traveller. Sending the literal string `"Direct"` is confusing. Either omit `paymentId` from the payload (the field is `optional` in `BookingEmailData`) so the template renders nothing, or add a display-conditional in the template to skip the row when no real transaction ID exists.

</details>

<details>
<summary>Details</summary>

### TOCTOU race in per-date seat decrement

The per-date path in `decrementSeats` runs two separate database operations: a `Trip.findById` to read the current `dateEntry.availableSeats`, followed by a `findOneAndUpdate` with `$inc`. The atomic guard (`$gte: seats`) lives only in the in-memory check between those two calls, not in the MongoDB filter itself. Two concurrent requests both see `availableSeats = 1`, both pass `if (dateEntry.availableSeats < seats)`, and both execute the `$inc -1`, ending at `-1` for that date slot. The global-seats paths are protected because they embed `{ availableSeats: { $gte: seats } }` directly in the `findOneAndUpdate` filter — MongoDB rejects the write if the condition isn't met at commit time. The per-date path needs the same treatment:

```ts
const result = await Trip.findOneAndUpdate(
  {
    _id: tripId,
    "seatsByStartDate.startDate": new Date(dateISO),
    "seatsByStartDate.$.availableSeats": { $gte: seats }, // ← add this
  },
  { $inc: { "seatsByStartDate.$.availableSeats": -seats, availableSeats: -seats } },
  { new: true }
).lean();

if (!result) return null; // guard handled atomically
```

Note: MongoDB's positional operator `$` in the filter and update refers to the same matched array element, so this construct is valid.

### Non-atomic sold-out deactivation

In all three `decrementSeats` branches, the sold-out check looks like:

```ts
if (result && result.availableSeats <= 0) {
  await Trip.findByIdAndUpdate(tripId, { isActive: false });
}
```

This is two round-trips. Between the `$inc` commit and the `isActive` write, `checkAvailability` (which queries `isActive: true` via `getTripById`) can still return the trip as bookable. In practice this is a very narrow window and only matters under load, but it's worth documenting. A cleaner fix is to merge the deactivation into the same `$inc` operation using `$set` in the same update document:

```ts
const update: Record<string, unknown> = {
  $inc: { availableSeats: -seats },
};
// Can't conditionally set isActive in one atomic op without transactions;
// accept the window or use a MongoDB transaction.
```

Without multi-document transactions (not currently used in this codebase) a fully atomic solution would require either an optimistic retry loop or accepting that `isActive` lags by one write.

### `paymentId: "Direct"` shown to users

`sendBookingCreatedEmail` hardcodes `paymentId: "Direct"` in the email payload. `BookingEmailData.paymentId` is optional — the template should either omit the row entirely when no real ID exists, or the caller should omit the field. Sending "Direct" as a payment reference will confuse travellers who don't know what it means.

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|------|-------------|
| `services/booking-service/src/services/booking.service.ts` | Status set to `"Confirmed"/"Paid"` at creation; `sendBookingCreatedEmail` wired in; double-decrement in `updateBookingPaymentStatus` removed; `availableSeats` now returned from `fetchTripAvailability` |
| `services/trip-service/src/services/trip.service.ts` | `decrementSeats` now decrements global `availableSeats` alongside per-date slot; sold-out deactivation (`isActive: false`) added to all three branches |
| `services/booking-service/src/__tests__/booking.test.ts` | Tests updated to reflect `"Confirmed"` status and email dispatch |

Full diff: `git diff HEAD~2..HEAD`

</details>

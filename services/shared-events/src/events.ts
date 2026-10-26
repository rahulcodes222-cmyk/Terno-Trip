// ─── Event Name Constants ─────────────────────────────────────────────────────
// Use these string constants everywhere — never hard-code event name strings.
// This ensures consistency between publishers and subscribers and makes
// global renaming safe.

export const BOOKING_CREATED = "booking.created" as const;
export const BOOKING_CONFIRMED = "booking.confirmed" as const;
export const BOOKING_CANCELLED = "booking.cancelled" as const;
export const PAYMENT_SUCCEEDED = "payment.succeeded" as const;
export const PAYMENT_FAILED = "payment.failed" as const;

// ─── Event Payload Interfaces ─────────────────────────────────────────────────
// Each event type has a strongly-typed payload interface.
// Import these types alongside the constants in both publishers and subscribers.

/** Emitted by booking-service when a new booking is created (status: Pending). */
export interface BookingCreatedPayload {
  bookingId: string;
  userId: string;
  tripId: string;
  totalAmount: number;
  contactEmail: string;
  bookingRef: string;
  departureDate: string;
}

/** Emitted by booking-service when a booking transitions to Confirmed. */
export interface BookingConfirmedPayload {
  bookingId: string;
  userId: string;
  bookingRef: string;
  tripTitle: string;
  contactEmail: string;
  departureDate: string;
  totalAmount: number;
}

/** Emitted by booking-service when a booking is cancelled by the user or system. */
export interface BookingCancelledPayload {
  bookingId: string;
  userId: string;
  bookingRef: string;
  contactEmail: string;
  reason?: string;
}

/** Emitted by payment-service after a successful payment confirmation. */
export interface PaymentSucceededPayload {
  bookingId: string;
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  providerPaymentId?: string;
}

/** Emitted by payment-service when a payment attempt fails definitively. */
export interface PaymentFailedPayload {
  bookingId: string;
  paymentId: string;
  userId: string;
  reason: string;
}

// ─── Event Map Type ───────────────────────────────────────────────────────────
// A convenience type that maps each constant to its payload, useful for
// type-safe wrapper functions or future broker adapters.

export interface TernoEventMap {
  [BOOKING_CREATED]: BookingCreatedPayload;
  [BOOKING_CONFIRMED]: BookingConfirmedPayload;
  [BOOKING_CANCELLED]: BookingCancelledPayload;
  [PAYMENT_SUCCEEDED]: PaymentSucceededPayload;
  [PAYMENT_FAILED]: PaymentFailedPayload;
}

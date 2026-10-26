// ─── @terno/shared-events ─────────────────────────────────────────────────────
// Re-export the EventBus singleton and all event name constants + payload types.
//
// Usage:
//   import { eventBus, BOOKING_CREATED, BookingCreatedPayload } from '@terno/shared-events';

export { eventBus, EventBus } from "./EventBus.js";

export {
  // Event name constants
  BOOKING_CREATED,
  BOOKING_CONFIRMED,
  BOOKING_CANCELLED,
  PAYMENT_SUCCEEDED,
  PAYMENT_FAILED,
} from "./events.js";

export type {
  // Payload interfaces
  BookingCreatedPayload,
  BookingConfirmedPayload,
  BookingCancelledPayload,
  PaymentSucceededPayload,
  PaymentFailedPayload,
  TernoEventMap,
} from "./events.js";

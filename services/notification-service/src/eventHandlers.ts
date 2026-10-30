/**
 * Event Handlers for @terno/shared-events
 *
 * ⚠️  IMPORTANT — CROSS-PROCESS LIMITATION:
 * These handlers register on the in-process EventEmitter singleton from
 * @terno/shared-events. They will ONLY fire if the publisher (booking-service
 * or payment-service) is running in THE SAME process.
 *
 * Because each service runs as a separate Node.js process, these handlers
 * will NOT be triggered by events emitted from other services.
 *
 * For cross-process event delivery, booking-service and payment-service
 * call notification-service's HTTP endpoint directly:
 *   POST /api/v1/internal/notifications
 *
 * These in-process handlers are kept here as documentation and for any
 * future single-process mode (e.g. testing, local monolith mode).
 * When a message broker (RabbitMQ, SQS, Redis Streams) is introduced,
 * replace the HTTP calls in other services with broker.publish() and
 * replace these handlers with broker.subscribe() here.
 */

import {
  eventBus,
  BOOKING_CREATED,
  BOOKING_CANCELLED,
  PAYMENT_SUCCEEDED,
  PAYMENT_FAILED,
} from "@terno/shared-events";
import type {
  BookingCreatedPayload,
  BookingCancelledPayload,
  PaymentSucceededPayload,
  PaymentFailedPayload,
} from "@terno/shared-events";
import * as notificationService from "./services/notification.service.js";

export function registerEventHandlers(): void {
  // In-process only — see module-level comment above
  eventBus.on(BOOKING_CREATED, async (payload) => {
    const p = payload as BookingCreatedPayload;
    await notificationService.createNotification(
      p.userId,
      "Booking Received",
      `Your booking for trip has been received and is pending payment. Ref: ${p.bookingRef}`,
      "booking",
      { bookingId: p.bookingId, bookingRef: p.bookingRef }
    );
  });

  eventBus.on(PAYMENT_SUCCEEDED, async (payload) => {
    const p = payload as PaymentSucceededPayload;
    await notificationService.createNotification(
      p.userId,
      "Payment Confirmed",
      `Your payment of ₹${p.amount.toLocaleString("en-IN")} was successful. Booking is confirmed.`,
      "payment",
      { bookingId: p.bookingId, paymentId: p.paymentId }
    );
  });

  eventBus.on(PAYMENT_FAILED, async (payload) => {
    const p = payload as PaymentFailedPayload;
    await notificationService.createNotification(
      p.userId,
      "Payment Failed",
      `Your payment failed. Reason: ${p.reason}. Please try again.`,
      "payment",
      { bookingId: p.bookingId }
    );
  });

  eventBus.on(BOOKING_CANCELLED, async (payload) => {
    const p = payload as BookingCancelledPayload;
    await notificationService.createNotification(
      p.userId,
      "Booking Cancelled",
      `Your booking ${p.bookingRef} has been cancelled.`,
      "booking",
      { bookingId: p.bookingId, bookingRef: p.bookingRef }
    );
  });

  console.log("✅  In-process event handlers registered (note: cross-process events use HTTP)");
}

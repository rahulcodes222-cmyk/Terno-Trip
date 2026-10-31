/**
 * Payment Service — Business Logic
 *
 * CROSS-PROCESS EVENT BUS NOTE:
 * Because each microservice runs as a separate OS process, the in-memory
 * EventEmitter in @terno/shared-events is NOT shared across processes.
 *
 * Instead, after processing a payment, we make direct HTTP calls to:
 *   - booking-service  POST /api/v1/internal/bookings/update-payment
 *   - notification-service POST /api/v1/internal/notifications
 *
 * These HTTP calls replace what would be event bus emits (PAYMENT_SUCCEEDED,
 * PAYMENT_FAILED) in a single-process or broker-based architecture.
 * They can be replaced by a real message broker later without changing the
 * business logic — just swap the HTTP calls for broker.publish() calls.
 */

import { Payment, type IPaymentDocument } from "../models/Payment.js";
import { MockPaymentProvider } from "../providers/MockPaymentProvider.js";
import { CashfreePaymentProvider } from "../providers/CashfreePaymentProvider.js";
import type { PaymentScenario } from "../providers/PaymentProvider.interface.js";
import { env } from "../config/env.js";

// ─── Provider registry ────────────────────────────────────────────────────────

const providers = {
  mock: new MockPaymentProvider(),
  cashfree: new CashfreePaymentProvider(),
};

function getProvider() {
  const name = env.PAYMENT_PROVIDER;
  const provider = providers[name as keyof typeof providers];
  if (!provider) {
    throw new Error(`No payment provider registered for: ${name}`);
  }
  return provider;
}

// ─── Internal HTTP helpers ────────────────────────────────────────────────────

function generatePaymentRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "PAY-";
  for (let i = 0; i < 8; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

async function notifyBookingService(
  bookingId: string,
  paymentStatus: "Paid" | "Failed",
  paymentId?: string
): Promise<void> {
  // HTTP call to booking-service (cross-process — EventEmitter doesn't cross OS process boundaries)
  try {
    await fetch(`${env.BOOKING_SERVICE_URL}/api/v1/internal/bookings/update-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify({ bookingId, paymentStatus, paymentId }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("[payment-service] Failed to update booking payment status:", err);
  }
}

async function notifyUserPayment(
  userId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  // HTTP call to notification-service (cross-process)
  try {
    await fetch(`${env.NOTIFICATION_SERVICE_URL}/api/v1/internal/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify({ userId, title, message, type: "payment", metadata }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("[payment-service] Failed to send notification:", err);
  }
}

async function sendBookingConfirmationEmail(payload: {
  userName: string;
  userEmail: string;
  bookingRef: string;
  tripTitle: string;
  destination: string;
  departureDate: string;
  travellersCount: number;
  totalAmount: number;
  paymentId?: string;
}): Promise<void> {
  try {
    await fetch(`${env.NOTIFICATION_SERVICE_URL}/api/v1/internal/notifications/booking-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    console.error("[payment-service] Failed to send booking confirmation email:", err);
  }
}

// ─── Create Order ─────────────────────────────────────────────────────────────

export async function createOrder(
  bookingId: string,
  userId: string,
  amount: number,
  currency = "INR",
  userMeta?: { userId?: string; email?: string; phone?: string }
): Promise<{ payment: IPaymentDocument; orderId: string; amount: number; paymentSessionId?: string }> {
  const provider = getProvider();
  const paymentRef = generatePaymentRef();

  // Create pending payment record
  const payment = new Payment({
    paymentRef,
    bookingId,
    userId,
    amount,
    currency,
    provider: env.PAYMENT_PROVIDER,
    status: "Pending",
  });
  await payment.save();

  // Create order with provider (pass user metadata for Cashfree customer_details)
  const orderResult = await provider.createOrder(bookingId, amount, currency, {
    paymentRef,
    userId,
    email: userMeta?.email,
    phone: userMeta?.phone,
  });

  // Store provider order ID
  payment.providerOrderId = orderResult.orderId;
  await payment.save();

  return {
    payment,
    orderId: orderResult.orderId,
    amount: orderResult.amount,
    // paymentSessionId returned by Cashfree — used by frontend Cashfree JS SDK
    paymentSessionId: orderResult.providerData?.paymentSessionId as string | undefined,
  };
}

// ─── Fetch Booking Details (for email) ───────────────────────────────────────

interface BookingDetails {
  bookingRef: string;
  tripSnapshot: { title: string; destination: string };
  departureDate: string;
  travellers: unknown[];
  totalAmount: number;
  contactEmail: string;
  userId: string;
}

async function fetchBookingDetails(bookingId: string): Promise<BookingDetails | null> {
  try {
    const res = await fetch(`${env.BOOKING_SERVICE_URL}/api/v1/internal/bookings/${bookingId}`, {
      headers: { "x-internal-secret": env.INTERNAL_SERVICE_SECRET },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: BookingDetails };
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─── Process Payment ──────────────────────────────────────────────────────────

export async function processPayment(
  internalPaymentId: string,
  scenario: PaymentScenario = "success"
): Promise<IPaymentDocument> {
  const payment = await Payment.findById(internalPaymentId);
  if (!payment) throw new Error("Payment record not found");

  const provider = getProvider();

  try {
    const result = await provider.capturePayment(
      payment.providerOrderId ?? payment.paymentRef,
      scenario
    );

    if (result.status === "Success") {
      payment.status = "Success";
      payment.providerPaymentId = result.paymentId;
      await payment.save();

      // Fetch booking details for email (best-effort)
      const bookingDetails = await fetchBookingDetails(payment.bookingId);

      // Notify booking-service and user via HTTP (cross-process)
      const notifications: Promise<void>[] = [
        notifyBookingService(payment.bookingId, "Paid", String(payment._id)),
        notifyUserPayment(
          payment.userId,
          "Payment Confirmed",
          `Your payment of ₹${payment.amount.toLocaleString("en-IN")} was successful. Booking has been confirmed.`,
          {
            bookingId: payment.bookingId,
            paymentId: String(payment._id),
            amount: payment.amount,
          }
        ),
      ];

      // Send confirmation emails (user + admin) if we have booking details
      if (bookingDetails) {
        notifications.push(
          sendBookingConfirmationEmail({
            userName: "Traveller", // Will be enriched if user-service data available
            userEmail: bookingDetails.contactEmail,
            bookingRef: bookingDetails.bookingRef,
            tripTitle: bookingDetails.tripSnapshot?.title ?? "Your Trip",
            destination: bookingDetails.tripSnapshot?.destination ?? "",
            departureDate: new Date(bookingDetails.departureDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            }),
            travellersCount: bookingDetails.travellers?.length ?? 1,
            totalAmount: payment.amount,
            paymentId: String(payment._id),
          })
        );
      }

      await Promise.all(notifications);
    } else if (result.status === "Failed") {
      payment.status = "Failed";
      payment.failureReason = result.reason ?? "Payment failed";
      await payment.save();

      await Promise.all([
        notifyBookingService(payment.bookingId, "Failed"),
        notifyUserPayment(
          payment.userId,
          "Payment Failed",
          `Your payment for booking failed. Reason: ${payment.failureReason}. Please try again.`,
          { bookingId: payment.bookingId, reason: payment.failureReason }
        ),
      ]);
    } else if (result.status === "Pending") {
      payment.status = "Pending";
      await payment.save();
      // No downstream notification — awaiting async confirmation from gateway
    }
  } catch (err) {
    // Timeout or unexpected provider error
    payment.status = "Failed";
    payment.failureReason = err instanceof Error ? err.message : "Unknown error";
    await payment.save();

    await Promise.all([
      notifyBookingService(payment.bookingId, "Failed"),
      notifyUserPayment(
        payment.userId,
        "Payment Failed",
        `Payment processing error: ${payment.failureReason}. Please try again.`,
        { bookingId: payment.bookingId }
      ),
    ]);

    throw err;
  }

  return payment;
}

// ─── Get Payment Status ───────────────────────────────────────────────────────

export async function getPaymentById(
  id: string
): Promise<IPaymentDocument | null> {
  return Payment.findById(id).lean() as Promise<IPaymentDocument | null>;
}

// ─── Refund Payment ───────────────────────────────────────────────────────────

export async function refundPayment(
  paymentId: string
): Promise<IPaymentDocument> {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");

  if (payment.status !== "Success") {
    throw new Error(`Cannot refund a payment with status: ${payment.status}`);
  }

  const provider = getProvider();
  const refundResult = await provider.refund(
    payment.providerPaymentId ?? payment.paymentRef
  );

  if (refundResult.status === "Refunded") {
    payment.status = "Refunded";
    await payment.save();

    // Notify booking-service
    await notifyBookingService(payment.bookingId, "Failed", undefined);
  } else {
    throw new Error(refundResult.reason ?? "Refund failed");
  }

  return payment;
}

// ─── Handle Cashfree Webhook ──────────────────────────────────────────────────
// Called by cashfreeWebhook controller when Cashfree posts to our webhook URL.

export async function handleWebhook(
  providerOrderId: string,
  orderStatus: string
): Promise<void> {
  const payment = await Payment.findOne({ providerOrderId });
  if (!payment) {
    console.warn(`[payment-service] Webhook: no payment found for order ${providerOrderId}`);
    return;
  }

  // Avoid re-processing already finalised payments
  if (payment.status === "Success" || payment.status === "Refunded") return;

  const status = orderStatus.toUpperCase();

  if (status === "PAID") {
    payment.status = "Success";
    await payment.save();

    // Fetch booking details for email
    const bookingDetails = await fetchBookingDetails(payment.bookingId);

    const promises: Promise<void>[] = [
      notifyBookingService(payment.bookingId, "Paid", String(payment._id)),
      notifyUserPayment(
        payment.userId,
        "Payment Confirmed",
        `Your payment of ₹${payment.amount.toLocaleString("en-IN")} was successful. Booking has been confirmed.`,
        { bookingId: payment.bookingId, paymentId: String(payment._id), amount: payment.amount }
      ),
    ];

    if (bookingDetails) {
      promises.push(
        sendBookingConfirmationEmail({
          userName: "Traveller",
          userEmail: bookingDetails.contactEmail,
          bookingRef: bookingDetails.bookingRef,
          tripTitle: bookingDetails.tripSnapshot?.title ?? "Your Trip",
          destination: bookingDetails.tripSnapshot?.destination ?? "",
          departureDate: new Date(bookingDetails.departureDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          travellersCount: bookingDetails.travellers?.length ?? 1,
          totalAmount: payment.amount,
          paymentId: String(payment._id),
        })
      );
    }

    await Promise.all(promises);

  } else if (status === "EXPIRED" || status === "TERMINATED") {
    payment.status = "Failed";
    payment.failureReason = `Cashfree order ${status.toLowerCase()}`;
    await payment.save();

    await Promise.all([
      notifyBookingService(payment.bookingId, "Failed"),
      notifyUserPayment(
        payment.userId,
        "Payment Failed",
        `Your payment could not be processed. Reason: ${payment.failureReason}. Please try again.`,
        { bookingId: payment.bookingId }
      ),
    ]);
  }
}

import type { Request, Response, NextFunction } from "express";
import { createApiResponse } from "@terno/shared";
import * as paymentService from "../services/payment.service.js";
import type { PaymentScenario } from "../providers/PaymentProvider.interface.js";
import { env } from "../config/env.js";

// ─── Resolve bookingRef → bookingId ──────────────────────────────────────────
// Frontend sends bookingRef (e.g. "TERNO-ABC123"). We resolve it to the
// MongoDB _id here so the payment record stores the correct bookingId.

async function resolveBookingId(bookingRef: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${env.BOOKING_SERVICE_URL}/api/v1/internal/bookings/ref/${bookingRef}`,
      {
        headers: { "x-internal-secret": env.INTERNAL_SERVICE_SECRET },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { _id?: string } };
    return json.data?._id ?? null;
  } catch {
    return null;
  }
}

// ─── Create Payment Order ─────────────────────────────────────────────────────

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { bookingRef, amount, currency, email, phone } = req.body as {
      bookingRef: string;
      amount: number;
      currency?: string;
      email?: string;
      phone?: string;
    };

    if (!bookingRef || amount === undefined) {
      res
        .status(400)
        .json({ success: false, message: "bookingRef and amount are required" });
      return;
    }

    // Resolve bookingRef → MongoDB _id (used for all downstream calls)
    let bookingId = await resolveBookingId(bookingRef);
    if (!bookingId) {
      // If resolution fails (e.g. booking-service down), use bookingRef as fallback
      // so payment can still be stored and reconciled later
      bookingId = bookingRef;
    }

    const result = await paymentService.createOrder(
      bookingId,
      userId,
      amount,
      currency,
      { userId, email, phone }
    );

    res.status(201).json(
      createApiResponse(
        {
          // paymentRef = MongoDB _id of our internal Payment record
          // Used by frontend to call /process and /status endpoints
          paymentRef: String(result.payment._id),
          orderId: result.orderId,
          amount: result.amount,
          currency: result.payment.currency,
          status: result.payment.status,
          // Cashfree paymentSessionId — used by Cashfree JS SDK on frontend
          paymentSessionId: result.paymentSessionId,
        },
        "Payment order created"
      )
    );
  } catch (err) {
    next(err);
  }
}

// ─── Process / Verify Payment ─────────────────────────────────────────────────
// For Cashfree: after SDK popup closes with success, we verify server-side.
// For mock: passes through the scenario for testing.

export async function processPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const scenario = (req.body as { scenario?: PaymentScenario }).scenario ?? "success";
    const payment = await paymentService.processPayment(req.params.id, scenario);

    res
      .status(200)
      .json(createApiResponse(payment, `Payment processed: ${payment.status}`));
  } catch (err) {
    next(err);
  }
}

// ─── Get Payment Status ───────────────────────────────────────────────────────

export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }
    res.status(200).json(createApiResponse(payment, "Payment status fetched"));
  } catch (err) {
    next(err);
  }
}

// ─── Refund Payment ───────────────────────────────────────────────────────────

export async function refundPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payment = await paymentService.refundPayment(req.params.id);
    res.status(200).json(createApiResponse(payment, "Payment refunded successfully"));
  } catch (err) {
    next(err);
  }
}

// ─── Cashfree Webhook ─────────────────────────────────────────────────────────
// Cashfree POSTs here after payment status changes.
// No auth middleware — identified by payload structure.

export async function cashfreeWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as {
      data?: {
        order?: { order_id?: string; order_status?: string };
        payment?: { cf_payment_id?: string; payment_status?: string };
      };
      type?: string;
    };

    const orderId = body?.data?.order?.order_id;
    const orderStatus = body?.data?.order?.order_status;

    if (!orderId) {
      res.status(400).json({ success: false, message: "Invalid webhook payload" });
      return;
    }

    await paymentService.handleWebhook(orderId, orderStatus ?? "");

    // Always 200 so Cashfree doesn't retry
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

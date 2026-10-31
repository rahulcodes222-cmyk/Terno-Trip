/**
 * Cashfree Payment Provider
 *
 * Uses the official cashfree-pg SDK (instance-based API).
 * Set CASHFREE_ENV="sandbox" for testing, "production" for live.
 *
 * Correct method signatures (verified from SDK source):
 *   PGCreateOrder(CreateOrderRequest)
 *   PGFetchOrder(order_id: string)
 *   PGOrderCreateRefund(order_id: string, OrderCreateRefundRequest)
 */

import { Cashfree, CFEnvironment } from "cashfree-pg";
import type {
  IPaymentProvider,
  CreateOrderResult,
  PaymentResult,
  RefundResult,
} from "./PaymentProvider.interface.js";
import { env } from "../config/env.js";

export class CashfreePaymentProvider implements IPaymentProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor() {
    const cfEnv =
      env.CASHFREE_ENV === "production"
        ? CFEnvironment.PRODUCTION
        : CFEnvironment.SANDBOX;

    this.client = new Cashfree(cfEnv, env.CASHFREE_APP_ID, env.CASHFREE_SECRET_KEY);
  }

  async createOrder(
    bookingId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>
  ): Promise<CreateOrderResult> {
    const orderId = `TERNO-${Date.now()}-${bookingId.slice(-6).toUpperCase()}`;

    const request = {
      order_id: orderId,
      order_amount: amount,
      order_currency: currency ?? "INR",
      customer_details: {
        customer_id: String(metadata?.userId ?? `user-${Date.now()}`),
        customer_email: String(metadata?.email ?? "customer@terntrip.com"),
        customer_phone: String(metadata?.phone ?? "9999999999"),
        customer_name: String(metadata?.name ?? "Traveller"),
      },
      order_meta: {
        return_url: `${env.FRONTEND_URL}/bookings?order_id={order_id}`,
        ...(env.PAYMENT_WEBHOOK_URL ? { notify_url: env.PAYMENT_WEBHOOK_URL } : {}),
      },
      order_tags: {
        bookingId,
        paymentRef: String(metadata?.paymentRef ?? ""),
      },
    };

    // SDK: PGCreateOrder(CreateOrderRequest)
    const response = await this.client.PGCreateOrder(request);
    const data = response.data as {
      order_id: string;
      order_amount: number;
      payment_session_id: string;
    };

    return {
      orderId: data.order_id,
      amount: data.order_amount,
      currency,
      providerData: {
        paymentSessionId: data.payment_session_id,
        bookingId,
        metadata,
      },
    };
  }

  async capturePayment(orderId: string): Promise<PaymentResult> {
    // SDK: PGFetchOrder(order_id: string)
    const response = await this.client.PGFetchOrder(orderId);
    const data = response.data as {
      order_status: string;
      cf_order_id: string | number;
    };

    const status = (data.order_status ?? "").toUpperCase();

    if (status === "PAID") {
      return {
        status: "Success",
        paymentId: `CF-${data.cf_order_id ?? orderId}`,
      };
    } else if (status === "EXPIRED" || status === "TERMINATED") {
      return {
        status: "Failed",
        reason: `Cashfree order ${status.toLowerCase()}`,
      };
    } else {
      // ACTIVE, PENDING — payment not yet confirmed
      return { status: "Pending" };
    }
  }

  async refund(providerOrderId: string): Promise<RefundResult> {
    const refundId = `REF-${Date.now()}`;
    try {
      const refundRequest = {
        refund_id: refundId,
        refund_amount: 0, // 0 means full refund; caller can extend for partial
      };
      // SDK: PGOrderCreateRefund(order_id: string, OrderCreateRefundRequest)
      await this.client.PGOrderCreateRefund(providerOrderId, refundRequest);
      return { status: "Refunded", refundId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refund failed";
      return { status: "Failed", reason: msg };
    }
  }
}

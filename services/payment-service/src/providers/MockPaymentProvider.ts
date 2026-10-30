/**
 * MOCK PROVIDER — replace with real gateway (Razorpay, Stripe, etc.) in production.
 *
 * This provider simulates four payment scenarios:
 *   - 'success'  : 200ms delay, returns Success with a mock payment ID
 *   - 'failure'  : immediate return, returns Failed with reason
 *   - 'pending'  : no delay, returns Pending status (simulates async gateway)
 *   - 'timeout'  : 3000ms delay then throws Error('Payment timeout')
 *
 * Default scenario is 'success'.
 */

import { sleep } from "@terno/shared";
import type {
  IPaymentProvider,
  CreateOrderResult,
  PaymentResult,
  RefundResult,
  PaymentScenario,
} from "./PaymentProvider.interface.js";

function mockId(prefix: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = `${prefix}-`;
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export class MockPaymentProvider implements IPaymentProvider {
  async createOrder(
    bookingId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>
  ): Promise<CreateOrderResult> {
    const orderId = mockId("MOCK-ORD");
    return {
      orderId,
      amount,
      currency,
      providerData: { bookingId, metadata, createdAt: new Date().toISOString() },
    };
  }

  async capturePayment(
    orderId: string,
    scenario: PaymentScenario = "success"
  ): Promise<PaymentResult> {
    switch (scenario) {
      case "success":
        await sleep(200);
        return {
          status: "Success",
          paymentId: mockId("MOCK-PAY"),
        };

      case "failure":
        // Immediate return — no delay
        return {
          status: "Failed",
          reason: "Insufficient funds (mock)",
        };

      case "pending":
        // No delay — gateway has accepted but not yet confirmed
        return {
          status: "Pending",
        };

      case "timeout":
        await sleep(3000);
        throw new Error("Payment timeout");

      default:
        // TypeScript exhaustive check
        throw new Error(`Unknown scenario: ${scenario as string}`);
    }
  }

  async refund(paymentId: string): Promise<RefundResult> {
    await sleep(100);
    return {
      status: "Refunded",
      refundId: mockId("MOCK-REF"),
    };
  }
}

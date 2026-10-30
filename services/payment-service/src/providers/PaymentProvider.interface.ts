// ─── Payment Provider Interface ───────────────────────────────────────────────
// All payment providers (mock, Razorpay, Stripe, etc.) must implement this
// interface. This enables swapping providers without changing business logic.

export type PaymentScenario = "success" | "failure" | "pending" | "timeout";

export interface CreateOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  providerData?: Record<string, unknown>;
}

export interface PaymentResult {
  status: "Success" | "Failed" | "Pending";
  paymentId?: string;
  reason?: string;
}

export interface RefundResult {
  status: "Refunded" | "Failed";
  refundId?: string;
  reason?: string;
}

export interface IPaymentProvider {
  /**
   * Creates a payment order/intent with the payment provider.
   * Returns the provider-side order ID and amount confirmation.
   */
  createOrder(
    bookingId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>
  ): Promise<CreateOrderResult>;

  /**
   * Captures or confirms a payment for the given order.
   * @param orderId  - The provider-side order ID
   * @param scenario - For mock: controls the simulated outcome
   */
  capturePayment(orderId: string, scenario?: PaymentScenario): Promise<PaymentResult>;

  /**
   * Issues a refund for a completed payment.
   */
  refund(paymentId: string): Promise<RefundResult>;
}

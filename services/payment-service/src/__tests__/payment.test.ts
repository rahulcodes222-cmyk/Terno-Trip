/**
 * Payment Service — Unit Tests
 * MockPaymentProvider tested directly; Payment model mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPayment = {
  _id: "pay123",
  paymentRef: "PAY4A2F8B",
  bookingRef: "TRN4A2F8B",
  userId: "user123",
  amount: 9449,
  currency: "INR",
  provider: "mock",
  status: "Pending",
  orderId: "MOCK-ORD-ABCD1234",
  save: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../models/Payment.js", () => ({
  Payment: {
    create: vi.fn().mockResolvedValue({ ...mockPayment }),
    findOne: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue({ ...mockPayment, save: vi.fn() }),
  },
}));

vi.mock("../config/env.js", () => ({
  env: {
    NODE_ENV: "development",
    PORT: 4005,
    MONGODB_URI: "mongodb://localhost/test",
    INTERNAL_SERVICE_SECRET: "test-secret",
    BOOKING_SERVICE_URL: "http://localhost:4004",
    PAYMENT_PROVIDER: "mock",
  },
}));

global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MockPaymentProvider", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createOrder returns a MOCK-ORD- prefixed orderId", async () => {
    const { MockPaymentProvider } = await import("../providers/MockPaymentProvider.js");
    const provider = new MockPaymentProvider();
    const result = await provider.createOrder("TRN4A2F8B", 9449, "INR");
    expect(result.orderId).toMatch(/^MOCK-ORD-/);
    expect(result.amount).toBe(9449);
  });

  it("capturePayment with 'success' scenario returns Success status", async () => {
    const { MockPaymentProvider } = await import("../providers/MockPaymentProvider.js");
    const provider = new MockPaymentProvider();
    const order = await provider.createOrder("TRN4A2F8B", 9449, "INR");
    const result = await provider.capturePayment(order.orderId, "success");
    expect(result.status).toBe("Success");
    expect(result.paymentId).toMatch(/^MOCK-PAY-/);
  });

  it("capturePayment with 'failure' scenario returns Failed status", async () => {
    const { MockPaymentProvider } = await import("../providers/MockPaymentProvider.js");
    const provider = new MockPaymentProvider();
    const order = await provider.createOrder("TRN4A2F8B", 9449, "INR");
    const result = await provider.capturePayment(order.orderId, "failure");
    expect(result.status).toBe("Failed");
    expect(result.reason).toBeTruthy();
  });

  it("capturePayment with 'pending' scenario returns Pending status", async () => {
    const { MockPaymentProvider } = await import("../providers/MockPaymentProvider.js");
    const provider = new MockPaymentProvider();
    const order = await provider.createOrder("TRN4A2F8B", 9449, "INR");
    const result = await provider.capturePayment(order.orderId, "pending");
    expect(result.status).toBe("Pending");
  });
});

describe("Payment Service — production guard", () => {
  it("processPayment with mock provider in production returns 403", async () => {
    // Temporarily override NODE_ENV
    const { env } = await import("../config/env.js");
    const originalEnv = env.NODE_ENV;
    (env as { NODE_ENV: string }).NODE_ENV = "production";

    const { Payment } = await import("../models/Payment.js");
    (Payment.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...mockPayment,
      provider: "mock",
      status: "Pending",
      save: vi.fn(),
    });

    const { processPayment } = await import("../services/payment.service.js");
    await expect(processPayment("pay123", "user123", "success"))
      .rejects.toThrow();

    (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
  });
});

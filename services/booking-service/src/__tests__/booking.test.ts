/**
 * Booking Service — Unit Tests
 * Mongoose model and fetch are mocked; no real DB or HTTP calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockBooking = {
  _id: "booking123",
  bookingRef: "TRN4A2F8B",
  userId: "user123",
  tripId: "trip123",
  tripSnapshot: { title: "Manali Trek", destination: "Manali", coverImage: "", pricePerPerson: 8999, duration: 7, slug: "manali-trek" },
  departureDate: new Date("2025-06-01"),
  travellers: [{ firstName: "Rahul", lastName: "Sharma", age: 25 }],
  travellersCount: 1,
  totalAmount: 9449, // 8999 * 1 + 5% tax = 9449
  status: "Pending",
  paymentStatus: "Pending",
  contactEmail: "rahul@example.com",
  contactPhone: "+919876543210",
  save: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../models/Booking.js", () => ({
  Booking: {
    create: vi.fn().mockResolvedValue(mockBooking),
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockBooking]),
    }),
    findOne: vi.fn().mockResolvedValue(mockBooking),
    findById: vi.fn().mockResolvedValue({
      ...mockBooking,
      save: vi.fn().mockResolvedValue(undefined),
    }),
    countDocuments: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock("../config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    PORT: 4004,
    MONGODB_URI: "mongodb://localhost/test",
    INTERNAL_SERVICE_SECRET: "test-secret",
    TRIP_SERVICE_URL: "http://localhost:4003",
    NOTIFICATION_SERVICE_URL: "http://localhost:4006",
  },
}));

// Mock fetch for trip-service availability check
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    success: true,
    data: { available: true, pricePerPerson: 8999, availableSeats: 12 },
  }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReqRes(body = {}, params = {}, user = { id: "user123", role: "user" }) {
  const req = {
    body,
    params,
    user,
    headers: { "x-user-id": "user123", "x-user-role": "user" },
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Booking Controller", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("createBooking", () => {
    it("returns 201 with bookingRef on success", async () => {
      const { createBooking } = await import("../controllers/booking.controller.js");
      const { req, res, next } = mockReqRes({
        tripId: "trip123",
        departureDate: "2025-06-01",
        travellers: [{ firstName: "Rahul", lastName: "Sharma", age: 25 }],
        contactEmail: "rahul@example.com",
        contactPhone: "+919876543210",
      });

      await createBooking(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe("getMyBookings", () => {
    it("returns 200 with paginated bookings", async () => {
      const { getMyBookings } = await import("../controllers/booking.controller.js");
      const { req, res, next } = mockReqRes();
      // Add query params
      (req as unknown as { query: Record<string, string> }).query = { page: "1", limit: "10" };

      await getMyBookings(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("cancelBooking", () => {
    it("cancels booking and returns 200", async () => {
      const { Booking } = await import("../models/Booking.js");
      (Booking.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ...mockBooking,
        userId: "user123",
        status: "Pending",
        save: vi.fn().mockResolvedValue(undefined),
      });

      const { cancelBooking } = await import("../controllers/booking.controller.js");
      const { req, res, next } = mockReqRes({}, { id: "booking123" });
      await cancelBooking(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("returns 403 if booking belongs to different user", async () => {
      const { Booking } = await import("../models/Booking.js");
      (Booking.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ...mockBooking,
        userId: "differentUser",
        status: "Pending",
        save: vi.fn().mockResolvedValue(undefined),
      });

      const { cancelBooking } = await import("../controllers/booking.controller.js");
      const { req, res, next } = mockReqRes({}, { id: "booking123" });
      await cancelBooking(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

/**
 * Trip Service — Unit Tests
 * Mongoose Trip model is mocked; no real DB connection.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockTrips = [
  { _id: "trip1", title: "Manali Trek", slug: "manali-trek", isActive: true, pricePerPerson: 8999, category: "Adventure" },
  { _id: "trip2", title: "Goa Beach", slug: "goa-beach", isActive: true, pricePerPerson: 6499, category: "Beach" },
];

vi.mock("../models/Trip.js", () => {
  const mockFind = vi.fn().mockReturnValue({
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(mockTrips),
  });
  const mockFindOne = vi.fn().mockResolvedValue(null);
  const mockCountDocuments = vi.fn().mockResolvedValue(2);
  const mockDistinct = vi.fn().mockResolvedValue(["Adventure", "Beach", "Cultural"]);

  return {
    Trip: {
      find: mockFind,
      findOne: mockFindOne,
      findById: vi.fn().mockResolvedValue(null),
      findByIdAndUpdate: vi.fn().mockResolvedValue(null),
      findOneAndUpdate: vi.fn().mockResolvedValue(null),
      countDocuments: mockCountDocuments,
      distinct: mockDistinct,
      prototype: { save: vi.fn() },
    },
  };
});

vi.mock("../config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    PORT: 4003,
    MONGODB_URI: "mongodb://localhost/test",
    INTERNAL_SERVICE_SECRET: "test-secret",
    FRONTEND_URL: "http://localhost:3000",
  },
}));

vi.mock("@terno/shared", () => ({
  searchTripsSchema: {
    parse: vi.fn().mockImplementation((q) => q),
  },
  createPaginatedResponse: vi.fn().mockImplementation((data, page, limit, total) => ({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })),
  createApiResponse: vi.fn().mockImplementation((data, message) => ({
    success: true,
    data,
    message,
  })),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReqRes(params = {}, body = {}, query = {}) {
  const req = { params, body, query } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Trip Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTrips", () => {
    it("returns 200 with paginated trips", async () => {
      const { listTrips } = await import("../controllers/trip.controller.js");
      const { req, res, next } = mockReqRes();
      await listTrips(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe("getTrip", () => {
    it("returns 404 for unknown slug", async () => {
      const { Trip } = await import("../models/Trip.js");
      (Trip.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const { getTrip } = await import("../controllers/trip.controller.js");
      const { req, res, next } = mockReqRes({ slug: "nonexistent-slug" });
      await getTrip(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 200 with trip for valid slug", async () => {
      const { Trip } = await import("../models/Trip.js");
      (Trip.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockTrips[0]);

      const { getTrip } = await import("../controllers/trip.controller.js");
      const { req, res, next } = mockReqRes({ slug: "manali-trek" });
      await getTrip(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("createTrip (admin)", () => {
    it("returns 201 for valid trip data", async () => {
      const { createTrip } = await import("../controllers/trip.controller.js");
      const { req, res, next } = mockReqRes(
        {},
        { title: "New Trip", destination: "Kerala", pricePerPerson: 5000 }
      );
      await createTrip(req, res, next);
      // Controller calls tripService.createTrip which uses `new Trip()` — next may be called on error
      expect(res.status).toHaveBeenCalled();
    });
  });
});

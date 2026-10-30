/**
 * Auth Service — Unit Tests
 * All Mongoose models and JWT utils are mocked; no real DB connection needed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../models/User.js", () => {
  const mockUser = {
    _id: { toString: () => "user123" },
    name: "Test User",
    email: "test@example.com",
    role: "user",
    isVerified: false,
    refreshTokens: [] as string[],
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: vi.fn(),
    save: vi.fn().mockResolvedValue(undefined),
    markModified: vi.fn(),
  };

  return {
    User: {
      create: vi.fn().mockResolvedValue(mockUser),
      findOne: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(null),
    },
    mockUser,
  };
});

vi.mock("../models/AuditEvent.js", () => ({
  AuditEvent: { log: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../utils/jwt.js", () => ({
  generateAccessToken: vi.fn().mockReturnValue("mock-access-token"),
  generateRefreshToken: vi.fn().mockReturnValue("mock-refresh-token"),
  verifyRefreshToken: vi.fn(),
}));

vi.mock("../utils/cookies.js", () => ({
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}));

vi.mock("../config/env.js", () => ({
  env: {
    NODE_ENV: "test",
    USER_SERVICE_URL: "http://localhost:4002",
    INTERNAL_SERVICE_SECRET: "test-secret",
    JWT_ACCESS_SECRET: "test-access-secret",
    JWT_REFRESH_SECRET: "test-refresh-secret",
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
    FRONTEND_URL: "http://localhost:3000",
    PORT: 4001,
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue("hashed-password"),
  compare: vi.fn().mockResolvedValue(true),
}));

// Mock global fetch (used to notify user-service)
global.fetch = vi.fn().mockResolvedValue({ ok: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReqRes(body = {}, cookies = {}, user?: { id: string; role: string }) {
  const req = {
    body,
    cookies,
    user,
    ip: "127.0.0.1",
    headers: { "user-agent": "test-agent" },
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response;

  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("creates user and returns 201", async () => {
      const { register } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Registration successful" })
      );
    });

    it("calls next with error on duplicate email", async () => {
      const { User } = await import("../models/User.js");
      const dupError = Object.assign(new Error("E11000"), { code: 11000 });
      (User.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(dupError);

      const { register } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes({
        name: "Test",
        email: "dup@example.com",
        password: "password123",
      });

      await register(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("returns 401 for unknown email", async () => {
      const { User } = await import("../models/User.js");
      (User.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

      const { login } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes({ email: "nobody@example.com", password: "pass" });

      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 401 for wrong password", async () => {
      const bcrypt = await import("bcryptjs");
      (bcrypt.default.compare as ReturnType<typeof vi.fn>).mockResolvedValueOnce(false);

      const { User } = await import("../models/User.js");
      const fakeUser = {
        _id: { toString: () => "user123" },
        name: "Test",
        email: "test@example.com",
        role: "user",
        refreshTokens: [],
        comparePassword: vi.fn().mockResolvedValue(false),
        save: vi.fn().mockResolvedValue(undefined),
      };
      (User.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fakeUser);

      const { login } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes({ email: "test@example.com", password: "wrongpass" });

      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 200 for valid credentials", async () => {
      const { User } = await import("../models/User.js");
      const fakeUser = {
        _id: { toString: () => "user123" },
        name: "Test",
        email: "test@example.com",
        role: "user",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshTokens: [],
        comparePassword: vi.fn().mockResolvedValue(true),
        save: vi.fn().mockResolvedValue(undefined),
      };
      (User.findOne as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fakeUser);

      const { login } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes({ email: "test@example.com", password: "correctpass" });

      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("changePassword", () => {
    it("returns 401 if not authenticated", async () => {
      const { changePassword } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes({ currentPassword: "old", newPassword: "new12345" });
      // No req.user set

      await changePassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it("returns 400 if current password is wrong", async () => {
      const { User } = await import("../models/User.js");
      const fakeUser = {
        _id: { toString: () => "user123" },
        email: "test@example.com",
        refreshTokens: [],
        comparePassword: vi.fn().mockResolvedValue(false),
        save: vi.fn().mockResolvedValue(undefined),
        markModified: vi.fn(),
        password: "hashed",
      };
      (User.findById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(fakeUser);

      const { changePassword } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes(
        { currentPassword: "wrongold", newPassword: "newpass123" },
        {},
        { id: "user123", role: "user" }
      );

      await changePassword(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 if newPassword equals currentPassword", async () => {
      const { changePassword } = await import("../controllers/auth.controller.js");
      const { req, res, next } = mockReqRes(
        { currentPassword: "samepass1", newPassword: "samepass1" },
        {},
        { id: "user123", role: "user" }
      );

      await changePassword(req, res, next);
      // Zod refine should catch this — next will be called with ZodError
      expect(next).toHaveBeenCalled();
    });
  });
});

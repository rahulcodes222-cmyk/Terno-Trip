/* API Gateway Route Table
 * ========================
 * /api/v1/auth/*               → auth-service:4001    (no auth)
 * /api/v1/users/*              → user-service:4002    (authenticate required)
 * /api/v1/trips/*              → trip-service:4003    (optionalAuthenticate)
 * /api/v1/bookings/*           → booking-service:4004 (authenticate required)
 * /api/v1/payments/webhook     → payment-service      (PUBLIC)
 * /api/v1/payments/*           → payment-service:4005 (authenticate required)
 * /api/v1/notifications/*      → notification-service:4006 (authenticate required)
 * /api/v1/admin/bookings*      → booking-service:4004 (admin only)
 * /api/v1/admin/*              → trip-service:4003    (admin only)
 */
import { Router } from "express";
import { env } from "../config/env.js";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";
import { createServiceProxy } from "../proxy/createProxy.js";

const router = Router();

router.use("/api/v1/auth",
  createServiceProxy(env.AUTH_SERVICE_URL, "/api/v1/auth"));

router.use("/api/v1/users",
  authenticate,
  createServiceProxy(env.USER_SERVICE_URL, "/api/v1/users"));

router.use("/api/v1/trips",
  optionalAuthenticate,
  createServiceProxy(env.TRIP_SERVICE_URL, "/api/v1/trips"));

router.use("/api/v1/bookings",
  authenticate,
  createServiceProxy(env.BOOKING_SERVICE_URL, "/api/v1/bookings"));

// Cashfree webhook — PUBLIC, no auth — must be BEFORE /api/v1/payments
router.use("/api/v1/payments/webhook",
  createServiceProxy(env.PAYMENT_SERVICE_URL, "/api/v1/payments/webhook"));

router.use("/api/v1/payments",
  authenticate,
  createServiceProxy(env.PAYMENT_SERVICE_URL, "/api/v1/payments"));

router.use("/api/v1/notifications",
  authenticate,
  createServiceProxy(env.NOTIFICATION_SERVICE_URL, "/api/v1/notifications"));

// Admin bookings — MUST come BEFORE the catch-all /api/v1/admin route
router.use("/api/v1/admin/bookings",
  authenticate,
  createServiceProxy(env.BOOKING_SERVICE_URL, "/api/v1/admin/bookings"));

// Admin notification settings (brand/logo sync) → notification-service
router.use("/api/v1/admin/notifications",
  authenticate,
  createServiceProxy(env.NOTIFICATION_SERVICE_URL, "/api/v1/admin/notifications"));

// Admin trip/general routes → trip-service
router.use("/api/v1/admin",
  authenticate,
  createServiceProxy(env.TRIP_SERVICE_URL, "/api/v1/admin"));

export default router;

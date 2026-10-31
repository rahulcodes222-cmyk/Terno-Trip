/* API Gateway Route Table
 * ========================
 * /api/v1/auth/*          → auth-service:4001    (no auth — service handles own auth)
 * /api/v1/users/*         → user-service:4002    (authenticate required)
 * /api/v1/trips/*         → trip-service:4003    (optionalAuthenticate — public browsing OK)
 * /api/v1/bookings/*      → booking-service:4004 (authenticate required)
 * /api/v1/payments/webhook → payment-service     (PUBLIC — Cashfree webhook, no auth)
 * /api/v1/payments/*      → payment-service:4005 (authenticate required)
 * /api/v1/notifications/* → notification-service:4006 (authenticate required)
 * /api/v1/admin/*         → trip-service:4003    (authenticate required; adminAuth enforced in service)
 *
 * IMPORTANT: Each createServiceProxy call receives the stripped prefix so it
 * can rewrite the path back before forwarding to the downstream service.
 * Express router.use("/api/v1/auth") strips "/api/v1/auth" from the URL
 * before passing it to the next handler. Without pathRewrite the downstream
 * service receives "/me" instead of "/api/v1/auth/me".
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

// ─── Cashfree Webhook — PUBLIC (no auth) — must be BEFORE the authenticated payments route ──
// Cashfree's servers call this URL after a payment event. No user token is sent.
router.use("/api/v1/payments/webhook",
  createServiceProxy(env.PAYMENT_SERVICE_URL, "/api/v1/payments/webhook"));

router.use("/api/v1/payments",
  authenticate,
  createServiceProxy(env.PAYMENT_SERVICE_URL, "/api/v1/payments"));

router.use("/api/v1/notifications",
  authenticate,
  createServiceProxy(env.NOTIFICATION_SERVICE_URL, "/api/v1/notifications"));

// Admin routes — authenticated at gateway; adminAuth (role check) runs inside trip-service
router.use("/api/v1/admin",
  authenticate,
  createServiceProxy(env.TRIP_SERVICE_URL, "/api/v1/admin"));

export default router;

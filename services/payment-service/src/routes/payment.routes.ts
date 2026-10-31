import { Router } from "express";
import { extractUser } from "../middleware/extractUser.js";
import { serviceAuth } from "../middleware/serviceAuth.js";
import {
  createOrder,
  processPayment,
  getPaymentStatus,
  refundPayment,
  cashfreeWebhook,
} from "../controllers/payment.controller.js";

const router = Router();

// ─── User Routes ───────────────────────────────────────────────────────────────
router.post("/api/v1/payments/orders", extractUser, createOrder);
router.post("/api/v1/payments/orders/:id/process", extractUser, processPayment);
router.get("/api/v1/payments/orders/:id", extractUser, getPaymentStatus);

// ─── Cashfree Webhook (public — Cashfree calls this) ──────────────────────────
router.post("/api/v1/payments/webhook", cashfreeWebhook);

// ─── Internal / Admin Routes ───────────────────────────────────────────────────
router.post("/api/v1/internal/payments/refund/:id", serviceAuth, refundPayment);

export default router;

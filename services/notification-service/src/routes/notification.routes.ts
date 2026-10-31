import { Router } from "express";
import { extractUser } from "../middleware/extractUser.js";
import { serviceAuth } from "../middleware/serviceAuth.js";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  internalCreateNotification,
  sendBookingConfirmationEmail,
} from "../controllers/notification.controller.js";

const router = Router();

// ─── Authenticated User Routes ─────────────────────────────────────────────────
router.get("/api/v1/notifications", extractUser, getNotifications);
router.get("/api/v1/notifications/unread-count", extractUser, getUnreadCount);
router.patch("/api/v1/notifications/:id/read", extractUser, markRead);
router.patch("/api/v1/notifications/read-all", extractUser, markAllRead);

// ─── Internal Routes (service-to-service via HTTP) ─────────────────────────────
// NOTE: Other services call this endpoint directly over HTTP because the
// in-memory EventEmitter in @terno/shared-events is NOT shared across OS
// processes. This HTTP endpoint is the cross-process notification mechanism.
router.post("/api/v1/internal/notifications", serviceAuth, internalCreateNotification);

// ─── Booking Confirmation Email (called by payment-service after payment) ──────
router.post("/api/v1/internal/notifications/booking-email", serviceAuth, sendBookingConfirmationEmail);

export default router;


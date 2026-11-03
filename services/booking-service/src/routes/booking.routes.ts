import { Router } from "express";
import { extractUser } from "../middleware/extractUser.js";
import { serviceAuth } from "../middleware/serviceAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  createBooking,
  getMyBookings,
  getBookingByRef,
  cancelBooking,
  updatePaymentStatus,
  internalGetBookingById,
  internalGetBookingByRef,
  getAllBookingsAdmin,
} from "../controllers/booking.controller.js";

const router = Router();

// ─── Authenticated User Routes ─────────────────────────────────────────────────
router.post("/api/v1/bookings", extractUser, createBooking);
router.get("/api/v1/bookings/my", extractUser, getMyBookings);
router.get("/api/v1/bookings/:ref", extractUser, getBookingByRef);
router.delete("/api/v1/bookings/:id", extractUser, cancelBooking);

// ─── PATCH alias for cancel (spec requirement) ────────────────────────────────
router.patch("/api/v1/bookings/:id/cancel", extractUser, cancelBooking);

// ─── Admin Routes ──────────────────────────────────────────────────────────────
router.get("/api/v1/admin/bookings", extractUser, adminAuth, getAllBookingsAdmin);

// ─── Internal Routes (service-to-service) ─────────────────────────────────────
router.post("/api/v1/internal/bookings/update-payment", serviceAuth, updatePaymentStatus);
router.get("/api/v1/internal/bookings/ref/:ref", serviceAuth, internalGetBookingByRef);
router.get("/api/v1/internal/bookings/:id", serviceAuth, internalGetBookingById);

export default router;

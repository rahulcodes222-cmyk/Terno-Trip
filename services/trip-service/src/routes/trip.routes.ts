import { Router } from "express";
import { serviceAuth } from "../middleware/serviceAuth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  listTrips,
  getTrip,
  getFeaturedTrips,
  getTrendingTrips,
  getCategories,
  checkAvailability,
  decrementSeats,
  incrementSeats,
  createTrip,
  updateTrip,
  deleteTrip,
  updateAvailability,
  getTripByIdAdmin,
  getTripByIdInternal,
} from "../controllers/trip.controller.js";

const router = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/api/v1/trips", listTrips);
router.get("/api/v1/trips/featured", getFeaturedTrips);
router.get("/api/v1/trips/trending", getTrendingTrips);
router.get("/api/v1/trips/categories", getCategories);
router.get("/api/v1/trips/:slug", getTrip);
router.post("/api/v1/trips/check-availability", checkAvailability);

// ─── Internal Routes (service-to-service) ─────────────────────────────────────
router.post("/api/v1/internal/trips/decrement-seats", serviceAuth, decrementSeats);
router.post("/api/v1/internal/trips/increment-seats", serviceAuth, incrementSeats);
router.get("/api/v1/internal/trips/:id", serviceAuth, getTripByIdInternal);

// ─── Admin Routes (require x-user-role: admin injected by API Gateway) ─────────
router.get("/api/v1/admin/trips/:id", adminAuth, getTripByIdAdmin);
router.post("/api/v1/admin/trips", adminAuth, createTrip);
router.put("/api/v1/admin/trips/:id", adminAuth, updateTrip);
router.delete("/api/v1/admin/trips/:id", adminAuth, deleteTrip);
router.patch("/api/v1/admin/trips/:id/availability", adminAuth, updateAvailability);

export default router;

import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { createApiResponse, createPaginatedResponse } from "@terno/shared";

console.log("[booking-controller] ✅ loaded — lenient inline schema active");
import * as bookingService from "../services/booking.service.js";

// ─── Inline booking schema ────────────────────────────────────────────────────
// Defined here (not imported from shared) so tsx --watch hot-reloads changes.
// Lenient rules:
//   - age: z.coerce.number()   → accepts "25" string from HTML forms
//   - departureDate: accepts both YYYY-MM-DD and full ISO datetime
//   - contactPhone: strips spaces/dashes before regex check

// ── MAXIMALLY LENIENT schema — accepts any reasonable input ──────────────────
const inlineTravellerSchema = z.object({
  firstName: z.string().min(1, "First name required").trim(),
  lastName: z.string().min(1, "Last name required").trim(),
  // coerce handles both number and string inputs from forms
  age: z.coerce.number().min(1).max(120).default(18),
  idNumber: z.string().trim().optional(),
});

const inlineCreateBookingSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  // Accept both YYYY-MM-DD and ISO datetime — normalize to ISO
  departureDate: z
    .string()
    .min(1)
    .transform((v) =>
      v.includes("T") ? v : new Date(v + "T00:00:00.000Z").toISOString()
    ),
  travellers: z.array(inlineTravellerSchema).min(1).max(20),
  contactEmail: z.string().email("Invalid contact email"),
  // Accept ANY phone format — just strip spaces and check length
  contactPhone: z
    .string()
    .min(1, "Phone required")
    .transform((v) => v.replace(/[\s\-()]/g, ""))
    .pipe(z.string().min(7, "Phone too short")),
  specialRequests: z.string().optional().default(""),
});

// ─── createBooking ────────────────────────────────────────────────────────────

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    // Debug: log received body so we can see exact validation failures
    console.log("[booking] received body:", JSON.stringify(req.body));

    const result = inlineCreateBookingSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      console.log("[booking] validation failed:", JSON.stringify(errors));
      res.status(400).json({ success: false, message: "Validation error", errors });
      return;
    }

    const input = result.data;
    const booking = await bookingService.createBooking(
      {
        tripId: input.tripId,
        departureDate: input.departureDate,
        travellers: input.travellers.map((t) => ({
          firstName: t.firstName,
          lastName: t.lastName,
          age: t.age,
          passportNumber: t.idNumber,
        })),
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        specialRequests: input.specialRequests,
      },
      userId
    );

    res.status(201).json(createApiResponse(booking, "Booking created successfully"));
  } catch (err) {
    console.error('[booking] createBooking error:', err);
    next(err);
  }
}

export async function getMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const { bookings, total } = await bookingService.getUserBookings(userId, page, limit);
    res
      .status(200)
      .json(createPaginatedResponse(bookings, page, limit, total, "Bookings fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function getBookingByRef(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const booking = await bookingService.getBookingByRef(req.params.ref, userId);

    if (!booking) {
      res
        .status(404)
        .json({ success: false, message: "Booking not found" });
      return;
    }

    res
      .status(200)
      .json(createApiResponse(booking, "Booking fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { reason } = req.body as { reason?: string };

    const booking = await bookingService.cancelBooking(req.params.id, userId, reason);
    res
      .status(200)
      .json(createApiResponse(booking, "Booking cancelled successfully"));
  } catch (err) {
    next(err);
  }
}

// ─── Internal endpoint — called by payment-service ─────────────────────────

export async function updatePaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookingId, paymentStatus, paymentId } = req.body as {
      bookingId: string;
      paymentStatus: "Paid" | "Failed" | "Refunded";
      paymentId?: string;
    };

    if (!bookingId || !paymentStatus) {
      res
        .status(400)
        .json({ success: false, message: "bookingId and paymentStatus are required" });
      return;
    }

    const booking = await bookingService.updateBookingPaymentStatus(
      bookingId,
      paymentStatus,
      paymentId
    );

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res
      .status(200)
      .json(createApiResponse(booking, "Payment status updated"));
  } catch (err) {
    next(err);
  }
}

// ─── Internal endpoint — called by payment-service to get booking details for email ──

export async function internalGetBookingById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    res.status(200).json(createApiResponse(booking, "Booking fetched"));
  } catch (err) {
    next(err);
  }
}

// ─── Internal endpoint — resolve bookingRef → _id (called by payment-service) ──

export async function internalGetBookingByRef(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const booking = await bookingService.getBookingByRefInternal(req.params.ref);
    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }
    res.status(200).json(createApiResponse(booking, "Booking fetched"));
  } catch (err) {
    next(err);
  }
}


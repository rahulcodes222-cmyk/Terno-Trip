import type { Request, Response, NextFunction } from "express";
import { createBookingSchema } from "@terno/shared";
import { createApiResponse, createPaginatedResponse } from "@terno/shared";
import * as bookingService from "../services/booking.service.js";

export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const input = createBookingSchema.parse(req.body);

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

    res
      .status(201)
      .json(createApiResponse(booking, "Booking created successfully"));
  } catch (err) {
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

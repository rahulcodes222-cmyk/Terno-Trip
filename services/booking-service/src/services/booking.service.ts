/**
 * Booking Service — Business Logic
 *
 * CROSS-PROCESS EVENT BUS NOTE:
 * Because each microservice runs as a separate OS process, the in-memory
 * EventEmitter in @terno/shared-events is NOT shared across processes.
 * Events emitted here would only be visible within THIS process.
 *
 * Instead, we use direct HTTP calls to notify other services:
 *   - After createBooking → HTTP POST to notification-service /api/v1/internal/notifications
 *   - After cancelBooking → HTTP POST to notification-service + trip-service increment-seats
 *
 * This is documented here so a future team can replace these HTTP calls
 * with a proper message broker (RabbitMQ, Redis Streams, AWS SQS) when ready.
 */

import { generateBookingRef } from "@terno/shared";
import { Booking, type IBookingDocument } from "../models/Booking.js";
import { env } from "../config/env.js";

// ─── Internal HTTP helpers ────────────────────────────────────────────────────

async function callTripService(path: string, body: unknown): Promise<unknown> {
  try {
    const res = await fetch(`${env.TRIP_SERVICE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    return await res.json();
  } catch (err) {
    console.error(`[booking-service] callTripService ${path} failed:`, err);
    throw err;
  }
}

async function notifyUser(payload: {
  userId: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "system";
  metadata?: Record<string, unknown>;
}): Promise<void> {
  // HTTP call to notification-service (cross-process — EventEmitter doesn't cross OS process boundaries)
  try {
    await fetch(`${env.NOTIFICATION_SERVICE_URL}/api/v1/internal/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // Log and continue — notification failure must not crash booking creation
    console.error("[booking-service] Failed to send notification:", err);
  }
}

// ─── Trip availability check ──────────────────────────────────────────────────

interface AvailabilityResponse {
  success: boolean;
  data?: {
    available: boolean;
    pricePerPerson: number;
    availableSeats: number;
    message?: string;
  };
  message?: string;
}

async function fetchTripAvailability(
  tripId: string,
  departureDate: string,
  seats: number
): Promise<{ pricePerPerson: number; availableSeats: number }> {
  const response = await fetch(
    `${env.TRIP_SERVICE_URL}/api/v1/trips/check-availability`,
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify({ tripId, departureDate, seats }),
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reach trip-service for availability check");
  }

  const json = (await response.json()) as AvailabilityResponse;

  if (!json.success || !json.data) {
    throw new Error(json.message ?? "Trip availability check failed");
  }

  if (!json.data.available) {
    throw new Error(json.data.message ?? "Trip is not available for the selected date/seats");
  }

  return { pricePerPerson: json.data.pricePerPerson, availableSeats: json.data.availableSeats };
}

// ─── Trip snapshot fetch ──────────────────────────────────────────────────────

interface TripSnapshotResponse {
  success: boolean;
  data?: {
    _id: string;
    title: string;
    destination: string;
    coverImage: string;
    pricePerPerson: number;
    duration: number;
    slug: string;
  };
}

async function fetchTripSnapshot(tripId: string) {
  // Use INTERNAL endpoint to fetch trip by ID (serviceAuth with x-internal-secret)
  const response = await fetch(`${env.TRIP_SERVICE_URL}/api/v1/internal/trips/${tripId}`, {
    headers: { 
      "Content-Type": "application/json",
      "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    console.error(`[booking-service] fetchTripSnapshot failed: ${response.status}`);
    return null;
  }

  const json = (await response.json()) as TripSnapshotResponse;
  return json.data ?? null;
}

// ─── Create Booking ───────────────────────────────────────────────────────────

export interface CreateBookingInput {
  tripId: string;
  departureDate: string;
  travellers: Array<{
    firstName: string;
    lastName: string;
    age: number;
    passportNumber?: string;
  }>;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
}

// Helper to notify notification‑service about a newly created booking
async function sendBookingCreatedEmail(booking: IBookingDocument): Promise<void> {
  try {
    await fetch(`${env.NOTIFICATION_SERVICE_URL}/api/v1/internal/notifications/booking-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify({
        userName: booking.travellers?.[0]?.firstName ? 
          `${booking.travellers[0].firstName || ''} ${booking.travellers[0].lastName || ''}`.trim() : 
          "Traveller",
        userEmail: booking.contactEmail,
        bookingRef: booking.bookingRef,
        tripTitle: booking.tripSnapshot?.title ?? "Trip",
        destination: booking.tripSnapshot?.destination ?? "",
        departureDate: new Date(booking.departureDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        travellersCount: booking.travellers?.length ?? 1,
        totalAmount: booking.totalAmount,
        // paymentId omitted — no payment gateway transaction ID for direct bookings;
        // the email template renders nothing for this row when the field is absent.
      }),
      signal: AbortSignal.timeout(5000),
    });
    console.log(`[booking-service] Booking email POST succeeded → user: ${booking.contactEmail}`);

  } catch (err) {
    console.error("[booking-service] booking-email POST failed:", err);
  }
}

export async function createBooking(
  data: CreateBookingInput,
  userId: string
): Promise<IBookingDocument> {
  // 1. Check for duplicate booking — same user, same trip, same departure date, not cancelled
  const existingBooking = await Booking.findOne({
    userId,
    tripId: data.tripId,
    departureDate: new Date(data.departureDate),
    status: { $in: ["Pending", "Confirmed"] },
  });

  if (existingBooking) {
    throw new Error(
      "You already have a booking for this trip on the selected date"
    );
  }

  // 2. Validate availability and get CURRENT server-side price (never trust frontend)
  const { pricePerPerson, availableSeats } = await fetchTripAvailability(
    data.tripId,
    data.departureDate,
    data.travellers.length
  );

  if (!availableSeats || availableSeats < data.travellers.length) {
    throw new Error(
      `Only ${availableSeats ?? 0} seat(s) available for this date`
    );
  }

  // 3. Calculate server-side total amount
  const totalAmount = pricePerPerson * data.travellers.length;

  // 4. Fetch trip snapshot for denormalization (best-effort)
  const tripData = await fetchTripSnapshot(data.tripId);

  const tripSnapshot = {
    title: tripData?.title ?? "Trip",
    destination: tripData?.destination ?? "",
    coverImage: tripData?.coverImage ?? "https://picsum.photos/seed/trip/800/600",
    pricePerPerson,
    duration: tripData?.duration ?? 0,
  };

  // 5. Create booking with server-calculated total
  const booking = new Booking({
    bookingRef: generateBookingRef(),
    userId,
    tripId: data.tripId,
    tripSnapshot,
    departureDate: new Date(data.departureDate),
    travellers: data.travellers,
    totalAmount, // Server-calculated — never trusted from frontend
    status: "Confirmed",
    paymentStatus: "Paid",
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    specialRequests: data.specialRequests,
  });

  await booking.save();

  // 6. Decrement seats immediately (reserve them)
  try {
    await fetch(`${env.TRIP_SERVICE_URL}/api/v1/internal/trips/decrement-seats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify({
        tripId: data.tripId,
        departureDate: data.departureDate,
        seats: data.travellers.length,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    // If seat decrement fails, delete the booking and throw
    await Booking.findByIdAndDelete(booking._id);
    throw new Error("Failed to reserve seats. Please try again.");
  }

  // 7. Send booking confirmation email (user + admin) – best‑effort, ignore failures
  try {
    await sendBookingCreatedEmail(booking);
    console.log(`[booking-service] Booking email dispatched → user: ${booking.contactEmail}`);
  } catch (err) {
    console.error("[booking-service] Failed to send booking email:", (err as Error).message);
    // Don't throw — booking is already created, email is best-effort
  }

  // 8. Notify user via HTTP (cross-process — in-memory EventEmitter won't work here)
  try {
    await notifyUser({
      userId,
      title: "Booking Received",
      message: `Your booking for ${tripSnapshot.title} has been confirmed. Ref: ${booking.bookingRef}`,
      type: "booking",
      metadata: {
        bookingId: String(booking._id),
        bookingRef: booking.bookingRef,
        tripId: data.tripId,
      },
    });
  } catch (err) {
    console.error("[booking-service] Failed to send notification:", (err as Error).message);
    // Don't throw — booking is already created, notification is best-effort
  }

  return booking;
}

// ─── Get User Bookings ────────────────────────────────────────────────────────

export async function getUserBookings(
  userId: string,
  page = 1,
  limit = 10
): Promise<{ bookings: IBookingDocument[]; total: number }> {
  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments({ userId }),
  ]);
  return { bookings: bookings as unknown as IBookingDocument[], total };
}

// ─── Get Booking by Ref ───────────────────────────────────────────────────────

export async function getBookingByRef(
  ref: string,
  userId: string
): Promise<IBookingDocument | null> {
  return Booking.findOne({ bookingRef: ref, userId }).lean() as Promise<IBookingDocument | null>;
}

// ─── Get Booking by ID (internal use — no userId check) ──────────────────────

export async function getBookingById(
  id: string
): Promise<IBookingDocument | null> {
  return Booking.findById(id).lean() as Promise<IBookingDocument | null>;
}

// ─── Get Booking by Ref — internal, no userId check ──────────────────────────

export async function getBookingByRefInternal(
  ref: string
): Promise<IBookingDocument | null> {
  return Booking.findOne({ bookingRef: ref }).lean() as Promise<IBookingDocument | null>;
}

// ─── Cancel Booking ───────────────────────────────────────────────────────────

export async function cancelBooking(
  id: string,
  userId: string,
  reason?: string
): Promise<IBookingDocument> {
  const booking = await Booking.findOne({ _id: id, userId });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (!["Pending", "Confirmed"].includes(booking.status)) {
    throw new Error(`Cannot cancel a booking with status: ${booking.status}`);
  }

  booking.status = "Cancelled";
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  await booking.save();

  // Restore seats in trip-service via HTTP (cross-process)
  try {
    await callTripService("/api/v1/internal/trips/increment-seats", {
      tripId: booking.tripId,
      seats: booking.travellers.length,
    });
  } catch (err) {
    console.error("[booking-service] Failed to increment seats on cancellation:", err);
  }

  // Notify user via HTTP
  await notifyUser({
    userId,
    title: "Booking Cancelled",
    message: `Your booking ${booking.bookingRef} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
    type: "booking",
    metadata: { bookingId: String(booking._id), bookingRef: booking.bookingRef },
  });

  return booking;
}

// ─── Update Payment Status (called by payment-service via HTTP) ───────────────

export async function updateBookingPaymentStatus(
  bookingId: string,
  paymentStatus: "Paid" | "Failed" | "Refunded",
  paymentId?: string
): Promise<IBookingDocument | null> {
  const update: Partial<IBookingDocument> = { paymentStatus };

  if (paymentStatus === "Paid") {
    update.status = "Confirmed";
  } else if (paymentStatus === "Failed") {
    update.status = "Pending"; // stays Pending, can retry payment
  }

  if (paymentId) {
    update.paymentId = paymentId;
  }

  // Find by bookingRef first (payment-service sends bookingRef like "TERNO-123456")
  // Fall back to _id if that doesn't match
  let booking = await Booking.findOneAndUpdate(
    { bookingRef: bookingId },
    update,
    { new: true }
  ).lean();

  if (!booking) {
    // Fall back to _id lookup
    booking = await Booking.findByIdAndUpdate(bookingId, update, { new: true }).lean();
  }

  // NOTE: Seat decrement is intentionally NOT performed here.
  // Seats are already decremented atomically during createBooking (step 6).
  // Performing a second decrement here would double-deduct seats for direct
  // (non-payment-gateway) bookings that are created as Confirmed/Paid immediately.
  // If a future payment gateway flow requires deferred seat decrement, re-enable
  // this block only for bookings that were originally created as Pending.

  return booking as unknown as IBookingDocument | null;
}

// ─── Admin: Get ALL bookings (all users) ─────────────────────────────────────

export async function getAllBookings(
  page = 1,
  limit = 20,
  status?: string,
  search?: string
): Promise<{ bookings: IBookingDocument[]; total: number }> {
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  // Status filter — trimmed, case-insensitive match
  if (status && status.trim() && status.trim() !== "All") {
    query.status = status.trim();
  }

  // Search filter — matches bookingRef, contactEmail, tripSnapshot.title
  if (search && search.trim()) {
    const searchTrimmed = search.trim();
    query.$or = [
      { bookingRef: { $regex: searchTrimmed, $options: "i" } },
      { contactEmail: { $regex: searchTrimmed, $options: "i" } },
      { "tripSnapshot.title": { $regex: searchTrimmed, $options: "i" } },
    ];
  }

  const [bookings, total] = await Promise.all([
    Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Booking.countDocuments(query),
  ]);

  return { bookings: bookings as unknown as IBookingDocument[], total };
}

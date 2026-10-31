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
): Promise<{ pricePerPerson: number }> {
  const response = await fetch(
    `${env.TRIP_SERVICE_URL}/api/v1/trips/check-availability`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  return { pricePerPerson: json.data.pricePerPerson };
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

import { env } from "../config/env.js";

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
        userName: "Traveller",
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
        // No paymentId yet – booking is pending
      }),
      signal: AbortSignal.timeout(5000),
    });
    console.log(`[booking-service] Booking email POST succeeded → user: ${booking.contactEmail}`);

  } catch (err) {
    console.error("[booking-service] Failed to send booking‑created email:", err);
  }
}

export async function createBooking(

  data: CreateBookingInput,
  userId: string
): Promise<IBookingDocument> {
  // 1. Validate availability and get CURRENT server-side price (never trust frontend)
  const { pricePerPerson } = await fetchTripAvailability(
    data.tripId,
    data.departureDate,
    data.travellers.length
  );

  // 2. Calculate server-side total amount
  const totalAmount = pricePerPerson * data.travellers.length;

  // 3. Fetch trip snapshot for denormalization (best-effort)
  const tripData = await fetchTripSnapshot(data.tripId);

  const tripSnapshot = {
    title: tripData?.title ?? "Trip",
    destination: tripData?.destination ?? "",
    coverImage: tripData?.coverImage ?? "https://picsum.photos/seed/trip/800/600",
    pricePerPerson,
    duration: tripData?.duration ?? 0,
  };

  // 4. Create booking with server-calculated total
  const booking = new Booking({
    bookingRef: generateBookingRef(),
    userId,
    tripId: data.tripId,
    tripSnapshot,
    departureDate: new Date(data.departureDate),
    travellers: data.travellers,
    totalAmount, // Server-calculated — never trusted from frontend
    status: "Pending",
    paymentStatus: "Pending",
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    specialRequests: data.specialRequests,
  });

  await booking.save();

  // Send booking confirmation email (user + admin) – best‑effort, ignore failures
  await sendBookingCreatedEmail(booking);
  console.log(`[booking-service] Booking email dispatched → user: ${booking.contactEmail}, admin: ${env.ADMIN_EMAIL}`);

  // 5. Notify user via HTTP (cross-process — in-memory EventEmitter won't work here)
  await notifyUser({
    userId,
    title: "Booking Received",
    message: `Your booking for ${tripSnapshot.title} has been received and is pending payment. Ref: ${booking.bookingRef}`,
    type: "booking",
    metadata: {
      bookingId: String(booking._id),
      bookingRef: booking.bookingRef,
      tripId: data.tripId,
    },
  });

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

  return Booking.findByIdAndUpdate(bookingId, update, { new: true }).lean() as Promise<IBookingDocument | null>;
}

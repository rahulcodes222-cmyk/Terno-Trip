import type { Request, Response, NextFunction } from "express";
import { searchTripsSchema } from "@terno/shared";
import {
  createPaginatedResponse,
  createApiResponse,
} from "@terno/shared";
import * as tripService from "../services/trip.service.js";

export async function listTrips(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = searchTripsSchema.parse(req.query);
    const { trips, total, page, limit } = await tripService.getAllTrips(filters);
    res
      .status(200)
      .json(createPaginatedResponse(trips, page, limit, total, "Trips fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function getTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trip = await tripService.getTripBySlug(req.params.slug);
    if (!trip) {
      res.status(404).json({ success: false, message: "Trip not found" });
      return;
    }
    res.status(200).json(createApiResponse(trip, "Trip fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedTrips(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trips = await tripService.getFeaturedTrips();
    res
      .status(200)
      .json(createApiResponse(trips, "Featured trips fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function getTrendingTrips(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trips = await tripService.getTrendingTrips();
    res
      .status(200)
      .json(createApiResponse(trips, "Trending trips fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function getCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await tripService.getCategories();
    res
      .status(200)
      .json(createApiResponse(categories, "Categories fetched successfully"));
  } catch (err) {
    next(err);
  }
}

export async function checkAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tripId, departureDate, seats } = req.body as {
      tripId: string;
      departureDate: string;
      seats: number;
    };

    if (!tripId || !departureDate || seats === undefined) {
      res.status(400).json({
        success: false,
        message: "tripId, departureDate, and seats are required",
      });
      return;
    }

    const result = await tripService.checkAvailability(tripId, departureDate, seats);
    res.status(200).json(createApiResponse(result, "Availability checked"));
  } catch (err) {
    next(err);
  }
}

export async function decrementSeats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tripId, seats } = req.body as { tripId: string; seats: number };

    if (!tripId || seats === undefined) {
      res
        .status(400)
        .json({ success: false, message: "tripId and seats are required" });
      return;
    }

    const trip = await tripService.decrementSeats(tripId, seats);
    if (!trip) {
      res
        .status(400)
        .json({ success: false, message: "Not enough seats or trip not found" });
      return;
    }
    res.status(200).json(createApiResponse(trip, "Seats decremented"));
  } catch (err) {
    next(err);
  }
}

export async function incrementSeats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tripId, seats } = req.body as { tripId: string; seats: number };

    if (!tripId || seats === undefined) {
      res
        .status(400)
        .json({ success: false, message: "tripId and seats are required" });
      return;
    }

    const trip = await tripService.incrementSeats(tripId, seats);
    if (!trip) {
      res
        .status(404)
        .json({ success: false, message: "Trip not found" });
      return;
    }
    res.status(200).json(createApiResponse(trip, "Seats incremented"));
  } catch (err) {
    next(err);
  }
}

export async function createTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(createApiResponse(trip, "Trip created successfully"));
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trip = await tripService.updateTrip(req.params.id, req.body);
    if (!trip) {
      res.status(404).json({ success: false, message: "Trip not found" });
      return;
    }
    res.status(200).json(createApiResponse(trip, "Trip updated successfully"));
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const deleted = await tripService.deleteTrip(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: "Trip not found" });
      return;
    }
    res.status(200).json(createApiResponse(null, "Trip deleted (soft) successfully"));
  } catch (err) {
    next(err);
  }
}

export async function updateAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { availableSeats } = req.body as { availableSeats: unknown };
    if (typeof availableSeats !== "number" || availableSeats < 0) {
      res.status(400).json({
        success: false,
        message: "availableSeats must be a non-negative number",
      });
      return;
    }
    const trip = await tripService.updateTrip(req.params.id, { availableSeats });
    if (!trip) {
      res.status(404).json({ success: false, message: "Trip not found" });
      return;
    }
    res.status(200).json(createApiResponse(trip, "Availability updated"));
  } catch (err) {
    next(err);
  }
}

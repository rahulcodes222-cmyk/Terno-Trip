import mongoose from "mongoose";
import { Trip, type ITripDocument } from "../models/Trip.js";
import type { SearchTripsInput } from "@terno/shared";

export interface TripFilters extends Partial<SearchTripsInput> {}

export interface PaginatedTrips {
  trips: ITripDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface AvailabilityResult {
  available: boolean;
  pricePerPerson: number;
  availableSeats: number;
  message?: string;
}

export async function getAllTrips(
  filters: TripFilters
): Promise<PaginatedTrips> {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    duration,
    difficulty,
    page = 1,
    limit = 12,
    sortBy,
    sortOrder = "asc",
  } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryObj: Record<string, any> = { isActive: true };

  if (query) {
    queryObj.$text = { $search: query };
  }
  if (category) {
    queryObj.category = category;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    queryObj.pricePerPerson = {};
    if (minPrice !== undefined) queryObj.pricePerPerson.$gte = minPrice;
    if (maxPrice !== undefined) queryObj.pricePerPerson.$lte = maxPrice;
  }
  if (duration !== undefined) {
    queryObj.duration = duration;
  }
  if (difficulty) {
    queryObj.difficulty = difficulty;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sort: Record<string, any> = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    Trip.find(queryObj).sort(sort).skip(skip).limit(limit).lean(),
    Trip.countDocuments(queryObj),
  ]);

  return { trips: trips as unknown as ITripDocument[], total, page, limit };
}

export async function getTripBySlug(
  slug: string
): Promise<ITripDocument | null> {
  return Trip.findOne({ slug, isActive: true }).lean() as Promise<ITripDocument | null>;
}

export async function getTripById(
  id: string
): Promise<ITripDocument | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Trip.findOne({ _id: id, isActive: true }).lean() as Promise<ITripDocument | null>;
}

export async function getFeaturedTrips(): Promise<ITripDocument[]> {
  const trips = await Trip.find({ isActive: true })
    .sort({ ratingsAverage: -1 })
    .limit(6)
    .lean();
  return trips as unknown as ITripDocument[];
}

export async function getTrendingTrips(): Promise<ITripDocument[]> {
  const trips = await Trip.find({ isActive: true })
    .sort({ ratingsQuantity: -1 })
    .limit(4)
    .lean();
  return trips as unknown as ITripDocument[];
}

export async function getCategories(): Promise<string[]> {
  return Trip.distinct("category", { isActive: true });
}

export async function checkAvailability(
  tripId: string,
  departureDate: string,
  seats: number
): Promise<AvailabilityResult> {
  const trip = await getTripById(tripId);

  if (!trip) {
    return { available: false, pricePerPerson: 0, availableSeats: 0, message: "Trip not found" };
  }

  // Validate that the requested departure date is in the trip's startDates
  const reqDate = new Date(departureDate);
  const reqDateStr = reqDate.toISOString().split("T")[0];
  const isValidDate = trip.startDates.some((d: Date) => {
    const sd = new Date(d).toISOString().split("T")[0];
    return sd === reqDateStr;
  });

  if (!isValidDate) {
    return {
      available: false,
      pricePerPerson: trip.pricePerPerson,
      availableSeats: trip.availableSeats,
      message: "Selected departure date is not available",
    };
  }

  if (trip.availableSeats < seats) {
    return {
      available: false,
      pricePerPerson: trip.pricePerPerson,
      availableSeats: trip.availableSeats,
      message: `Only ${trip.availableSeats} seat(s) available`,
    };
  }

  return {
    available: true,
    pricePerPerson: trip.pricePerPerson,
    availableSeats: trip.availableSeats,
  };
}

export async function decrementSeats(
  tripId: string,
  seats: number
): Promise<ITripDocument | null> {
  return Trip.findOneAndUpdate(
    { _id: tripId, availableSeats: { $gte: seats } },
    { $inc: { availableSeats: -seats } },
    { new: true }
  ).lean() as Promise<ITripDocument | null>;
}

export async function incrementSeats(
  tripId: string,
  seats: number
): Promise<ITripDocument | null> {
  return Trip.findByIdAndUpdate(
    tripId,
    { $inc: { availableSeats: seats } },
    { new: true }
  ).lean() as Promise<ITripDocument | null>;
}

export async function createTrip(
  data: Partial<ITripDocument>
): Promise<ITripDocument> {
  const trip = new Trip(data);
  await trip.save();
  return trip;
}

export async function updateTrip(
  id: string,
  data: Partial<ITripDocument>
): Promise<ITripDocument | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Trip.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean() as Promise<ITripDocument | null>;
}

export async function deleteTrip(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await Trip.findByIdAndUpdate(id, { isActive: false }, { new: true });
  return result !== null;
}

import mongoose, { type Document, type Model, Schema } from "mongoose";
import type {
  BookingStatus,
  PaymentStatus,
} from "@terno/shared";

export interface ITripSnapshot {
  title: string;
  destination: string;
  coverImage: string;
  pricePerPerson: number;
  duration: number;
}

export interface ITravellerDoc {
  firstName: string;
  lastName: string;
  age: number;
  passportNumber?: string;
}

export interface IBookingDocument extends Document {
  bookingRef: string;
  userId: string;
  tripId: string;
  tripSnapshot: ITripSnapshot;
  departureDate: Date;
  travellers: ITravellerDoc[];
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  contactEmail: string;
  contactPhone: string;
  specialRequests?: string;
  paymentId?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const travellerSchema = new Schema<ITravellerDoc>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    passportNumber: { type: String, trim: true },
  },
  { _id: false }
);

const tripSnapshotSchema = new Schema<ITripSnapshot>(
  {
    title: { type: String, required: true },
    destination: { type: String, required: true },
    coverImage: { type: String, required: true },
    pricePerPerson: { type: Number, required: true },
    duration: { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBookingDocument>(
  {
    bookingRef: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    tripId: { type: String, required: true },
    tripSnapshot: { type: tripSnapshotSchema, required: true },
    departureDate: { type: Date, required: true },
    travellers: { type: [travellerSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Refunded"] as BookingStatus[],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded", "Failed"] as PaymentStatus[],
      default: "Pending",
    },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    specialRequests: { type: String, trim: true },
    paymentId: { type: String },
    cancellationReason: { type: String },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ bookingRef: 1 }, { unique: true });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ tripId: 1 });
bookingSchema.index({ status: 1 });

export const Booking: Model<IBookingDocument> = mongoose.model<IBookingDocument>(
  "Booking",
  bookingSchema
);

import mongoose, { type Document, type Model, Schema } from "mongoose";
import type { ITrip, TripCategory, TripDifficulty, ITripItineraryDay } from "@terno/shared";

export interface ITripDocument extends Omit<ITrip, "_id">, Document {
  slug: string;
  coverImage: string;
}

const itineraryDaySchema = new Schema<ITripItineraryDay>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    meals: [{ type: String }],
    accommodation: { type: String },
    activities: [{ type: String }],
  },
  { _id: false }
);

const tripSchema = new Schema<ITripDocument>(
  {
    title: { type: String, required: true, trim: true },
    /* slug is auto-generated from title in the pre-save hook — not required on input */
    slug: { type: String, required: false, unique: true, lowercase: true, trim: true, sparse: true },
    destination: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    coverImage: {
      type: String,
      default: "https://picsum.photos/seed/trip/800/600",
    },
    images: [{ type: String }],
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Adventure", "Beach", "Cultural", "Wildlife", "City", "Mountain", "Budget"] as TripCategory[],
    },
    duration: { type: Number, required: true, min: 1 },
    maxGroupSize: { type: Number, required: true, min: 1 },
    pricePerPerson: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    itinerary: [itineraryDaySchema],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    accommodationType: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Moderate", "Challenging"] as TripDifficulty[],
    },
    startDates: [{ type: Date }],
    availableSeats: { type: Number, required: true, min: 0 },
    ratingsAverage: { type: Number, default: 4.5, min: 1, max: 5 },
    ratingsQuantity: { type: Number, default: 0, min: 0 },
    cancellationPolicy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title before save
tripSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

// Indexes for common queries
tripSchema.index({ destination: 1 });
tripSchema.index({ category: 1 });
tripSchema.index({ pricePerPerson: 1 });
tripSchema.index({ isActive: 1 });
tripSchema.index({ ratingsAverage: -1 });
tripSchema.index({ ratingsQuantity: -1 });
tripSchema.index({ title: "text", destination: "text" });

export const Trip: Model<ITripDocument> = mongoose.model<ITripDocument>("Trip", tripSchema);

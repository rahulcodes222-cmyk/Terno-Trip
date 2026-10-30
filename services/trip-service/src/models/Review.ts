import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IReviewDocument extends Document {
  tripId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    tripId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

reviewSchema.index({ tripId: 1 });
reviewSchema.index({ tripId: 1, userId: 1 }, { unique: true });

export const Review: Model<IReviewDocument> = mongoose.model<IReviewDocument>(
  "Review",
  reviewSchema
);

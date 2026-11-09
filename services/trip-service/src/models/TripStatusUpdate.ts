import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ITripStatusUpdateDocument extends Document {
  tripId: string;
  status: string;
  location: string;
  message: string;
  photos: string[];
  timestamp: Date;
  createdAt: Date;
}

const tripStatusUpdateSchema = new Schema<ITripStatusUpdateDocument>(
  {
    tripId: { type: String, required: true },
    status: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
    photos: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

tripStatusUpdateSchema.index({ tripId: 1, createdAt: -1 });

export const TripStatusUpdate: Model<ITripStatusUpdateDocument> = mongoose.model<ITripStatusUpdateDocument>(
  "TripStatusUpdate",
  tripStatusUpdateSchema
);

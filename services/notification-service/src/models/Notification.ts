import mongoose, { type Document, type Model, Schema } from "mongoose";
import type { NotificationType } from "@terno/shared";

export interface INotificationDocument extends Document {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["booking", "payment", "system"] as NotificationType[],
      default: "system",
    },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ userId: 1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification: Model<INotificationDocument> =
  mongoose.model<INotificationDocument>("Notification", notificationSchema);

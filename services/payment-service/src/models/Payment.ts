import mongoose, { type Document, type Model, Schema } from "mongoose";

export type PaymentRecordStatus = "Pending" | "Success" | "Failed" | "Refunded";

export interface IPaymentDocument extends Document {
  paymentRef: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentRecordStatus;
  providerOrderId?: string;
  providerPaymentId?: string;
  failureReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    paymentRef: { type: String, required: true, unique: true },
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    provider: { type: String, default: "mock" },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"] as PaymentRecordStatus[],
      default: "Pending",
    },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
    failureReason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ paymentRef: 1 }, { unique: true });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });

export const Payment: Model<IPaymentDocument> = mongoose.model<IPaymentDocument>(
  "Payment",
  paymentSchema
);

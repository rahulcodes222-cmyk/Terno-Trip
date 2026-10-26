import mongoose, { Document, Schema } from "mongoose";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IPreferences {
  categories: string[];
  budget: string;
  notifications: boolean;
}

export interface IUserProfileDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  dateOfBirth?: Date;
  nationality?: string;
  preferences: IPreferences;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const preferencesSchema = new Schema<IPreferences>(
  {
    categories: { type: [String], default: [] },
    budget: { type: String, default: "" },
    notifications: { type: Boolean, default: true },
  },
  { _id: false }
);

const userProfileSchema = new Schema<IUserProfileDocument>(
  {
    userId: {
      type: String,
      required: [true, "userId is required"],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://picsum.photos/seed/terno/200/200",
    },
    phone: { type: String },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    preferences: {
      type: preferencesSchema,
      default: () => ({
        categories: [],
        budget: "",
        notifications: true,
      }),
    },
  },
  {
    timestamps: true,
  }
);

// ─── Model ────────────────────────────────────────────────────────────────────

export const UserProfile = mongoose.model<IUserProfileDocument>(
  "UserProfile",
  userProfileSchema
);

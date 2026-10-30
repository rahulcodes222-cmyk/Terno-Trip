import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_bookings",
    });
    console.log(`✅  Booking DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  Booking DB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   Booking DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅  Booking DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌  Booking DB connection closed");
}

import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  if (!env.MONGODB_URI) {
    console.warn("MONGODB_URI not set - running in degraded mode");
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_bookings",
    });
    console.log("Booking DB connected: " + conn.connection.host);
  } catch (error) {
    console.error("Booking DB connection error:", error);
    console.warn("Continuing without DB - booking service will run in degraded mode");
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("Booking DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("Booking DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log("Booking DB connection closed");
  } catch {
    // ignore
  }
}

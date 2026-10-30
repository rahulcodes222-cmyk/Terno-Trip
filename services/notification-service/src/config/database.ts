import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_notifications",
    });
    console.log(`✅  Notification DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  Notification DB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   Notification DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅  Notification DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌  Notification DB connection closed");
}

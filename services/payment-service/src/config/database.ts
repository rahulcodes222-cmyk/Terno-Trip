import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_payments",
    });
    console.log(`✅  Payment DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  Payment DB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   Payment DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅  Payment DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌  Payment DB connection closed");
}

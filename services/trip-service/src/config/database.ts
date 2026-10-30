import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_trips",
    });
    console.log(`✅  Trip DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  Trip DB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   Trip DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅  Trip DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌  Trip DB connection closed");
}

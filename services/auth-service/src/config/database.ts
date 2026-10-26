import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_auth",
    });
    console.log(`✅  Auth DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  Auth DB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   Auth DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅  Auth DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌  Auth DB connection closed");
}

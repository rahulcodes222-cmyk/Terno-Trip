import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: "terno_users",
    });
    console.log(`✅  User DB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌  User DB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️   User DB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅  User DB reconnected");
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("🔌  User DB connection closed");
}

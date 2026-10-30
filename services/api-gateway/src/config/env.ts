import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  JWT_ACCESS_SECRET: z
    .string({ required_error: "JWT_ACCESS_SECRET is required" })
    .min(1, "JWT_ACCESS_SECRET cannot be empty"),
  INTERNAL_SERVICE_SECRET: z
    .string({ required_error: "INTERNAL_SERVICE_SECRET is required" })
    .min(1, "INTERNAL_SERVICE_SECRET cannot be empty"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SERVICE_URL: z
    .string({ required_error: "AUTH_SERVICE_URL is required" })
    .url(),
  USER_SERVICE_URL: z
    .string({ required_error: "USER_SERVICE_URL is required" })
    .url(),
  TRIP_SERVICE_URL: z
    .string({ required_error: "TRIP_SERVICE_URL is required" })
    .url(),
  BOOKING_SERVICE_URL: z
    .string({ required_error: "BOOKING_SERVICE_URL is required" })
    .url(),
  PAYMENT_SERVICE_URL: z
    .string({ required_error: "PAYMENT_SERVICE_URL is required" })
    .url(),
  NOTIFICATION_SERVICE_URL: z
    .string({ required_error: "NOTIFICATION_SERVICE_URL is required" })
    .url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Environment variable validation failed. Check .env file.");
}

export const env = parsed.data;
export type Env = typeof env;

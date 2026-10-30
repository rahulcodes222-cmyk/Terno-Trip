import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4004),
  MONGODB_URI: z
    .string({ required_error: "MONGODB_URI is required" })
    .min(1, "MONGODB_URI cannot be empty"),
  INTERNAL_SERVICE_SECRET: z
    .string({ required_error: "INTERNAL_SERVICE_SECRET is required" })
    .min(1, "INTERNAL_SERVICE_SECRET cannot be empty"),
  TRIP_SERVICE_URL: z.string().url().default("http://localhost:4003"),
  NOTIFICATION_SERVICE_URL: z.string().url().default("http://localhost:4006"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Environment variable validation failed. Check .env file.");
}

export const env = parsed.data;
export type Env = typeof env;

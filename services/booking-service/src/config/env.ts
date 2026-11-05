import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4004),
  MONGODB_URI: z.string().optional().default(""),
  INTERNAL_SERVICE_SECRET: z.string().optional().default("terno-internal-secret"),
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

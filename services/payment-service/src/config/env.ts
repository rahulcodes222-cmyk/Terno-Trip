import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4005),
  MONGODB_URI: z
    .string({ required_error: "MONGODB_URI is required" })
    .min(1, "MONGODB_URI cannot be empty"),
  INTERNAL_SERVICE_SECRET: z
    .string({ required_error: "INTERNAL_SERVICE_SECRET is required" })
    .min(1, "INTERNAL_SERVICE_SECRET cannot be empty"),
  BOOKING_SERVICE_URL: z.string().url().default("http://localhost:4004"),
  NOTIFICATION_SERVICE_URL: z.string().url().default("http://localhost:4006"),
  PAYMENT_PROVIDER: z.enum(["mock", "cashfree", "razorpay", "stripe"]).default("mock"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // ─── Cashfree ────────────────────────────────────────────────────────────────
  CASHFREE_APP_ID: z.string().optional().default(""),
  CASHFREE_SECRET_KEY: z.string().optional().default(""),
  CASHFREE_ENV: z.enum(["sandbox", "production"]).optional().default("sandbox"),
  CASHFREE_API_URL: z.string().url().optional().default("https://sandbox.cashfree.com/pg"),
  FRONTEND_URL: z.string().url().optional().default("http://localhost:3000"),
  PAYMENT_WEBHOOK_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Environment variable validation failed. Check .env file.");
}

export const env = parsed.data;
export type Env = typeof env;

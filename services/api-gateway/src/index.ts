// Load env vars FIRST — must be before any other local imports in ESM
import "dotenv/config";

import { env } from "./config/env.js";
import app from "./app.js";

const server = app.listen(env.PORT, () => {
  console.log(
    `🚀  api-gateway running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
  );
  console.log(`  → auth:         ${env.AUTH_SERVICE_URL}`);
  console.log(`  → user:         ${env.USER_SERVICE_URL}`);
  console.log(`  → trip:         ${env.TRIP_SERVICE_URL}`);
  console.log(`  → booking:      ${env.BOOKING_SERVICE_URL}`);
  console.log(`  → payment:      ${env.PAYMENT_SERVICE_URL}`);
  console.log(`  → notification: ${env.NOTIFICATION_SERVICE_URL}`);
});

async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received — shutting down api-gateway gracefully`);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

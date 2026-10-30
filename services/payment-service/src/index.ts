import "dotenv/config";

import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/database.js";
import app from "./app.js";

async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀  payment-service running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
    );
    console.log(`   Payment provider: ${env.PAYMENT_PROVIDER}`);
  });

  async function gracefulShutdown(signal: string): Promise<void> {
    console.log(
      `\n${signal} received — shutting down payment-service gracefully`
    );
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

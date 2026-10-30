import "dotenv/config";

import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/database.js";
import { registerEventHandlers } from "./eventHandlers.js";
import app from "./app.js";

async function main(): Promise<void> {
  await connectDB();

  // Register in-process event handlers
  // (cross-process notifications arrive via HTTP POST /api/v1/internal/notifications)
  registerEventHandlers();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀  notification-service running on http://localhost:${env.PORT} [${env.NODE_ENV}]`
    );
  });

  async function gracefulShutdown(signal: string): Promise<void> {
    console.log(
      `\n${signal} received — shutting down notification-service gracefully`
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

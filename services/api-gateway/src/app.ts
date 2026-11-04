import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import { env } from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
import { correlationId } from "./middleware/correlationId.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Allow local development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow Vercel deployment
      if (origin.includes('terno-trip.vercel.app')) {
        return callback(null, true);
      }
      
      // Allow Render deployment
      if (origin.includes('terno-trip-4.onrender.com')) {
        return callback(null, true);
      }
      
      // Reject all other origins
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(cookieParser());
// NOTE: Do NOT add express.json() here — the proxy forwards the raw request
// body stream to downstream services. If express.json() parses it here, the
// stream is consumed and the proxy forwards an empty body.
// Each downstream service has its own express.json() middleware.
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));
app.use(correlationId);
app.use(rateLimiter);

// ─── API Documentation (Swagger UI) ──────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api-gateway",
    upstreamServices: {
      auth: env.AUTH_SERVICE_URL,
      user: env.USER_SERVICE_URL,
      trip: env.TRIP_SERVICE_URL,
      booking: env.BOOKING_SERVICE_URL,
      payment: env.PAYMENT_SERVICE_URL,
      notification: env.NOTIFICATION_SERVICE_URL,
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use(router);

// ─── Error Handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

export default app;

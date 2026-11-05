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
      // Log all origins for debugging
      console.log(`CORS check for origin: ${origin || '(no origin)'}`);
      
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        console.log('Allowing: no origin');
        return callback(null, true);
      }
      
      // TEMPORARY FIX: Allow ALL origins for debugging
      // In production, you should restrict this to specific domains
      console.log(`Allowing: ${origin} (temporary permissive CORS)`);
      return callback(null, true);
      
      /* PRODUCTION CORS (commented out for now)
      try {
        const originUrl = new URL(origin);
        const originHostname = originUrl.hostname;
        
        // Allow local development
        if (originHostname === 'localhost' || originHostname === '127.0.0.1') {
          console.log('Allowing: localhost');
          return callback(null, true);
        }
        
        // Allow Vercel deployment
        if (originHostname === 'terno-trip.vercel.app') {
          console.log('Allowing: terno-trip.vercel.app');
          return callback(null, true);
        }
        
        // Allow Render deployment
        if (originHostname === 'terno-trip-4.onrender.com') {
          console.log('Allowing: terno-trip-4.onrender.com');
          return callback(null, true);
        }
        
        // Also check if it's a subdomain of vercel.app (for preview deployments)
        if (originHostname.endsWith('.vercel.app')) {
          console.log(`Allowing: ${originHostname} (vercel.app subdomain)`);
          return callback(null, true);
        }
        
        // Reject all other origins
        console.warn(`CORS blocked: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      } catch (error) {
        // If URL parsing fails, reject the request
        console.warn(`Invalid origin URL: ${origin}`);
        return callback(new Error('Invalid origin'));
      }
      */
    },
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-secret', 'x-user-id', 'x-user-role', 'x-correlation-id'],
    exposedHeaders: ['Content-Type', 'Authorization', 'x-internal-secret', 'x-user-id', 'x-user-role', 'x-correlation-id'],
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

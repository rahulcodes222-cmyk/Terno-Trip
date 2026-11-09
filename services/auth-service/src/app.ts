import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import { env } from "./config/env.js";
import authRouter from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Global Middleware ────────────────────────────────────────────────────────

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (_origin, callback) => {
      if (!allowedOrigins.includes(_origin ?? "")) {
        callback(new Error("Not allowed by CORS"));
        return;
      }
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(morgan("dev"));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/v1/auth", authRouter);

// ─── Error Handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

export default app;

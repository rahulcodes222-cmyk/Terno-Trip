import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import { env } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import internalRouter from "./routes/internal.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(morgan("dev"));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "user-service" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public: GET /api/v1/users/profile, PUT /api/v1/users/profile, etc.
app.use("/api/v1/users", userRouter);

// Internal: POST /api/v1/internal/users
app.use("/api/v1/internal", internalRouter);

// ─── Error Handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

export default app;

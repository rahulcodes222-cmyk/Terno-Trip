import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

interface ValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, { message: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: "Token expired" });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }

  // Mongoose duplicate key
  const mongoErr = err as MongoError;
  if (mongoErr.code === 11000) {
    res.status(409).json({ success: false, message: "Email already registered" });
    return;
  }

  // Mongoose validation error
  const validationErr = err as ValidationError;
  if (validationErr.name === "ValidationError") {
    const messages = Object.values(validationErr.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: messages,
    });
    return;
  }

  // Generic errors
  const error = err as Error;
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : (error.message ?? "Internal server error"),
  });
};

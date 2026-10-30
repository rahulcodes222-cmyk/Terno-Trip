import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle ECONNREFUSED — downstream service unavailable
  if ((err as NodeJS.ErrnoException).code === "ECONNREFUSED") {
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable",
      },
    });
    return;
  }

  // Generic fallback
  const error = err as Error;
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : (error.message ?? "Internal server error"),
    },
  });
};

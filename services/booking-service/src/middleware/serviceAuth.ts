import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

/**
 * Middleware to authenticate internal service-to-service requests.
 * Expects the x-internal-secret header to match INTERNAL_SERVICE_SECRET.
 */
export function serviceAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers["x-internal-secret"] as string | undefined;

  if (!secret || secret !== env.INTERNAL_SERVICE_SECRET) {
    res
      .status(403)
      .json({ success: false, message: "Forbidden: invalid service secret" });
    return;
  }

  next();
}

import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

/**
 * Protects internal routes that should only be called by other services.
 * Callers must include the x-internal-secret header.
 */
export function serviceAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers["x-internal-secret"];

  if (!secret || secret !== env.INTERNAL_SERVICE_SECRET) {
    res.status(403).json({ success: false, message: "Forbidden" });
    return;
  }

  next();
}

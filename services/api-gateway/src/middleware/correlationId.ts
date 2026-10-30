import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

// Augment Express Request to include correlationId
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function correlationId(req: Request, res: Response, next: NextFunction): void {
  const uuid = randomUUID();
  req.correlationId = uuid;
  res.setHeader("x-correlation-id", uuid);
  next();
}

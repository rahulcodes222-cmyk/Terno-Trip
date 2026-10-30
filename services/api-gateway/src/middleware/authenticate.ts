import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

interface JwtPayload {
  sub: string;
  role: string;
  type: string;
}

function extractToken(req: Request): string | null {
  // Try cookie first
  const cookieToken = req.cookies?.access_token as string | undefined;
  if (cookieToken) return cookieToken;

  // Try Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Swallow error — treat as unauthenticated
  }

  next();
}

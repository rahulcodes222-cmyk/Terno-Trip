import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

/**
 * Reads x-user-id and x-user-role headers forwarded by the API gateway.
 * Routes that require authentication use this middleware.
 */
export function extractUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = req.headers["x-user-id"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;

  if (!userId) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return;
  }

  req.user = {
    id: userId,
    role: userRole ?? "user",
  };

  next();
}

/**
 * Optionally extracts user info — does not reject if missing.
 * Useful for public routes that behave differently for logged-in users.
 */
export function extractUserOptional(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const userId = req.headers["x-user-id"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;

  if (userId) {
    req.user = { id: userId, role: userRole ?? "user" };
  }

  next();
}

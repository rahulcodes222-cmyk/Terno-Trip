import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role: string;
      };
    }
  }
}

/**
 * Reads x-user-id, x-user-email, and x-user-role headers forwarded by the API gateway
 * after it validates the access_token cookie.
 */
export function extractUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = req.headers["x-user-id"] as string | undefined;
  const userEmail = req.headers["x-user-email"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;

  if (!userId) {
    res
      .status(401)
      .json({ success: false, message: "Authentication required" });
    return;
  }

  req.user = {
    id: userId,
    email: userEmail,
    role: userRole ?? "user",
  };

  next();
}

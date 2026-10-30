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

export function extractUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = req.headers["x-user-id"] as string | undefined;
  const userRole = req.headers["x-user-role"] as string | undefined;

  if (!userId) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  req.user = { id: userId, role: userRole ?? "user" };
  next();
}

import type { Request, Response, NextFunction } from "express";

export function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const role = req.headers["x-user-role"] as string | undefined;
  if (!role || role !== "admin") {
    res.status(403).json({ success: false, message: "Admin access required" });
    return;
  }
  next();
}

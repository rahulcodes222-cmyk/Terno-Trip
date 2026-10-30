import type { Request, Response, NextFunction } from "express";

/**
 * adminAuth — verifies that the API Gateway has injected x-user-role: admin.
 * Must be used AFTER extractUser (which reads x-user-id).
 * Returns 403 if the authenticated user is not an admin.
 */
export function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const role = req.headers["x-user-role"] as string | undefined;

  if (!role || role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
}

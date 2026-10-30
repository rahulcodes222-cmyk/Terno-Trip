import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerSchema, loginSchema } from "@terno/shared";
import { User } from "../models/User.js";
import { AuditEvent } from "../models/AuditEvent.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { env } from "../config/env.js";

// ─── Change Password Schema ───────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip password and refreshTokens from the user object returned to clients */
function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/** Fire-and-forget: create a profile in user-service after registration */
async function notifyUserService(payload: {
  userId: string;
  name: string;
  email: string;
}): Promise<void> {
  try {
    await fetch(`${env.USER_SERVICE_URL}/api/v1/internal/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": env.INTERNAL_SERVICE_SECRET,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error(
      "⚠️   Failed to notify user-service (non-fatal):",
      (error as Error).message
    );
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Hash refresh token before storing
    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens = [hashedRefresh];
    await user.save({ validateModifiedOnly: true });

    setAuthCookies(res, accessToken, refreshToken);

    // Audit log (fire-and-forget)
    void AuditEvent.log({
      userId: user._id.toString(),
      email: user.email,
      action: "register",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      success: true,
    });

    // Fire-and-forget: create user profile in user-service
    notifyUserService({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);

    // Need password field explicitly (it has select: false)
    const user = await User.findOne({ email: body.email }).select("+password");

    if (!user) {
      void AuditEvent.log({ email: body.email, action: "login_failed", ip: req.ip, userAgent: req.headers["user-agent"], success: false });
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(body.password);
    if (!isMatch) {
      void AuditEvent.log({ userId: user._id.toString(), email: user.email, action: "login_failed", ip: req.ip, userAgent: req.headers["user-agent"], success: false });
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    const hashedRefresh = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens.push(hashedRefresh);
    // Keep at most 5 refresh token slots to avoid unbounded growth
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    await user.save({ validateModifiedOnly: true });

    setAuthCookies(res, accessToken, refreshToken);

    // Audit log
    void AuditEvent.log({ userId: user._id.toString(), email: user.email, action: "login", ip: req.ip, userAgent: req.headers["user-agent"], success: true });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken: string | undefined = req.cookies?.refresh_token;

    if (refreshToken && req.user) {
      // Remove matching hashed token from the user's array
      const user = await User.findById(req.user.id);
      if (user) {
        const filtered: string[] = [];
        for (const stored of user.refreshTokens) {
          const matches = await bcrypt.compare(refreshToken, stored);
          if (!matches) filtered.push(stored);
        }
        user.refreshTokens = filtered;
        await user.save({ validateModifiedOnly: true });
      }
    }

    clearAuthCookies(res);
    void AuditEvent.log({ userId: req.user?.id, action: "logout", ip: req.ip, userAgent: req.headers["user-agent"], success: true });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken: string | undefined = req.cookies?.refresh_token;

    if (!refreshToken) {
      res
        .status(401)
        .json({ success: false, message: "Refresh token required" });
      return;
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.sub);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    // Verify the token is in the stored array (rotation check)
    let tokenFound = false;
    const filteredTokens: string[] = [];
    for (const stored of user.refreshTokens) {
      const matches = await bcrypt.compare(refreshToken, stored);
      if (matches) {
        tokenFound = true;
        // Do NOT keep the old token (rotation)
      } else {
        filteredTokens.push(stored);
      }
    }

    if (!tokenFound) {
      // Possible token reuse attack — clear all tokens
      user.refreshTokens = [];
      await user.save({ validateModifiedOnly: true });
      void AuditEvent.log({ userId: user._id.toString(), action: "token_reuse_detected", ip: req.ip, userAgent: req.headers["user-agent"], success: false });
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);
    filteredTokens.push(hashedRefresh);
    user.refreshTokens = filteredTokens;
    await user.save({ validateModifiedOnly: true });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({ success: true, message: "Tokens refreshed" });
  } catch (error) {
    next(error);
  }
}

// ─── Me ───────────────────────────────────────────────────────────────────────

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User retrieved",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const body = changePasswordSchema.parse(req.body);

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const isMatch = await user.comparePassword(body.currentPassword);
    if (!isMatch) {
      res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
      return;
    }

    // Hash new password (pre-save hook will also hash, but we set directly to avoid double-hash)
    user.password = await bcrypt.hash(body.newPassword, 12);
    // Invalidate all existing sessions (force re-login on other devices)
    user.refreshTokens = [];
    // Mark password as modified so pre-save hook skips hashing (already hashed above)
    user.markModified("password");
    await user.save({ validateModifiedOnly: true });

    // Clear cookies on this device too — user must log in again with new password
    clearAuthCookies(res);

    void AuditEvent.log({
      userId: user._id.toString(),
      email: user.email,
      action: "password_change",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      success: true,
    });

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully. Please log in again with your new password.",
    });
  } catch (error) {
    next(error);
  }
}

// ─── Dev-only: Create Admin Account ──────────────────────────────────────────
// Only available in NODE_ENV=development. Creates/updates a hardcoded admin
// account for local testing. NEVER expose in production.

export async function createDevAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (env.NODE_ENV !== "development") {
      res.status(403).json({ success: false, message: "Not available in production" });
      return;
    }

    const adminEmail = "admin@terno.dev";
    const adminPassword = "Admin@123456";
    const adminName = "Terno Admin";

    // Check if already exists
    let admin = await User.findOne({ email: adminEmail }).select("+password");

    if (admin) {
      // Already exists — just ensure role is admin
      admin.role = "admin";
      await admin.save({ validateModifiedOnly: true });
    } else {
      // Create fresh admin user
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dev admin account ready",
      data: {
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        note: "DEV ONLY — use these credentials to log in as admin at /auth/login",
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Dev-only: Create Master Account ─────────────────────────────────────────
export async function createDevMaster(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (env.NODE_ENV !== "development") {
      res.status(403).json({ success: false, message: "Not available in production" });
      return;
    }

    const masterEmail = "master@terno.dev";
    const masterPassword = "Master@123456";
    const masterName = "Terno Master";

    let master = await User.findOne({ email: masterEmail }).select("+password");
    if (master) {
      master.role = "master";
      await master.save({ validateModifiedOnly: true });
    } else {
      master = await User.create({
        name: masterName,
        email: masterEmail,
        password: masterPassword,
        role: "master",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dev master account ready",
      data: {
        email: masterEmail,
        password: masterPassword,
        role: "master",
        note: "DEV ONLY — use these credentials to log in as master at /auth/login",
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get all masters (admin only — used for trip form dropdown) ───────────────
export async function getMasters(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const masters = await User.find({ role: "master" }).select("_id name email");
    res.status(200).json({
      success: true,
      message: "Masters fetched",
      data: { masters },
    });
  } catch (error) {
    next(error);
  }
}

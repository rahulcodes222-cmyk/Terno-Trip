import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema } from "@terno/shared";
import { User } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies.js";
import { env } from "../config/env.js";

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
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(body.password);
    if (!isMatch) {
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

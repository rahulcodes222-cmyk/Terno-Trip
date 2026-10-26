import type { Response } from "express";
import { env } from "../config/env.js";

const isProd = env.NODE_ENV === "production";

/** 15 minutes in milliseconds */
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000;
/** 7 days in milliseconds */
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("access_token", { httpOnly: true, sameSite: "lax" });
  res.clearCookie("refresh_token", { httpOnly: true, sameSite: "lax" });
}

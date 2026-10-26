import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { updateProfileSchema } from "@terno/shared";
import { UserProfile } from "../models/UserProfile.js";

// ─── Update Preferences Schema (local) ───────────────────────────────────────

const updatePreferencesSchema = z.object({
  categories: z.array(z.string()).optional(),
  budget: z.string().optional(),
  notifications: z.boolean().optional(),
});

// ─── Internal Create Profile Schema ──────────────────────────────────────────

const createProfileSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  name: z.string().min(1, "name is required"),
  email: z.string().email("Invalid email"),
});

// ─── Get Profile ──────────────────────────────────────────────────────────────

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = updateProfileSchema.parse(req.body);

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: body },
      { new: true, runValidators: true, upsert: false }
    );

    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Get Preferences ─────────────────────────────────────────────────────────

export async function getPreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;

    const profile = await UserProfile.findOne({ userId }).select("preferences");

    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Preferences retrieved",
      data: { preferences: profile.preferences },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Update Preferences ───────────────────────────────────────────────────────

export async function updatePreferences(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const body = updatePreferencesSchema.parse(req.body);

    const updateFields: Record<string, unknown> = {};
    if (body.categories !== undefined)
      updateFields["preferences.categories"] = body.categories;
    if (body.budget !== undefined)
      updateFields["preferences.budget"] = body.budget;
    if (body.notifications !== undefined)
      updateFields["preferences.notifications"] = body.notifications;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!profile) {
      res.status(404).json({ success: false, message: "Profile not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated",
      data: { preferences: profile.preferences },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Internal: Create Profile ─────────────────────────────────────────────────

export async function createProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createProfileSchema.parse(req.body);

    // Upsert: if profile already exists (e.g. retry), just return it
    const profile = await UserProfile.findOneAndUpdate(
      { userId: body.userId },
      {
        $setOnInsert: {
          userId: body.userId,
          name: body.name,
          email: body.email,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "Profile created",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
}

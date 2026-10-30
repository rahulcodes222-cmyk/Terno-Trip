import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
} from "../controllers/user.controller.js";
import { extractUser } from "../middleware/extractUser.js";

const router = Router();

// GET  /api/v1/users/profile
router.get("/profile", extractUser, getProfile);

// PUT  /api/v1/users/profile
router.put("/profile", extractUser, updateProfile);

// GET  /api/v1/users/me  (alias — spec requirement)
router.get("/me", extractUser, getProfile);

// PATCH /api/v1/users/me  (alias — spec requirement)
router.patch("/me", extractUser, updateProfile);

// GET  /api/v1/users/preferences
router.get("/preferences", extractUser, getPreferences);

// PUT  /api/v1/users/preferences
router.put("/preferences", extractUser, updatePreferences);

export default router;

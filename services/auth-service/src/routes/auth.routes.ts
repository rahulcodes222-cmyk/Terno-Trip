import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  me,
  changePassword,
  createDevAdmin,
  createDevMaster,
  getMasters,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// POST /api/v1/auth/register
router.post("/register", register);

// POST /api/v1/auth/login
router.post("/login", login);

// POST /api/v1/auth/logout  (requires valid access token)
router.post("/logout", authenticate, logout);

// POST /api/v1/auth/refresh
router.post("/refresh", refresh);

// GET  /api/v1/auth/me  (requires valid access token)
router.get("/me", authenticate, me);

export default router;

// PATCH /api/v1/auth/change-password (requires valid access token)
router.patch("/change-password", authenticate, changePassword);

// POST /api/v1/auth/dev/create-admin  ← DEV ONLY, not available in production
router.post("/dev/create-admin", createDevAdmin);

// POST /api/v1/auth/dev/create-master  ← DEV ONLY
router.post("/dev/create-master", createDevMaster);

// GET /api/v1/auth/masters  ← admin only, returns list of masters for dropdown
router.get("/masters", authenticate, getMasters);

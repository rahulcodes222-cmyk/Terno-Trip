import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  me,
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

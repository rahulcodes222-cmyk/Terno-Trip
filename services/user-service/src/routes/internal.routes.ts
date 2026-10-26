import { Router } from "express";
import { createProfile } from "../controllers/user.controller.js";
import { serviceAuth } from "../middleware/serviceAuth.js";

const router = Router();

// POST /api/v1/internal/users — called by auth-service after registration
router.post("/users", serviceAuth, createProfile);

export default router;

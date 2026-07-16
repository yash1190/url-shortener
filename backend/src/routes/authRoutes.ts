import { Router } from "express";
import { register, login } from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();
router.post("/api/auth/register", register);
router.post("/api/auth/login", authLimiter, login);

export default router;
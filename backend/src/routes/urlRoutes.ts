import { Router } from "express";
import { shortenUrl, redirectToLongUrl, getUrlStats, getMyUrls } from "../controllers/urlController";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();

router.post("/api/urls", optionalAuth, shortenUrl);
router.get("/api/urls/mine", requireAuth, getMyUrls);
router.get("/api/urls/:shortCode/stats", requireAuth, getUrlStats);
router.get("/:shortCode", redirectToLongUrl);


export default router;
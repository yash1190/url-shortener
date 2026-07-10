import { Router } from "express";
import { shortenUrl, redirectToLongUrl, getUrlStats } from "../controllers/urlController";

const router = Router();

router.post("/api/urls", shortenUrl);
router.get("/api/urls/:shortCode/stats", getUrlStats);
router.get("/:shortCode", redirectToLongUrl);

export default router;
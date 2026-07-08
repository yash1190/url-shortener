import { Router } from "express";
import { shortenUrl, redirectToLongUrl } from "../controllers/urlController";

const router = Router();

router.post("/api/urls", shortenUrl);
router.get("/:shortCode", redirectToLongUrl);

export default router;
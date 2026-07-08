import { Request, Response } from "express";
import { redis } from "../config/redis";
import { Url } from "../models/Url";
import { createShortUrl } from "../services/urlService";

export const shortenUrl = async (req: Request, res: Response) => {
  try {
    const { longUrl, customAlias, expiresAt } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    try {
      new URL(longUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const url = await createShortUrl(
      longUrl,
      customAlias,
      undefined,
      expiresAt ? new Date(expiresAt) : undefined
    );

    return res.status(201).json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      longUrl: url.longUrl,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

export const redirectToLongUrl = async (req: Request, res: Response) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode) {
      return res.status(400).json({ error: "shortCode is required" });
    }

    // 1. Check Redis first (cache hit)
    const cached = await redis.get(`url:${shortCode}`);
    if (cached) {
      console.log("CACHE HIT:", shortCode);
      return res.redirect(302, cached);
    }

    // 2. Cache miss — fall back to MongoDB
    const url = await Url.findOne({ shortCode, isActive: true });
    if (!url) {
      return res.status(404).json({ error: "Short URL not found or expired" });
    }

    // 3. Populate the cache for next time (TTL: 1 hour = 3600s)
    console.log("CACHE MISS:", shortCode);
    await redis.set(`url:${shortCode}`, url.longUrl, "EX", 3600);

    // 4. Redirect
    return res.redirect(302, url.longUrl);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};
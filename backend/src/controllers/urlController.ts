import { Request, Response } from "express";
import { redis } from "../config/redis";
import { Url } from "../models/Url";
import { createShortUrl } from "../services/urlService";
import { logClick } from "../services/ClickService";
import { Click } from "../models/Click";
import { AuthRequest } from "../types";

export const shortenUrl = async (req: AuthRequest, res: Response) => {
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
      req.userId,
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

    if (!shortCode || typeof shortCode !== "string") {
      return res.status(400).json({ error: "shortCode is required" });
    }

    const referrer = req.get("referer") ?? null;
    const userAgent = req.get("user-agent") ?? null;

    // 1. Cache hit
    const cached = await redis.get(`url:${shortCode}`);
    if (cached) {
      logClick(shortCode, referrer, userAgent); // not awaited
      return res.redirect(302, cached);
    }

    // 2. Cache miss — fall back to MongoDB
    const url = await Url.findOne({ shortCode, isActive: true });
    if (!url) {
      return res.status(404).json({ error: "Short URL not found or expired" });
    }

    // 3. Populate cache
    await redis.set(`url:${shortCode}`, url.longUrl, "EX", 3600);

    // 4. Log + redirect
    logClick(shortCode, referrer, userAgent); // not awaited
    return res.redirect(302, url.longUrl);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUrlStats = async (req: AuthRequest, res: Response) => {
  try {
    const { shortCode } = req.params;

    if (!shortCode || typeof shortCode !== "string") {
      return res.status(400).json({ error: "shortCode is required" });
    }
    

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    if (!url.userId || url.userId !== req.userId) {
    return res.status(403).json({ error: "You don't have access to these stats" });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Pipeline 1: total clicks
    const totalClicks = await Click.countDocuments({ shortCode });

    // Pipeline 2: clicks per day, last 7 days
    const clicksPerDay = await Click.aggregate([
      { $match: { shortCode, timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    // Pipeline 3: top 5 referrers
    const topReferrers = await Click.aggregate([
      { $match: { shortCode } },
      {
        $group: {
          _id: { $ifNull: ["$referrer", "direct"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, referrer: "$_id", count: 1 } },
    ]);

    return res.json({
      shortCode,
      longUrl: url.longUrl,
      createdAt: url.createdAt,
      totalClicks,
      clicksPerDay,
      topReferrers,
    });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getMyUrls = async (req: AuthRequest, res: Response) => {
  try {
     const userId = req.userId;                      // ① copy to a local first
    if (typeof userId !== "string") {               // ② narrow it explicitly
      return res.status(401).json({ error: "Authentication required" });
    }
    const urls = await Url.find({ userId })         // ③ use the LOCAL variable
      .sort({ createdAt: -1 })
      .select("shortCode longUrl createdAt expiresAt isActive");
    return res.json(urls);
  } catch {
    return res.status(500).json({ error: "Something went wrong" });
  }
};
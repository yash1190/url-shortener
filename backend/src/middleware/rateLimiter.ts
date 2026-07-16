import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis";

const makeLimiter = (windowMs: number, max: number, prefix: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,   // send RateLimit-* headers so clients can see their quota
    legacyHeaders: false,
    store: new RedisStore({
      // ioredis exposes .call for raw commands — this is the documented adapter pattern
      sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
      prefix: `rl:${prefix}:`,
    }),
    message: { error: "Too many requests, please try again later" },
  });

// Strict on creates: 10 per hour per IP
export const createUrlLimiter = makeLimiter(60 * 60 * 1000, 10, "create");

// Moderate on auth: 20 per 15 minutes per IP (slows brute-force)
export const authLimiter = makeLimiter(15 * 60 * 1000, 20, "auth");

// Generous on redirects: 100 per minute per IP
export const redirectLimiter = makeLimiter(60 * 1000, 100, "redirect");
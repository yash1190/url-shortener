import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return secret;
};

// Strict: reject if no valid token
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { userId: string };
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Optional: attach userId if token present, continue regardless
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, getJwtSecret()) as { userId: string };
      req.userId = payload.userId;
    } catch {
      // invalid token on an optional route — proceed as anonymous
    }
  }
  return next();
};
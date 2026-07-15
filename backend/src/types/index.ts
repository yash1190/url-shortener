import { Document } from "mongoose";
import { Request } from "express";

export interface IUrl extends Document {
  shortCode: string;
  longUrl: string;
  userId: string | null;
  customAlias: boolean;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  email: string;
  password: string; // hashed, never plaintext
}

export interface IClick extends Document {
  shortCode: string;
  timestamp: Date;
  referrer: string | null;
  userAgent: string | null;
}

export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  userId?: string;
}
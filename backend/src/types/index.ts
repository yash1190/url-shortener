import { Document } from "mongoose";

export interface IUrl extends Document {
  shortCode: string;
  longUrl: string;
  userId: string | null;
  customAlias: boolean;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface IClick extends Document {
  shortCode: string;
  timestamp: Date;
  referrer: string | null;
  userAgent: string | null;
}
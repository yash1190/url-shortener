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
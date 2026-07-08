import { Schema, model } from "mongoose";
import { IUrl } from "../types";

const urlSchema = new Schema<IUrl>({
  shortCode: { type: String, required: true, unique: true, index: true },
  longUrl: { type: String, required: true },
  userId: { type: String, default: null },
  customAlias: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

// TTL index — Mongo deletes the doc once expiresAt passes.
// expireAfterSeconds: 0 means "expire at the stored date," not "0 seconds after insert".
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Url = model<IUrl>("Url", urlSchema);
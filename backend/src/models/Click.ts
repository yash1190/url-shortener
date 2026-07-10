import { Schema, model } from "mongoose";
import { IClick } from "../types";

const clickSchema = new Schema<IClick>({
  shortCode: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: null },
  userAgent: { type: String, default: null },
});

// Compound index: stats queries always filter by shortCode + time range
clickSchema.index({ shortCode: 1, timestamp: -1 });

export const Click = model<IClick>("Click", clickSchema);
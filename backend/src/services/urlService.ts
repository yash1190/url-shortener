import { customAlphabet } from "nanoid";
import { Url } from "../models/Url";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);

const MAX_RETRIES = 3;

export const generateUniqueShortCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const code = nanoid();
    const existing = await Url.findOne({ shortCode: code });
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique short code after retries");
};

export const createShortUrl = async (
  longUrl: string,
  customAlias?: string,
  userId?: string,
  expiresAt?: Date
) => {
  let shortCode: string;

  if (customAlias) {
    const existing = await Url.findOne({ shortCode: customAlias });
    if (existing) throw new Error("Custom alias already taken");
    shortCode = customAlias;
  } else {
    shortCode = await generateUniqueShortCode();
  }

  const url = await Url.create({
    shortCode,
    longUrl,
    userId: userId ?? null,
    customAlias: !!customAlias,
    expiresAt: expiresAt ?? null,
  });

  return url;
};
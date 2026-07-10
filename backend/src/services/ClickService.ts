import { Click } from "../models/Click";

export const logClick = (
  shortCode: string,
  referrer: string | null,
  userAgent: string | null
): void => {
  // Fire-and-forget: deliberately NOT awaited by the caller.
  // A failed analytics write should never break or slow a redirect.
  Click.create({ shortCode, referrer, userAgent }).catch((err) => {
    console.error("Failed to log click:", err.message);
  });
};
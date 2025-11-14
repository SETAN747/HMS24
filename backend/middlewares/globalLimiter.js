import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes time window
  max: 100,                   // 15 min me max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,      // rate limit info `RateLimit-*` headers me
  legacyHeaders: false,
});

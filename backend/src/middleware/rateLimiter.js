import rateLimit from "express-rate-limit";

// General API traffic — generous, since the whole site depends on it.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});

// Tighter limiter for search endpoints, which are the most expensive queries
// and the most attractive target for scraping (NFR-9 / NFR-12).
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many search requests. Please slow down and try again shortly." },
});

import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10000,
  message: "Too many requests from this IP. Please try again later."
});

  
export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 min
    max: 5,
    message: "Too many login attempts. Please try again later."
});
  
export const transactionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min
    max: 10,
    message: "Too many transaction requests. Please slow down."
});
import { RateLimiterMemory } from "rate-limiter-flexible";

const points = Number(process.env.RATE_LIMIT_POINTS || 10);
const duration = Number(process.env.RATE_LIMIT_DURATION || 60);

export const rateLimiter = new RateLimiterMemory({ points, duration });

export async function consumeRateLimit(ip: string) {
  try {
    await rateLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}
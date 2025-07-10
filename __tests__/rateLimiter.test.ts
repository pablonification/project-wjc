process.env.RATE_LIMIT_POINTS = "3";
import { rateLimiter } from "../lib/rateLimiter";

describe("rateLimiter", () => {
  it("should consume points and eventually block", async () => {
    const ip = "127.0.0.1";
    const points = 3;
    for (let i = 0; i < points; i++) {
      await expect(rateLimiter.consume(ip)).resolves.toBeDefined();
    }
    // Next call should reject
    await expect(rateLimiter.consume(ip)).rejects.toBeDefined();
  });
});
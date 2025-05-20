import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn("Upstash Redis environment variables not set. Rate limiting will be disabled.");
}

// 5 requests per 60 seconds from the same IP
export const ipRateLimiter = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit_ip",
}) : null; 
import { headers } from "next/headers";
import { ipRateLimiter } from "./rate-limiter";

const FALLBACK_IP_ADDRESS = "0.0.0.0";

async function getClientIp(): Promise<string> {
  let ip = FALLBACK_IP_ADDRESS;

  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      ip = forwardedFor.split(",")[0]?.trim() ?? FALLBACK_IP_ADDRESS;
    } else {
      ip = headersList.get("x-real-ip")?.trim() ?? FALLBACK_IP_ADDRESS;
    }
  } catch (error) {
    console.error("Error reading headers for IP address:", error);
    // ip remains FALLBACK_IP_ADDRESS
  }
  return ip;
}

export async function checkRateLimit(
  context?: string
): Promise<{ error?: string; ip?: string }> {
  const ip = await getClientIp();

  if (ipRateLimiter) {
    const { success, limit, remaining, reset } = await ipRateLimiter.limit(ip);
    const logContext = context ? `(${context})` : "";
    // console.log(
    //   `Rate limit check for IP ${ip} ${logContext}: success=${success}, remaining=${remaining}/${limit}`
    // );

    if (!success) {
      // console.warn(`Rate limit exceeded for IP ${ip} ${logContext}`);
      return { error: "Rate limit exceeded. Please try again later.", ip };
    }
  } else {
    console.warn("Rate limiting is disabled.");
  }
  return { ip };
} 
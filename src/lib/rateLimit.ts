import { prisma } from "@/lib/prisma";

/**
 * Fixed-window rate limit backed by a DB row (works across serverless
 * instances, unlike an in-memory counter). Returns true if the request
 * should be ALLOWED, false if it should be blocked.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();

  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!bucket || now.getTime() - bucket.windowStart.getTime() > windowSeconds * 1000) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now },
    });
    return true;
  }

  if (bucket.count >= limit) return false;

  await prisma.rateLimitBucket.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

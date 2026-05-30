import { NextResponse } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  funzonaRateLimitStore?: Map<string, Bucket>;
};

const buckets = globalStore.funzonaRateLimitStore || new Map<string, Bucket>();
globalStore.funzonaRateLimitStore = buckets;

function clientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return req.headers.get("x-real-ip") || "unknown";
}

function cleanupExpired(now: number) {
  if (buckets.size < 5000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(
  req: Request,
  namespace: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  cleanupExpired(now);

  const key = `${namespace}:${clientIp(req)}`;
  const current = buckets.get(key);
  const bucket =
    !current || current.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : current;

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return NextResponse.json(
    { error: "Слишком много запросов. Попробуйте немного позже." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    }
  );
}

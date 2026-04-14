/**
 * Sliding window rate limiter.
 *
 * LƯU Ý: Store dựa trên Map trong bộ nhớ process.
 * - Hoạt động tốt trên single-instance (dev, VPS, Docker 1 replica).
 * - Trên Vercel serverless: mỗi cold-start tạo Map mới, nên rate limit
 *   chỉ hiệu quả trong cùng 1 warm instance. Để production-grade,
 *   thay bằng @upstash/ratelimit + Upstash Redis.
 *
 * Cải thiện so với phiên bản cũ:
 * - LRU eviction khi store vượt MAX_KEYS (chống memory leak)
 * - Cleanup dùng đúng windowMs thay vì hardcode
 * - Không dùng setInterval (tương thích serverless)
 */

const MAX_KEYS = 10_000;

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  // Cleanup tối đa mỗi 60 giây
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }

  // LRU eviction nếu store quá lớn
  if (store.size > MAX_KEYS) {
    const keysToDelete = store.size - MAX_KEYS;
    const iterator = store.keys();
    for (let i = 0; i < keysToDelete; i++) {
      const key = iterator.next().value;
      if (key) store.delete(key);
    }
  }
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  cleanup(options.windowMs);

  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };

  // Remove expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < options.windowMs);

  if (entry.timestamps.length >= options.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = options.windowMs - (now - oldestInWindow);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: options.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

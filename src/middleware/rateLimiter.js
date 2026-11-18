const TokenBucket = require("../services/tokenBucket");
const stats = require("../utils/stats");

const bucketsByLimiter = new Set();

function getClientIp(req) {
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function getTotalActiveBuckets() {
  let total = 0;

  for (const buckets of bucketsByLimiter) {
    total += buckets.size;
  }

  return total;
}

stats.setActiveBucketsProvider(getTotalActiveBuckets);

function rateLimiter({ capacity, refillRate }) {
  const buckets = new Map();
  bucketsByLimiter.add(buckets);

  return function tokenBucketRateLimiter(req, res, next) {
    const ip = getClientIp(req);

    if (!buckets.has(ip)) {
      buckets.set(
        ip,
        new TokenBucket({
          capacity,
          refillRate
        })
      );
    }

    const bucket = buckets.get(ip);
    const result = bucket.tryConsume(1);

    res.set("X-RateLimit-Limit", String(capacity));
    res.set("X-RateLimit-Remaining", String(Math.floor(result.remainingTokens)));

    if (result.allowed) {
      stats.recordAllowed();
      return next();
    }

    const retryAfterSeconds = Math.ceil(result.retryAfter);

    stats.recordBlocked();
    res.set("Retry-After", String(retryAfterSeconds));

    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: retryAfterSeconds
    });
  };
}

rateLimiter.getTotalActiveBuckets = getTotalActiveBuckets;
rateLimiter.resetAllBuckets = function resetAllBuckets() {
  for (const buckets of bucketsByLimiter) {
    buckets.clear();
  }
  bucketsByLimiter.clear();
  stats.setActiveBucketsProvider(getTotalActiveBuckets);
};

module.exports = rateLimiter;

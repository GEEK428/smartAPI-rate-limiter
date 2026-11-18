const TokenBucket = require("../services/tokenBucket");

describe("TokenBucket", () => {
  test("initializes with a full bucket", () => {
    const bucket = new TokenBucket({
      capacity: 4,
      refillRate: 2,
      now: () => 100
    });

    expect(bucket.tokens).toBe(4);
    expect(bucket.capacity).toBe(4);
    expect(bucket.refillRate).toBe(2);
    expect(bucket.lastRefillTimestamp).toBe(100);
  });

  test("consumes one token when a request is allowed", () => {
    const bucket = new TokenBucket({
      capacity: 4,
      refillRate: 2,
      now: () => 100
    });

    const result = bucket.tryConsume(1, 100);

    expect(result.allowed).toBe(true);
    expect(bucket.tokens).toBe(3);
  });

  test("refills lazily only when a request arrives", () => {
    const bucket = new TokenBucket({
      capacity: 4,
      refillRate: 2,
      now: () => 100
    });

    bucket.tryConsume(1, 100);
    bucket.tryConsume(1, 100);
    expect(bucket.tokens).toBe(2);

    const result = bucket.tryConsume(1, 101.5);

    expect(result.allowed).toBe(true);
    expect(bucket.tokens).toBe(3);
    expect(bucket.lastRefillTimestamp).toBe(101.5);
  });

  test("caps refill at bucket capacity for burst handling", () => {
    const bucket = new TokenBucket({
      capacity: 4,
      refillRate: 2,
      now: () => 100
    });

    bucket.tryConsume(1, 100);
    bucket.tryConsume(1, 100);
    bucket.refill(200);

    expect(bucket.tokens).toBe(4);
  });

  test("calculates retryAfter from the missing token amount", () => {
    const bucket = new TokenBucket({
      capacity: 1,
      refillRate: 2,
      now: () => 100
    });

    bucket.tryConsume(1, 100);
    const blocked = bucket.tryConsume(1, 100.25);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeCloseTo(0.25);
  });
});

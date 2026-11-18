class TokenBucket {
  constructor({ capacity, refillRate, now = () => Date.now() / 1000 }) {
    if (!Number.isFinite(capacity) || capacity <= 0) {
      throw new Error("capacity must be a positive number");
    }

    if (!Number.isFinite(refillRate) || refillRate <= 0) {
      throw new Error("refillRate must be a positive number");
    }

    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefillTimestamp = now();
    this.now = now;
  }

  refill(currentTime = this.now()) {
    const elapsedTime = Math.max(0, currentTime - this.lastRefillTimestamp);
    const tokensToAdd = elapsedTime * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefillTimestamp = currentTime;

    return this.tokens;
  }

  tryConsume(tokensRequested = 1, currentTime = this.now()) {
    this.refill(currentTime);

    if (this.tokens >= tokensRequested) {
      this.tokens -= tokensRequested;
      return {
        allowed: true,
        remainingTokens: this.tokens,
        retryAfter: 0
      };
    }

    const tokensNeeded = tokensRequested - this.tokens;
    const retryAfter = tokensNeeded / this.refillRate;

    return {
      allowed: false,
      remainingTokens: this.tokens,
      retryAfter
    };
  }
}

module.exports = TokenBucket;

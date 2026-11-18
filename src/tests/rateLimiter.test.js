const request = require("supertest");
const express = require("express");
const rateLimiter = require("../middleware/rateLimiter");
const stats = require("../utils/stats");

function buildTestApp() {
  const app = express();
  app.set("trust proxy", true);
  app.use(
    "/limited",
    rateLimiter({
      capacity: 2,
      refillRate: 1
    })
  );
  app.get("/limited", (req, res) => {
    res.json({
      ok: true
    });
  });
  app.get("/stats", (req, res) => {
    res.json(stats.snapshot());
  });
  return app;
}

describe("rateLimiter middleware", () => {
  beforeEach(() => {
    stats.reset();
    rateLimiter.resetAllBuckets();
  });

  test("returns HTTP 429 after the bucket is empty", async () => {
    const app = buildTestApp();

    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(200);
    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(200);

    const response = await request(app)
      .get("/limited")
      .set("X-Forwarded-For", "1.1.1.1")
      .expect(429);

    expect(response.body).toEqual({
      error: "Rate limit exceeded",
      retryAfter: 1
    });
    expect(response.headers["retry-after"]).toBe("1");
  });

  test("keeps per-IP buckets isolated", async () => {
    const app = buildTestApp();

    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(200);
    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(200);
    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(429);

    await request(app).get("/limited").set("X-Forwarded-For", "2.2.2.2").expect(200);
  });

  test("tracks request statistics and active buckets", async () => {
    const app = buildTestApp();

    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(200);
    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(200);
    await request(app).get("/limited").set("X-Forwarded-For", "1.1.1.1").expect(429);

    const response = await request(app).get("/stats").expect(200);

    expect(response.body).toEqual({
      totalRequests: 3,
      allowedRequests: 2,
      blockedRequests: 1,
      activeBuckets: 1
    });
  });
});

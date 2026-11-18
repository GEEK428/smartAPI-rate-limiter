# Smart API Rate Limiter

Smart API Rate Limiter is a Node.js and Express application that controls API traffic using the Token Bucket algorithm. It protects endpoints from excessive request rates while allowing short bursts of legitimate traffic.

The project implements rate limiting from scratch without using third-party rate-limiting libraries. It demonstrates middleware-based request control, time-based state management, API protection, statistics tracking, automated testing, and load testing.

## Features

* Token Bucket rate limiting algorithm implemented from scratch
* Independent buckets for each client IP
* Environment-driven limits per endpoint
* Lazy refill mechanism without background jobs
* HTTP 429 responses for rate-limited requests
* Retry-After header support
* Rate limit metadata in response headers
* Statistics endpoint for monitoring traffic behavior
* Automated tests with Jest
* Load testing with Autocannon

## Problem

Public APIs and user-facing services can experience traffic spikes, abusive usage, scraping, or brute-force attempts. Uncontrolled traffic can increase latency, consume resources, and affect service reliability.

Rate limiting helps maintain service stability by allowing normal traffic patterns while restricting excessive request rates.

## How It Works

Each client IP receives an independent token bucket.

A bucket stores:

* Available tokens
* Maximum bucket capacity
* Refill rate
* Last refill timestamp

Every request consumes one token.

* If a token is available, the request is allowed.
* If no token is available, the request is rejected with HTTP 429 (Too Many Requests).

Tokens are replenished over time according to the configured refill rate, allowing traffic bursts while enforcing a long-term request rate.

## Why Token Bucket

Fixed Window rate limiting resets counters at fixed boundaries. This can allow large traffic bursts at window edges.

Example:

* 100 requests at the end of one minute
* 100 requests at the beginning of the next minute

Result:

* 200 requests in a very short period

Token Bucket avoids this problem by allowing controlled bursts while maintaining a steady long-term request rate.

## Lazy Refill

The implementation does not use:

* setInterval
* cron jobs
* background workers

Tokens are replenished only when a request arrives.

```text
elapsedTime = currentTime - lastRefillTimestamp
tokensToAdd = elapsedTime * refillRate
tokens = min(capacity, tokens + tokensToAdd)
```

This approach avoids unnecessary background work and scales efficiently because no computation occurs when the system is idle.

## Environment Configuration

Rate limits are loaded from environment variables through dotenv. The application fails fast during startup if any required value is missing, non-numeric, zero, or negative.

Create a local `.env` file from the example:

Windows:

```bash
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Example configuration:

```text
LOGIN_CAPACITY=4
LOGIN_REFILL_RATE=2

PROFILE_CAPACITY=10
PROFILE_REFILL_RATE=5

SEARCH_CAPACITY=20
SEARCH_REFILL_RATE=10

PORT=3000
```

To change an endpoint limit, edit `.env` and restart the server.

## Endpoint Limits

| Endpoint | Capacity Variable | Refill Rate Variable |
| -------- | ----------------- | -------------------- |
| /login   | LOGIN_CAPACITY    | LOGIN_REFILL_RATE    |
| /profile | PROFILE_CAPACITY  | PROFILE_REFILL_RATE  |
| /search  | SEARCH_CAPACITY   | SEARCH_REFILL_RATE   |

## Project Structure

```text
src/
├── config/
│   └── rateLimits.js
├── middleware/
│   └── rateLimiter.js
├── routes/
│   ├── login.js
│   ├── profile.js
│   └── search.js
├── services/
│   └── tokenBucket.js
├── tests/
│   ├── rateLimiter.test.js
│   └── tokenBucket.test.js
├── utils/
│   └── stats.js
└── server.js
```

## Installation

```bash
npm install
```

## Run

```bash
npm start
```

The server runs on the configured PORT.

## Useful Commands

```bash
curl http://localhost:3000/health
curl http://localhost:3000/login
curl http://localhost:3000/profile
curl "http://localhost:3000/search?q=nodejs"
curl http://localhost:3000/stats
```

## Sample Responses

Allowed Request:

```json
{
  "message": "Login endpoint allowed",
  "endpoint": "/login"
}
```

Rate-Limited Request:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 1
}
```

Statistics:

```json
{
  "totalRequests": 5000,
  "allowedRequests": 4300,
  "blockedRequests": 700,
  "activeBuckets": 120
}
```

## Retry-After

When a request is blocked, the API returns:

* HTTP 429
* Retry-After response header
* retryAfter JSON field

Calculation:

```text
retryAfter = (tokensRequested - currentTokens) / refillRate
```

The value is rounded up to whole seconds before being returned.

## Load Testing

Start the server:

```bash
npm start
```

Run one of the Autocannon scripts:

```bash
npm run load:login:small
npm run load:login:medium
npm run load:login:large
```

Compare load-test results with:

```bash
curl http://localhost:3000/stats
```

Under heavier traffic, blocked requests should increase as buckets become exhausted.

## Tests

```bash
npm test
```

Test coverage includes:

* bucket initialization
* token consumption
* lazy refill logic
* retry-after calculation
* HTTP 429 responses
* burst handling
* per-IP isolation

## Complexity

Time Complexity per Request:

```text
O(1)
```

Each request performs:

* IP lookup
* timestamp calculation
* token update
* decision logic

Memory Complexity:

```text
O(n)
```

Where:

```text
n = number of unique client IPs
```

Each IP owns one bucket.

## Future Scalability

The current implementation stores bucket state in memory.

For distributed deployments:

* Store bucket state in Redis
* Use atomic operations or Lua scripts
* Add bucket expiration using TTLs
* Share limits across multiple application instances
* Scale horizontally behind a load balancer

```
```

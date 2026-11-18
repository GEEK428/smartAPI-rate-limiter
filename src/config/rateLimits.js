require("dotenv").config({
  quiet: true
});

function readRequiredPositiveNumber(name) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `Invalid environment variable ${name}: expected a positive number, received "${rawValue}"`
    );
  }

  return value;
}

function readRequiredPort(name) {
  const value = readRequiredPositiveNumber(name);

  if (!Number.isInteger(value) || value > 65535) {
    throw new Error(
      `Invalid environment variable ${name}: expected an integer between 1 and 65535, received "${process.env[name]}"`
    );
  }

  return value;
}

const config = Object.freeze({
  port: readRequiredPort("PORT"),
  rateLimits: Object.freeze({
    login: Object.freeze({
      capacity: readRequiredPositiveNumber("LOGIN_CAPACITY"),
      refillRate: readRequiredPositiveNumber("LOGIN_REFILL_RATE")
    }),
    profile: Object.freeze({
      capacity: readRequiredPositiveNumber("PROFILE_CAPACITY"),
      refillRate: readRequiredPositiveNumber("PROFILE_REFILL_RATE")
    }),
    search: Object.freeze({
      capacity: readRequiredPositiveNumber("SEARCH_CAPACITY"),
      refillRate: readRequiredPositiveNumber("SEARCH_REFILL_RATE")
    })
  })
});

module.exports = config;

const REQUIRED_ENV = {
  LOGIN_CAPACITY: "4",
  LOGIN_REFILL_RATE: "2",
  PROFILE_CAPACITY: "10",
  PROFILE_REFILL_RATE: "5",
  SEARCH_CAPACITY: "20",
  SEARCH_REFILL_RATE: "10",
  PORT: "3000"
};

function loadConfigWith(env) {
  jest.resetModules();

  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    ...env
  };

  try {
    return require("../config/rateLimits");
  } finally {
    process.env = originalEnv;
  }
}

describe("rate limit configuration", () => {
  test("loads and converts environment variables to numbers", () => {
    const config = loadConfigWith(REQUIRED_ENV);

    expect(config).toEqual({
      port: 3000,
      rateLimits: {
        login: {
          capacity: 4,
          refillRate: 2
        },
        profile: {
          capacity: 10,
          refillRate: 5
        },
        search: {
          capacity: 20,
          refillRate: 10
        }
      }
    });
  });

  test("throws a descriptive error for invalid numeric configuration", () => {
    expect(() =>
      loadConfigWith({
        ...REQUIRED_ENV,
        LOGIN_CAPACITY: "0"
      })
    ).toThrow('Invalid environment variable LOGIN_CAPACITY: expected a positive number, received "0"');
  });

  test("throws a descriptive error when a required value is missing", () => {
    const env = {
      ...REQUIRED_ENV,
      SEARCH_REFILL_RATE: ""
    };

    expect(() => loadConfigWith(env)).toThrow(
      "Missing required environment variable: SEARCH_REFILL_RATE"
    );
  });
});

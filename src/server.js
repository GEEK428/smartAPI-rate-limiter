const express = require("express");
const config = require("./config/rateLimits");
const rateLimiter = require("./middleware/rateLimiter");
const loginRoutes = require("./routes/login");
const profileRoutes = require("./routes/profile");
const searchRoutes = require("./routes/search");
const stats = require("./utils/stats");

function createApp() {
  const app = express();

  app.set("trust proxy", true);
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      status: "ok"
    });
  });

  app.use(
    "/login",
    rateLimiter(config.rateLimits.login),
    loginRoutes
  );

  app.use(
    "/profile",
    rateLimiter(config.rateLimits.profile),
    profileRoutes
  );

  app.use(
    "/search",
    rateLimiter(config.rateLimits.search),
    searchRoutes
  );

  app.get("/stats", (req, res) => {
    res.json(stats.snapshot());
  });

  app.use((req, res) => {
    res.status(404).json({
      error: "Route not found"
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();

  app.listen(config.port, () => {
    console.log(`Smart API Rate Limiter running on http://localhost:${config.port}`);
  });
}

module.exports = createApp;

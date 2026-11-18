const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Search endpoint allowed",
    endpoint: "/search",
    query: req.query.q || null
  });
});

module.exports = router;

const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Login endpoint allowed",
    endpoint: "/login"
  });
});

router.post("/", (req, res) => {
  res.json({
    message: "Login request accepted",
    endpoint: "/login"
  });
});

module.exports = router;

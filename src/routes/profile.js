const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Profile endpoint allowed",
    endpoint: "/profile"
  });
});

module.exports = router;

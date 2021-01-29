const router = require("express").Router(),
  { login, register } = require("../controllers/authController"),
  rateLimit = require("express-rate-limit");

router.post(
  "/register",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
  }),
  register
);
router.post(
  "/login",
  rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 5,
  }),
  login
);

module.exports = router;

const router = require("express").Router(),
  bodyParser = require("body-parser"),
  jwt = require("jsonwebtoken"),
  cors = require("cors"),
  { verifyJwtMiddleware } = require("./controllers/authController"),
  rateLimit = require("express-rate-limit");

router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.use(cors());
router.use(verifyJwtMiddleware);

router.use(
  "/notes",
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
  }),
  require("./routes/notesRoute")
);

router.use("/auth", require("./routes/authRoute"));

router.get("/*", (req, res, next) => {
  res.status(404).json({ error: 404, message: "Page not found." });
});

module.exports = router;

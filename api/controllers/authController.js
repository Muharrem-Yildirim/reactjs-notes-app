const User = require("../models/userModel"),
  jwt = require("jsonwebtoken"),
  bcrypt = require("bcrypt");

const loginRequired = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({ error: 401, message: "Unauthorized user." });
  }
};

const login = (req, res) => {
  User.findOne(
    {
      username: req.body.username,
    },
    function (err, user) {
      if (err) throw err;
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({
          error: 401,
          message: "Invalid username or password.",
        });
      }
      return res.json({
        token: jwt.sign(
          { _id: user._id, username: user.username },
          process.env.JWT_SECRET || "V3RY-S3CR3T-K3Y",
          {
            expiresIn: "24h",
            notBefore: "1s",
          }
        ),
      });
    }
  );
};

const register = (req, res) => {
  var newUser = new User(req.body);
  newUser.username = req.body.username;
  newUser.hash_password = bcrypt.hashSync(req.body.password, 10);
  newUser.save(function (err, user) {
    if (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        return res
          .status(422)
          .send({ error: 422, succes: false, message: "User already exist!" });
      }

      return res.status(400).send({
        message: err,
      });
    } else {
      user.hash_password = undefined;
      return res.json({ ...user, success: true });
    }
  });
};

const verifyJwtMiddleware = (req, res, next) => {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_SECRET || "V3RY-S3CR3T-K3Y",
      function (err, decode) {
        if (err) req.user = undefined;
        req.user = decode;
        next();
      }
    );
  } else {
    req.user = undefined;
    next();
  }
};

module.exports = {
  loginRequired,
  login,
  register,
  verifyJwtMiddleware,
};

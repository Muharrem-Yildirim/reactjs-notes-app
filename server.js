require("dotenv").config();

const path = require("path"),
  express = require("express"),
  mongoose = require("mongoose"),
  port = process.env.WEB_PORT || 2000,
  appRoutes = ["/", "/login", "/register", "/logout"];

console.log(
  "\x1b[32m",
  "================================================================================",
  "\x1b[0m"
);

mongoose
  .connect("mongodb://localhost:27017/note-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true, //araştır
    useCreateIndex: true, //araştır
  })
  .then(() => {
    const app = new express();

    app.set("json spaces", 2);

    app.use("/api", require("./api/api.js"));

    app.use(express.static(path.join("app", "build")));

    app.get(appRoutes, (req, res, next) => {
      res.sendFile(path.join(__dirname, "app", "build", "index.html"));
    });

    app.get("/*", (req, res, next) => {
      res.sendStatus(404);
    });

    app.listen(2000, () => {
      console.log(` > Web server is listening on: ${port} port.`);
      console.log(
        "\x1b[32m",
        "================================================================================",
        "\x1b[0m",
        "\n"
      );
    });
  });

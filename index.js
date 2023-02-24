const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
require("./config/db");
const importAlert = require("./config/importAlert");
const importError = require("./config/importError");
const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to ITU-ECA" });
});

app.use([importAlert, importError]);

const privateKey = fs.readFileSync(
  path.join(__dirname, "/keys/private.key"),
  "utf8"
);
const bundle = fs.readFileSync(
  path.join(__dirname, "/keys/bundle.ca-bundle"),
  "utf8"
);

const certificate = fs.readFileSync(
  path.join(__dirname, "/keys/certificate.crt"),
  "utf8"
);

https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  )
  .listen(5050, () =>
    console.log("HTTPS Server are created and started at port 5001")
  );

app.listen(process.env.PORT || 5051, function () {
  console.info("HTTP Server Started at port", process.env.PORT || 5051);
});

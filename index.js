const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const actuator = require("express-actuator");
require("dotenv").config();
require("./config/db");
const importAlert = require("./config/importAlert");
const importError = require("./config/importError");
const importDatatable = require("./config/importDataTables");
const route = require("./routes/index");
const options = {
  basePath: "/api", // It will set /management/info instead of /info
  infoGitMode: "full", // the amount of git information you want to expose, 'simple' or 'full',
  infoBuildOptions: null, // extra information you want to expose in the build object. Requires an object.
  infoDateFormat: null, // by default, git.commit.time will show as is defined in git.properties. If infoDateFormat is defined, moment will format git.commit.time. See https://momentjs.com/docs/#/displaying/format/.
  customEndpoints: [], // array of custom endpoints
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(actuator(options));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to ITU-ECA" });
});

app.use([importAlert, importError, importDatatable, route]);

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
    console.log("HTTPS Server are created and started at port 5050")
  );

app.listen(process.env.PORT || 5051, function () {
  console.info("HTTP Server Started at port", process.env.PORT || 5051);
});

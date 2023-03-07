const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const actuator = require("express-actuator");
const cors = require("cors");
require("dotenv").config();
require("./config/db");
const { updateVisitor } = require("./config/cronVisitor");
const importAlert = require("./config/importAlert");
const importError = require("./config/importError");
const importDatatable = require("./config/importDataTables");
const route = require("./routes/index");

const telematic = require("./routes/telematic");

const morgan = require("morgan");
const { options, morganOptions } = require("./config/index");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(actuator(options));
app.use(morgan(morganOptions));
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to ITU-ECA" });
});


app.use([importAlert, importError, importDatatable, route, telematic]);


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

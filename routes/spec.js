const express = require("express");
const cron = require("node-cron");
const AlertModel = require("../models/alert");
const ErrorModel = require("../models/error");
const AndroidModel = require("../models/android");
const IphoneModel = require("../models/iphone");
const EquipmentModel = require("../models/equipment");
const VisitorModel = require("../models/visitor");
const DatatableModel = require("../models/datatable");
const { application } = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");
const specModels = require("../models/spec");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/api/spec", async (req, res) => {
  const dataSpec = req.body.spec;

  const spec = {};

  dataSpec.forEach(({ name, value }) => {
    spec[name] = value;
  });
  console.log(spec);

  try {
    const newSpec = await specModels.create({
      spec,
    });
    return res.status(200).json(newSpec);
  } catch (err) {
    return res.status(500).json(err.toString());
  }
});

module.exports = app;

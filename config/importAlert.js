const excelToJson = require("convert-excel-to-json");
const Alert = require("../models/alert");
const express = require("express");
const app = express.Router();

app.get("/importAlert", async (req, res) => {
  const result = excelToJson({
    sourceFile: "Alerts.xlsx",
    header: {
      rows: 1,
    },
    columnToKey: {
      "*": "{{columnHeader}}",
    },
  });
  const bulk = [];
  for (const dataToInsert of result.Alert) {
    bulk.push({
      insertOne: {
        document: {
          company_code: dataToInsert.company_code,
          machine: dataToInsert.machine,
          date: dataToInsert.date,
          alert_type: dataToInsert.alert_type,
          priority: dataToInsert.priority,
          counter: dataToInsert.counter,
          company: dataToInsert.company,
          serial_number: dataToInsert.serial_number,
          local_code: dataToInsert.local_code,
          service_interval: dataToInsert.service_interval,
        },
      },
    });
  }
  if (bulk.length > 0) await Alert.bulkWrite(bulk);
  res.json(bulk);
});

module.exports = app;

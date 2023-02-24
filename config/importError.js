const excelToJson = require("convert-excel-to-json");
const Error = require("../models/error");
const express = require("express");
const app = express.Router();

app.get("/importError", async (req, res) => {
  const result = excelToJson({
    sourceFile: "Error Codes.xlsx",
    header: {
      rows: 1,
    },
    columnToKey: {
      "*": "{{columnHeader}}",
    },
  });
  const bulk = [];
  for (const dataToInsert of result.error_codes) {
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
        },
      },
    });
  }
  if (bulk.length > 0) await Error.bulkWrite(bulk);
  res.json(bulk);
});

module.exports = app;

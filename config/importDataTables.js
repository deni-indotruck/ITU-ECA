const excelToJson = require("convert-excel-to-json");
const DataTable = require("../models/datatable");
const express = require("express");
const app = express.Router();

app.get("/importDatatable", async (req, res) => {
  const result = excelToJson({
    sourceFile: "Datatable.xlsx",
    header: {
      rows: 5,
    },
    columnToKey: {
      A: "machine",
      B: "chassis_id",
      C: "total_machine_hour",
      D: "location",
      E: "last_update_selected_date",
      F: "fuel_level",
      G: "customer",
    },
  });
  const bulk = [];
  for (const dataToInsert of result.status_report) {
    bulk.push({
      insertOne: {
        document: {
          machine: dataToInsert.machine,
          chassis_id: dataToInsert.chassis_id,
          total_machine_hour: dataToInsert.total_machine_hour,
          location: dataToInsert.location,
          last_update_selected_date: dataToInsert.last_update_selected_date,
          fuel_level: dataToInsert.fuel_level,
          customer: dataToInsert.customer,
        },
      },
    });
  }
  if (bulk.length > 0) await DataTable.bulkWrite(bulk);
  res.json(bulk);
});

module.exports = app;

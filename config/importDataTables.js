const excelToJson = require("convert-excel-to-json");
const DataTable = require("../models/datatable");
const DataTable_Backup = require("../models/datatable_backup");
const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");

app.get("/importDatatableOld", async (req, res) => {
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

app.get("/importDatatable", async (req, res) => {
  // Check Exist Collection Alert
  const db = mongoose.connection.db;
  // Check if the "datatables" collection exists
  db.listCollections({ name: "datatables" }).next((err, collinfo) => {
    if (err) {
      console.log(err);
      return;
    } else {
      // founded "datatables" colection, then backup to "datatable_backups"
      console.log(
        `founded "datatables" colection, then backup to "datatable_backups"`
      );
      DataTable.aggregate([
        { $match: {} }, // match all documents in the collection
        { $out: "datatable_backups" }, // output the documents to the backup collection
      ]).exec((err, result) => {
        if (err) {
          console.log(err);
        } else {
          // success backup, then removing old data in datatables
          console.log(`success backup, then removing old data in datatables`);
          DataTable.deleteMany({}, (err) => {
            if (err) {
              console.log(`Error deleting documents: ${err}`);
            } else {
              // success removing data datatables, then insert new data from excel to datatables collection
              console.log(
                "success removing data datatables, then insert new data from excel to datatables collection"
              );
              var Object = [];
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
                      last_update_selected_date:
                        dataToInsert.last_update_selected_date,
                      fuel_level: dataToInsert.fuel_level,
                      customer: dataToInsert.customer,
                    },
                  },
                });
              }
              if (bulk.length > 0) {
                DataTable.bulkWrite(bulk, (err, result) => {
                  if (err) {
                    console.log(
                      `Error DataTable Bulk Insert Documents: ${err}`
                    );
                    DataTable.deleteMany().exec();

                    DataTable_Backup.aggregate([
                      { $match: {} }, // match all documents in the collection
                      { $out: "datatables" }, // output the documents to the backup collection
                    ]).exec((err, result) => {
                      if (err) {
                        console.log(err);
                      } else {
                        DataTable_Backup.collection.drop();
                        // success move again from datatable_backups to datatables again
                        console.log(`datatable_backups moved to datatables`);
                      }
                    });
                    console.log(
                      `datatable_backups already Moved Again To datatables`
                    );
                    res.status(500).send("Error");
                  } else {
                    DataTable_Backup.deleteMany();
                    DataTable_Backup.collection.drop();
                    console.log(`datatable_backups already Deleted`);
                    res.status(200).send("Success");
                  }
                });
              }
            }
          });
        }
      });
    }
  });
});

module.exports = app;

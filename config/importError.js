const excelToJson = require("convert-excel-to-json");
const Error = require("../models/error");
const Error_Backup = require("../models/error_backup");
const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");

app.get("/importErrorOld", async (req, res) => {
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
          error_type: dataToInsert.error_type,
          priority: dataToInsert.priority,
          counter: dataToInsert.counter,
          company: dataToInsert.company,
          model: dataToInsert.model,
          serial_number: dataToInsert.serial_number,
          local_code: dataToInsert.local_code,
        },
      },
    });
  }
  if (bulk.length > 0) await Error.bulkWrite(bulk);
  res.json(bulk);
});

app.get("/importError", async (req, res) => {
  // Check Exist Collection Alert
  const db = mongoose.connection.db;
  // Check if the "errors" collection exists
  db.listCollections({ name: "errors" }).next((err, collinfo) => {
    if (err) {
      console.log(err);
      return;
    } else {
      // founded "errors" colection, then backup to "error_backups"
      console.log(`founded "errors" colection, then backup to "error_backups"`);
      Error.aggregate([
        { $match: {} }, // match all documents in the collection
        { $out: "error_backups" }, // output the documents to the backup collection
      ]).exec((err, result) => {
        if (err) {
          console.log(err);
        } else {
          // success backup, then removing old data in errors
          console.log(`success backup, then removing old data in errors`);
          Error.deleteMany({}, (err) => {
            if (err) {
              console.log(`Error deleting documents: ${err}`);
            } else {
              // success removing data errors, then insert new data from excel to errors collection
              console.log(
                "success removing data errors, then insert new data from excel to errors collection"
              );
              var Object = [];
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
                      error_type: dataToInsert.error_type,
                      priority: dataToInsert.priority,
                      counter: dataToInsert.counter,
                      company: dataToInsert.company,
                      model: dataToInsert.model,
                      serial_number: dataToInsert.serial_number,
                      local_code: dataToInsert.local_code,
                    },
                  },
                });
              }
              if (bulk.length > 0) {
                Error.bulkWrite(bulk, (err, result) => {
                  if (err) {
                    console.log(`Error Bulk Insert Documents: ${err}`);
                    Error.deleteMany();

                    Error_Backup.aggregate([
                      { $match: {} }, // match all documents in the collection
                      { $out: "errors" }, // output the documents to the backup collection
                    ]).exec((err, result) => {
                      if (err) {
                        console.log(err);
                      } else {
                        Error_Backup.collection.drop();
                        // success move again from error_backups to errors again
                        console.log(`error_backups moved to errors`);
                      }
                    });
                    console.log(`error_backups already Moved Again To errors`);
                    res.status(500).send("Error");
                  } else {
                    Error_Backup.deleteMany();
                    Error_Backup.collection.drop();
                    console.log(`error_backups already Deleted`);
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

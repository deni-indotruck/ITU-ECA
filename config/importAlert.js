const excelToJson = require("convert-excel-to-json");
const Alert = require("../models/alert");
const Alert_Backup = require("../models/alert_backup");
const express = require("express");
const app = express.Router();
const mongoose = require("mongoose");

app.get("/importAlert007", async (req, res) => {
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

app.get("/importAlert", async (req, res) => {
  // Check Exist Collection Alert
  const db = mongoose.connection.db;
  // Check if the "alerts" collection exists
  db.listCollections({ name: "alerts" }).next((err, collinfo) => {
    if (err) {
      console.log(err);
      return;
    } else {
      // founded "alerts" colection, then backup to "alert_backups"
      console.log(`founded "alerts" colection, then backup to "alert_backups"`);
      Alert.aggregate([
        { $match: {} }, // match all documents in the collection
        { $out: "alert_backups" }, // output the documents to the backup collection
      ]).exec((err, result) => {
        if (err) {
          console.log(err);
        } else {
          // success backup, then removing old data in alerts
          console.log(`success backup, then removing old data in alerts`);
          Alert.deleteMany({}, (err) => {
            if (err) {
              console.log(`Error deleting documents: ${err}`);
            } else {
              // success removing data alerts, then insert new data from excel to alerts collection
              console.log(
                "success removing data Alerts, then insert new data from excel to alerts collection"
              );
              var Object = [];
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
              if (bulk.length > 0) {
                Alert.bulkWrite(bulk, (err, result) => {
                  if (err) {
                    console.log(`Error Bulk Insert Documents: ${err}`);
                    Alert.deleteMany();
                    Alert_Backup.aggregate([
                      { $match: {} }, // match all documents in the collection
                      { $out: "alerts" }, // output the documents to the backup collection
                    ]).exec((err, result) => {
                      if (err) {
                        console.log(err);
                      } else {
                        // success move again from alert_backups to alerts again
                        console.log(`Alert_Backups moved to Alerts`);
                      }
                    });
                    console.log(`Alert_Backups already Moved Again To Alerts`);
                    res.status(500).send("Error");
                  } else {
                    Alert_Backup.deleteMany();
                    Alert_Backup.collection.drop();
                    console.log(`Alert_Backups already Deleted`);
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

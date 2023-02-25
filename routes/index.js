const express = require("express");
const AlertModel = require("../models/alert");
const ErrorModel = require("../models/error");
const DatatableModel = require("../models/datatable");
const app = express.Router();

app.get("/api/datatable", async (req, res) => {
  const datatable = await DatatableModel.find();

  const result = datatable.map((v) => {
    const [company, ...rest] = v.machine.split(" ");
    return {
      company: company,
      machine: v.machine,
      total_machine_hour: v.total_machine_hour,
    };
  });
  res.status(200).json(result);
});

app.get("/api/alert", async (req, res) => {
  const alert = await AlertModel.find();

  res.status(200).json(alert);
});

app.get("/api/error", async (req, res) => {
  const error = await ErrorModel.find();

  res.status(200).json(error);
});

app.get("/api/top10error", async (req, res) => {
  try {
    const top10error = await ErrorModel.aggregate([
      {
        $group: {
          _id: "$error_type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json(top10error);
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/top10alert", async (req, res) => {
  try {
    const top10alert = await AlertModel.aggregate([
      {
        $group: {
          _id: "$alert_type",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    res.status(200).json(top10alert);
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/top10errorbymachine", async (req, res) => {
  try {
    const top10errorbymachine = await ErrorModel.aggregate([
      {
        $group: {
          _id: "$model",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
    res.status(200).json(top10errorbymachine);
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const errorCount = await ErrorModel.estimatedDocumentCount();
    const alertCount = await AlertModel.estimatedDocumentCount();
    const machineMonitoring = await DatatableModel.estimatedDocumentCount();
    const alertPriority1 = await AlertModel.countDocuments({
      priority: "1",
    });
    const alertPriority2 = await AlertModel.countDocuments({
      priority: "2",
    });
    const alertPriority3 = await AlertModel.countDocuments({
      priority: "3",
    });

    const errorPriority1 = await ErrorModel.countDocuments({
      priority: "1",
    });
    const errorPriority2 = await ErrorModel.countDocuments({
      priority: "2",
    });
    const errorPriority3 = await ErrorModel.countDocuments({
      priority: "3",
    });
    res.status(200).json({
      total_error: errorCount,
      total_alert: alertCount,
      total_machine: machineMonitoring,
      alert_priority_1: alertPriority1,
      alert_priority_2: alertPriority2,
      alert_priority_3: alertPriority3,
      error_priority_1: errorPriority1,
      error_priority_2: errorPriority2,
      error_priority_3: errorPriority3,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});
module.exports = app;

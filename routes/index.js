const express = require("express");
const AlertModel = require("../models/alert");
const ErrorModel = require("../models/error");
const DatatableModel = require("../models/datatable");
const app = express.Router();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/api/datatable", async (req, res) => {
  var page = req.query.page;
  var per_page = 10;
  const totalDatatable = await DatatableModel.estimatedDocumentCount();
  const datatable = await DatatableModel.find()
    .skip((page - 1) * per_page)
    .limit(per_page);

  const result = datatable.map((v) => {
    const [company, ...rest] = v.machine.split(" ");
    return {
      company: company,
      machine: v.machine,
      total_machine_hour: v.total_machine_hour,
    };
  });
  res
    .status(200)
    .json({ totalData: totalDatatable, currentPage: page, data: result });
});

app.get("/api/alert", async (req, res) => {
  var page = req.query.page;
  var per_page = 10;
  try {
    const totalAlert = await AlertModel.estimatedDocumentCount();
    const alert = await AlertModel.find()
      .skip((page - 1) * per_page)
      .limit(per_page);

    res
      .status(200)
      .json({ totalData: totalAlert, currentPage: page, data: alert });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

// app.get("/api/alert", async (req, res) => {
//   var year = req.query.year;
//   var month = req.query.month;
//   var page = req.query.page;
//   var per_page = 10;

//   if (year != "") {
//     var yearNow = new Date(year);
//     var oneYearFromNow = new Date(year);
//     oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
//     if (month != "") {
//       yearNow.setMonth(month - 1);
//       var oneMonthFromNow = new Date(year);
//       oneMonthFromNow.setMonth(month);
//       const alert = await AlertModel.find({
//         date: { $gt: yearNow, $lt: oneMonthFromNow },
//       })
//         .skip((page - 1) * per_page)
//         .limit(page * per_page);
//       const totalAlertFiltered = await AlertModel.countDocuments({
//         date: { $gt: yearNow, $lt: oneMonthFromNow },
//       });

//       res.status(200).json({
//         min: yearNow,
//         max: oneMonthFromNow,
//         totalData: totalAlertFiltered,
//         data: alert,
//       });
//     } else {
//       const alert = await AlertModel.find({
//         date: { $gt: yearNow, $lt: oneYearFromNow },
//       })
//         .skip((page - 1) * per_page)
//         .limit(page * per_page);
//       const totalAlertFiltered = await AlertModel.countDocuments({
//         date: { $gt: yearNow, $lt: oneYearFromNow },
//       });

//       res.status(200).json({
//         min: yearNow,
//         max: oneYearFromNow,
//         totalData: totalAlertFiltered,
//         data: alert,
//       });
//     }
//   } else {
//     const alert = await AlertModel.find()
//       .skip((page - 1) * per_page)
//       .limit(page * per_page);
//     const totalAlertFiltered = await AlertModel.countDocuments();

//     res.status(200).json({
//       min: "kosong",
//       max: "kosong",
//       totalData: totalAlertFiltered,
//       data: alert,
//     });
//   }
// });

app.get("/api/error", async (req, res) => {
  var page = req.query.page;
  var per_page = 10;
  try {
    const totalError = await ErrorModel.estimatedDocumentCount();
    const error = await ErrorModel.find()
      .skip((page - 1) * per_page)
      .limit(per_page);
    res
      .status(200)
      .json({ totalData: totalError, currentPage: page, data: error });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
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

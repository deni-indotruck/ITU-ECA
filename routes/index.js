const express = require("express");
const cron = require("node-cron");
const AlertModel = require("../models/alert");
const ErrorModel = require("../models/error");
const AndroidModel = require("../models/android");
const IphoneModel = require("../models/iphone");
const EquipmentModel = require("../models/equipment");
const DatatableModel = require("../models/datatable");
const VisitorModel = require("../models/visitor");
const { application } = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const axios = require("axios");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get("/api/datatable", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }

  var page = req.query.page;
  var per_page = req.query.limit || 10;

  const year = req.query.year;
  const month = req.query.month;
  try {
    if (!year && !month) {
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
    } else if (year && !month) {
      const totalDatatable = await DatatableModel.find({
        $expr: {
          $eq: [{ $year: "$last_update_selected_date" }, year],
        },
      }).countDocuments();
      const datatable = await DatatableModel.find({
        $expr: {
          $eq: [{ $year: "$last_update_selected_date" }, year],
        },
      })
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
    } else if (month && !year) {
      const totalDatatable = await DatatableModel.find({
        $expr: {
          $eq: [{ $month: "$last_update_selected_date" }, month],
        },
      }).countDocuments();
      const datatable = await DatatableModel.find({
        $expr: {
          $eq: [{ $month: "$last_update_selected_date" }, month],
        },
      })
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
    } else if (year && month) {
      const totalDatatable = await DatatableModel.find({
        $and: [
          {
            $expr: {
              $eq: [{ $year: "$last_update_selected_date" }, year],
            },
          },
          {
            $expr: {
              $eq: [{ $month: "$last_update_selected_date" }, month],
            },
          },
        ],
      }).countDocuments();
      const datatable = await DatatableModel.find({
        $and: [
          {
            $expr: {
              $eq: [{ $year: "$last_update_selected_date" }, year],
            },
          },
          {
            $expr: {
              $eq: [{ $month: "$last_update_selected_date" }, month],
            },
          },
        ],
      })
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
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/alert", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }

  var page = req.query.page;
  var per_page = req.query.limit || 10;

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

app.get("/api/error", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }

  var page = req.query.page;
  var per_page = req.query.limit || 10;

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
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);
  try {
    if (year && !month) {
      const top10error = await ErrorModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        },
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
    } else if (month && !year) {
      const top10error = await ErrorModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        },
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
    } else if (year && month) {
      const top10error = await ErrorModel.aggregate([
        {
          $match: {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        },
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
    } else if (!year && !month) {
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
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/top10alert", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);
  try {
    if (year && !month) {
      const top10alert = await AlertModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        },
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
    } else if (month && !year) {
      const top10alert = await AlertModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        },
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
    } else if (year && month) {
      const top10alert = await AlertModel.aggregate([
        {
          $match: {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        },
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
    } else if (!month && !year) {
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
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/top10errorbymachine", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);
  try {
    if (year && !month) {
      const top10errorbymachine = await ErrorModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        },
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
      // const top10errorbymachine = await ErrorModel.aggregate([
      //   {
      //     $match: {
      //       $expr: {
      //         $eq: [{ $year: "$date" }, year],
      //       },
      //     },
      //   },
      // ]);
      res.status(200).json(top10errorbymachine);
    } else if (month && !year) {
      const top10errorbymachine = await ErrorModel.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        },
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
      // const top10errorbymachine = await ErrorModel.aggregate([
      //   {
      //     $match: {
      //       $expr: {
      //         $eq: [{ $year: "$date" }, year],
      //       },
      //     },
      //   },
      // ]);
      res.status(200).json(top10errorbymachine);
    } else if (year && month) {
      const top10errorbymachine = await ErrorModel.aggregate([
        {
          $match: {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        },
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
      // const top10errorbymachine = await ErrorModel.aggregate([
      //   {
      //     $match: {
      //       $expr: {
      //         $eq: [{ $year: "$date" }, year],
      //       },
      //     },
      //   },
      // ]);
      res.status(200).json(top10errorbymachine);
    } else if (!year && !month) {
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
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }
  try {
    const year = req.query.year;
    const month = req.query.month;
    if (!year && !month) {
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
        visitor: "0",
        android: "0",
        iphone: "0",
        equipment: "0",
      });
    } else if (year && !month) {
      const errorCount = await ErrorModel.find({
        $expr: {
          $eq: [{ $year: "$date" }, year],
        },
      }).countDocuments();
      const alertCount = await AlertModel.find({
        $expr: {
          $eq: [{ $year: "$date" }, year],
        },
      }).countDocuments();
      const machineMonitoring = await DatatableModel.find({
        $expr: {
          $eq: [{ $year: "$last_update_selected_date" }, year],
        },
      }).countDocuments();
      const alertPriority1 = await AlertModel.find({
        $and: [
          {
            priority: "1",
          },

          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        ],
      }).countDocuments();
      const alertPriority2 = await AlertModel.find({
        $and: [
          {
            priority: "2",
          },

          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        ],
      }).countDocuments();
      const alertPriority3 = await AlertModel.find({
        $and: [
          {
            priority: "3",
          },

          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        ],
      }).countDocuments();

      const errorPriority1 = await ErrorModel.find({
        $and: [
          {
            priority: "1",
          },

          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        ],
      }).countDocuments();
      const errorPriority2 = await ErrorModel.find({
        $and: [
          {
            priority: "2",
          },

          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        ],
      }).countDocuments();
      const errorPriority3 = await ErrorModel.find({
        $and: [
          {
            priority: "3",
          },

          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
        ],
      }).countDocuments();
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
        visitor: "0",
        android: "0",
        iphone: "0",
        equipment: "0",
      });
    } else if (!year && month) {
      const errorCount = await ErrorModel.find({
        $expr: {
          $eq: [{ $month: "$date" }, month],
        },
      }).countDocuments();
      const alertCount = await AlertModel.find({
        $expr: {
          $eq: [{ $month: "$date" }, month],
        },
      }).countDocuments();
      const machineMonitoring = await DatatableModel.find({
        $expr: {
          $eq: [{ $month: "$last_update_selected_date" }, month],
        },
      }).countDocuments();
      const alertPriority1 = await AlertModel.find({
        $and: [
          {
            priority: "1",
          },

          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
      const alertPriority2 = await AlertModel.find({
        $and: [
          {
            priority: "2",
          },

          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
      const alertPriority3 = await AlertModel.find({
        $and: [
          {
            priority: "3",
          },

          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();

      const errorPriority1 = await ErrorModel.find({
        $and: [
          {
            priority: "1",
          },

          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
      const errorPriority2 = await ErrorModel.find({
        $and: [
          {
            priority: "2",
          },

          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
      const errorPriority3 = await ErrorModel.find({
        $and: [
          {
            priority: "3",
          },

          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
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
        visitor: "0",
        android: "0",
        iphone: "0",
        equipment: "0",
      });
    } else if (year && month) {
      const errorCount = await ErrorModel.find({
        $and: [
          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
      const alertCount = await AlertModel.find({
        $and: [
          {
            $expr: {
              $eq: [{ $year: "$date" }, year],
            },
          },
          {
            $expr: {
              $eq: [{ $month: "$date" }, month],
            },
          },
        ],
      }).countDocuments();
      const machineMonitoring = await DatatableModel.find({
        $and: [
          {
            $expr: {
              $eq: [{ $year: "$last_update_selected_date" }, year],
            },
          },
          {
            $expr: {
              $eq: [{ $month: "$last_update_selected_date" }, month],
            },
          },
        ],
      }).countDocuments();
      const alertPriority1 = await AlertModel.find({
        $and: [
          {
            priority: "1",
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        ],
      }).countDocuments();
      const alertPriority2 = await AlertModel.find({
        $and: [
          {
            priority: "2",
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        ],
      }).countDocuments();
      const alertPriority3 = await AlertModel.find({
        $and: [
          {
            priority: "3",
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        ],
      }).countDocuments();

      const errorPriority1 = await ErrorModel.find({
        $and: [
          {
            priority: "1",
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        ],
      }).countDocuments();
      const errorPriority2 = await ErrorModel.find({
        $and: [
          {
            priority: "2",
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        ],
      }).countDocuments();
      const errorPriority3 = await ErrorModel.find({
        $and: [
          {
            priority: "3",
          },
          {
            $and: [
              {
                $expr: {
                  $eq: [{ $year: "$date" }, year],
                },
              },
              {
                $expr: {
                  $eq: [{ $month: "$date" }, month],
                },
              },
            ],
          },
        ],
      }).countDocuments();
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
        visitor: "0",
        android: "0",
        iphone: "0",
        equipment: "0",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/dashboard2", async (req, res) => {
  const apiKey = req.get("apiKey");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }
  const yearToFind = 4;
  const errorCount = await ErrorModel.find({
    $expr: {
      $eq: [{ $month: "$date" }, yearToFind],
    },
  });
  res.json(errorCount);
});

app.post("/api/android", async (req, res) => {
  try {
    var update_download_android = req.query.update_download_android;

    var last_data_downloads = await AndroidModel.find().select("downloads");

    const android = new AndroidModel({
      download: update_download_android,
      last_data_downloads: last_data_downloads,
    });

    console.log({
      update_download_android: update_download_android,
      last_data_downloads: last_data_downloads,
    });

    // const execAndroid = await AndroidModel.save(android).exec();
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/visitor", async (req, res, next) => {
  const last_data_visitor = await VisitorModel.findOne();

  if (last_data_visitor) {
    const updateVisitor = await VisitorModel.findByIdAndUpdate(
      { _id: last_data_visitor._id },
      {
        visitor: last_data_visitor.visitor + 3,
        last_data_visitor: last_data_visitor.visitor,
      }
    );
  } else {
    const updateVisitor = await VisitorModel.create({
      visitor: 0,
      last_data_visitor: 0,
    });
  }

  res.json(last_data_visitor);
});

app.post("/api/visitor", async (req, res) => {
  const checkVisitor = await VisitorModel.findOne();
  const visitor = req.body.visitor;

  if (checkVisitor) {
    const updateVisitor = await VisitorModel.findByIdAndUpdate(
      {
        _id: checkVisitor._id,
      },
      {
        visitor: visitor,
        last_data_visitor: checkVisitor.last_data_visitor,
      }
    );
  } else {
    const updateVisitor = await VisitorModel.create({
      visitor: 0,
      last_data_visitor: 0,
    });
  }
});

app.get("/api/renault/detail-truck", async (req, res) => {
  const vin = req.query.vin;

  try {
    const vehiclePositions = await axios.get(
      `https://api.renault-trucks.com/vehicle/vehiclestatuses?vin=${vin}&latestOnly=true`,
      {
        headers: {
          Accept:
            "application/x.volvogroup.com.vehiclestatuses.v1.0+json; UTF-8",
        },
        auth: {
          username: "5BB893139A",
          password: "XapyhWUruM",
        },
      }
    );
    if (vehiclePositions) {
      console.log("successfully connected to renault trucks");
    }

    if (vehiclePositions.status == 400) {
      console.log("vin not found");
    }

    if (vehiclePositions.status == 500) {
      console.log("username or password wrong!");
    }

    if (
      !vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
        .snapshotData.gnssPosition.latitude
    ) {
      console.log("latitude null");
    } else {
      console.log({
        latitude:
          vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
            .snapshotData.gnssPosition.latitude,
      });
    }

    res.json({
      hrTotalVehicleDistance:
        vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
          .hrTotalVehicleDistance,
      totalEngineHours:
        vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
          .totalEngineHours,
      longitude:
        vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
          .snapshotData.gnssPosition.longitude,
      latitude:
        vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
          .snapshotData.gnssPosition.latitude,
    });
  } catch (error) {
    console.log("can not connected to renault truck");
    if (error.response.status == 400) {
      res.json("vin not found");
      console.log("vin not found");
    }
  }
});

module.exports = app;

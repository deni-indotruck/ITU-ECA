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

      let last_data_downloads_android = 0;
      var android = await AndroidModel.findOne();
      if (android) {
        last_data_downloads_android = android.downloads;
      }

      let last_data_downloads_iphone = 0;
      var iphone = await IphoneModel.findOne();
      if (iphone) {
        last_data_downloads_iphone = iphone.downloads;
      }

      let last_data_counts = 0;
      var equipment = await EquipmentModel.findOne();
      if (equipment) {
        last_data_counts = equipment.counts;
      }

      let last_data_visitor = 0;
      const visitor = await VisitorModel.findOne();
      if (visitor) {
        last_data_visitor = visitor.visitor;
      }

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
        visitor: last_data_visitor,
        android: last_data_downloads_android,
        iphone: last_data_downloads_iphone,
        equipment: last_data_counts,
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

      let last_data_downloads_android = 0;
      var android = await AndroidModel.findOne();
      if (android) {
        last_data_downloads_android = android.downloads;
      }

      let last_data_downloads_iphone = 0;
      var iphone = await IphoneModel.findOne();
      if (iphone) {
        last_data_downloads_iphone = iphone.downloads;
      }

      let last_data_counts = 0;
      var equipment = await EquipmentModel.findOne();
      if (equipment) {
        last_data_counts = equipment.counts;
      }

      let last_data_visitor = 0;
      const visitor = await VisitorModel.findOne();
      if (visitor) {
        last_data_visitor = visitor.visitor;
      }

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
        visitor: last_data_visitor.visitor,
        android: last_data_downloads_android,
        iphone: last_data_downloads_iphone,
        equipment: last_data_counts,
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

      let last_data_downloads_android = 0;
      var android = await AndroidModel.findOne();
      if (android) {
        last_data_downloads_android = android.downloads;
      }

      let last_data_downloads_iphone = 0;
      var iphone = await IphoneModel.findOne();
      if (iphone) {
        last_data_downloads_iphone = iphone.downloads;
      }

      let last_data_counts = 0;
      var equipment = await EquipmentModel.findOne();
      if (equipment) {
        last_data_counts = equipment.counts;
      }

      let last_data_visitor = 0;
      const visitor = await VisitorModel.findOne();
      if (visitor) {
        last_data_visitor = visitor.visitor;
      }

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
        visitor: last_data_visitor.visitor,
        android: last_data_downloads_android,
        iphone: last_data_downloads_iphone,
        equipment: last_data_counts,
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

      let last_data_downloads_android = 0;
      var android = await AndroidModel.findOne();
      if (android) {
        last_data_downloads_android = android.downloads;
      }

      let last_data_downloads_iphone = 0;
      var iphone = await IphoneModel.findOne();
      if (iphone) {
        last_data_downloads_iphone = iphone.downloads;
      }

      let last_data_counts = 0;
      var equipment = await EquipmentModel.findOne();
      if (equipment) {
        last_data_counts = equipment.counts;
      }

      let last_data_visitor = 0;
      const visitor = await VisitorModel.findOne();
      if (visitor) {
        last_data_visitor = visitor.visitor;
      }

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
        visitor: last_data_visitor.visitor,
        android: last_data_downloads_android,
        iphone: last_data_downloads_iphone,
        equipment: last_data_counts,
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
    var update_download_android = req.query.update_download_android || 0;

    const dataCount = await AndroidModel.estimatedDocumentCount();
    if (dataCount == 1) {
      var last_data_downloads = await AndroidModel.findOne();
      var queryId = await AndroidModel.find().select({
        _id: 1,
      });
      var _id = queryId[0]._id.toHexString();
      var last_data = last_data_downloads.downloads || 0;
      await AndroidModel.findByIdAndUpdate(
        { _id: _id },
        {
          downloads: update_download_android,
          last_data_downloads: last_data,
        },
        {
          useFindAndModify: true,
        }
      ).exec();
      const cekAndroid = await AndroidModel.find();
      res.status(500).json(cekAndroid);
    } else {
      const data = new AndroidModel({
        downloads: update_download_android,
        last_data_downloads: 0,
      });
      data.save();
      // var saveData = await AndroidModel.save(data);
      const cekAndroid = await AndroidModel.find();
      res.status(500).json(cekAndroid);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.post("/api/iphone", async (req, res) => {
  try {
    var update_download_iphone = req.query.update_download_iphone || 0;

    const dataCount = await IphoneModel.estimatedDocumentCount();
    if (dataCount == 1) {
      var last_data_downloads = await IphoneModel.findOne();
      var queryId = await IphoneModel.find().select({
        _id: 1,
      });
      var _id = queryId[0]._id.toHexString();
      var last_data = last_data_downloads.downloads || 0;
      await IphoneModel.findByIdAndUpdate(
        { _id: _id },
        {
          downloads: update_download_iphone,
          last_data_downloads: last_data,
        },
        {
          useFindAndModify: true,
        }
      ).exec();
      const cekIphone = await IphoneModel.find();
      res.status(500).json(cekIphone);
    } else {
      const data = new IphoneModel({
        downloads: update_download_iphone,
        last_data_downloads: 0,
      });
      data.save();
      // var saveData = await IphoneModel.save(data);
      const cekIphone = await IphoneModel.find();
      res.status(500).json(cekIphone);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.post("/api/equipment", async (req, res) => {
  try {
    var update_count_equipment = req.query.update_count_equipment || 0;

    const dataCount = await EquipmentModel.estimatedDocumentCount();
    if (dataCount == 1) {
      var last_data_counts = await EquipmentModel.findOne();
      var queryId = await EquipmentModel.find().select({
        _id: 1,
      });
      var _id = queryId[0]._id.toHexString();
      var last_data = last_data_counts[0].counts || 0;
      await EquipmentModel.findByIdAndUpdate(
        { _id: _id },
        {
          counts: update_count_equipment,
          last_data_counts: last_data,
        },
        {
          useFindAndModify: true,
        }
      ).exec();
      const cekEquipment = await EquipmentModel.find();
      res.status(500).json(cekEquipment);
    } else {
      const data = new EquipmentModel({
        counts: update_count_equipment,
        last_data_counts: 0,
      });
      data.save();
      // var saveData = await EquipmentModel.save(data);
      const cekEquipment = await EquipmentModel.find();
      res.status(500).json(cekEquipment);
    }
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

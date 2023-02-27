const express = require("express");
const AlertModel = require("../models/alert");
const ErrorModel = require("../models/error");
const DatatableModel = require("../models/datatable");
const { application } = require("express");
const app = express.Router();

app.get("/api/datatable", async (req, res) => {
  const year = req.query.year;
  const month = req.query.month;
  try {
    if (!year && !month) {
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
    } else if (year && !month) {
      const datatable = await DatatableModel.find({
        $expr: {
          $eq: [{ $year: "$last_update_selected_date" }, year],
        },
      });

      const result = datatable.map((v) => {
        const [company, ...rest] = v.machine.split(" ");
        return {
          company: company,
          machine: v.machine,
          total_machine_hour: v.total_machine_hour,
        };
      });
      res.status(200).json(result);
    } else if (month && !year) {
      const datatable = await DatatableModel.find({
        $expr: {
          $eq: [{ $month: "$last_update_selected_date" }, month],
        },
      });

      const result = datatable.map((v) => {
        const [company, ...rest] = v.machine.split(" ");
        return {
          company: company,
          machine: v.machine,
          total_machine_hour: v.total_machine_hour,
        };
      });
      res.status(200).json(result);
    } else if (year && month) {
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
      });

      const result = datatable.map((v) => {
        const [company, ...rest] = v.machine.split(" ");
        return {
          company: company,
          machine: v.machine,
          total_machine_hour: v.total_machine_hour,
        };
      });
      res.status(200).json(result);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/alert", async (req, res) => {
  try {
    const alert = await AlertModel.find();

    res.status(200).json(alert);
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/error", async (req, res) => {
  try {
    const error = await ErrorModel.find();

    res.status(200).json(error);
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/top10error", async (req, res) => {
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
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

app.get("/api/dashboard2", async (req, res) => {
  const yearToFind = 4;
  const errorCount = await ErrorModel.find({
    $expr: {
      $eq: [{ $month: "$date" }, yearToFind],
    },
  });
  res.json(errorCount);
});
module.exports = app;

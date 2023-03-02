const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DataTable_Backup = new Schema(
  {
    machine: {
      type: String,
      default: "",
    },
    chassis_id: {
      type: String,
      default: "",
    },
    total_machine_hour: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    last_update_selected_date: {
      type: Date,
      default: "",
    },
    fuel_level: {
      type: String,
      default: "",
    },
    customer: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("datatable_backup", DataTable_Backup);

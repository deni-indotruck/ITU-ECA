const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Alert_Backup = new Schema(
  {
    company_code: {
      type: String,
      default: "",
    },
    machine: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: "",
    },
    alert_type: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      default: "",
    },
    counter: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    serial_number: {
      type: String,
      default: "",
    },
    local_code: {
      type: String,
      default: "",
    },
    service_interval: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("alert_backup", Alert_Backup);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Error_Backup = new Schema(
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
    error_type: {
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
    model: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("error_backup", Error_Backup);

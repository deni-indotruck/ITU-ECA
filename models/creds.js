const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Creds = new Schema(
  {
    fields: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    customerCode: {
      type: String,
      default: "",
    },
    serialNumber: {
      type: String,
      default: "",
    },
    encoded: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("creds", Creds);

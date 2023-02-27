const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Equipment = new Schema(
  {
    downloads: {
      type: Number,
      default: "",
    },
    last_data_downloads: {
      type: Number,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("equipment", Equipment);

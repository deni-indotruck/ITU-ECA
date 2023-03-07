const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Equipment = new Schema(
  {
    counts: {
      type: Number,
      default: "",
    },
    last_data_counts: {
      type: Number,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("equipment", Equipment);

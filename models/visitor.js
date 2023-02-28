const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Visitor = new Schema(
  {
    visitor: {
      type: Number,
      default: "",
    },
    last_data_visitor: {
      type: Number,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("visitor", Visitor);

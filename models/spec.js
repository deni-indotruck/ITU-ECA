const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Spec = new Schema(
  {
    spec: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("spec", Spec);

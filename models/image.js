const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Image = new Schema(
  {
    image: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("image", Image);

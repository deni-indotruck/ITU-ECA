const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vtAlert = new Schema(
  {
    serialNumber: {
      type: String,
      default: "",
    },
    severity: {
      type: String,
      default: "",
    },
    alertType: {
      type: String,
      default: "",
    },
    equipmentId: {
      type: mongoose.Types.ObjectId,
      ref: "vtequipment",
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("vtalert", vtAlert);

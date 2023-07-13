const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VtEquipment = new Schema(
  {
    warranty: {
      type: String,
      default: "",
    },
    condition: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    spec: {
      "Engine Type": String,
      "Engine PN": String,
      "Engine SN": String,
      "Transmission Type": String,
      "Transmission PN": String,
      "Transmission SN": String,
      "Dropbox Type": String,
      "Dropbox PN": String,
      "Dropbox SN": String,
      "Front Axle  Type": String,
      "Front Axle PN": String,
      "Front Axle SN": String,
      "Rear Axle 1 Type": String,
      "Rear Axle 1 PN": String,
      "Rear Axle 1 SN": String,
    },
    brand: {
      type: String,
      default: "",
    },
    unit_model: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "",
    },
    serial_no: {
      type: String,
      default: "",
    },
    telematic_id: {
      type: String,
      default: "",
    },
    telematic: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    delivery_date: {
      type: String,
      default: "",
    },
    imageWithoutBackground: {
      type: String,
      default: "",
    },
    created_date: {
      type: String,
      default: "",
    },
    last_data_counts: {
      type: Number,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("vtequipment", VtEquipment);

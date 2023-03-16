const express = require("express");
const EquipmentModel = require("../models/equipment");

const { application } = require("express");
const app = express.Router();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/api/equipment", async (req, res) => {
  try {
    var update_count_equipment = req.query.update_count_equipment || 0;

    const dataCount = await EquipmentModel.estimatedDocumentCount();
    if (dataCount == 1) {
      var last_data_counts = await EquipmentModel.findOne();
      var queryId = await EquipmentModel.find().select({
        _id: 1,
      });
      var _id = queryId[0]._id.toHexString();
      console.log(update_count_equipment);
      var last_data = last_data_counts.counts || 0;
      await EquipmentModel.findByIdAndUpdate(
        { _id: _id },
        {
          counts: update_count_equipment,
          last_data_counts: last_data,
        },
        {
          useFindAndModify: true,
        }
      ).exec();
      const cekEquipment = await EquipmentModel.find();
      res.status(200).json(cekEquipment);
    } else {
      const data = new EquipmentModel({
        counts: update_count_equipment,
        last_data_counts: 0,
      });
      data.save();
      // var saveData = await EquipmentModel.save(data);
      const cekEquipment = await EquipmentModel.find();
      res.status(200).json(cekEquipment);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

module.exports = app;

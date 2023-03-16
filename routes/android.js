const express = require("express");
const AndroidModel = require("../models/android");

const { application } = require("express");
const app = express.Router();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/api/android", async (req, res) => {
  try {
    var update_download_android = req.query.update_download_android || 0;

    const dataCount = await AndroidModel.estimatedDocumentCount();
    if (dataCount == 1) {
      var last_data_downloads = await AndroidModel.findOne();
      var queryId = await AndroidModel.find().select({
        _id: 1,
      });
      var _id = queryId[0]._id.toHexString();
      var last_data = last_data_downloads.downloads || 0;
      await AndroidModel.findByIdAndUpdate(
        { _id: _id },
        {
          downloads: update_download_android,
          last_data_downloads: last_data,
        },
        {
          useFindAndModify: true,
        }
      ).exec();
      const cekAndroid = await AndroidModel.find();
      res.status(200).json(cekAndroid);
    } else {
      const data = new AndroidModel({
        downloads: update_download_android,
        last_data_downloads: 0,
      });
      data.save();
      // var saveData = await AndroidModel.save(data);
      const cekAndroid = await AndroidModel.find().exec();
      console.log(cekAndroid);
      res.status(200).json(cekAndroid);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

module.exports = app;

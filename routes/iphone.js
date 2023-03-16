const express = require("express");
const IphoneModel = require("../models/iphone");

const { application } = require("express");
const app = express.Router();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/api/iphone", async (req, res) => {
  try {
    var update_download_iphone = req.query.update_download_iphone || 0;

    const dataCount = await IphoneModel.estimatedDocumentCount();
    if (dataCount == 1) {
      var last_data_downloads = await IphoneModel.findOne();
      var queryId = await IphoneModel.find().select({
        _id: 1,
      });
      var _id = queryId[0]._id.toHexString();
      var last_data = last_data_downloads.downloads || 0;
      await IphoneModel.findByIdAndUpdate(
        { _id: _id },
        {
          downloads: update_download_iphone,
          last_data_downloads: last_data,
        },
        {
          useFindAndModify: true,
        }
      ).exec();
      console.log({
        downloads: update_download_iphone,
        last_data_downloads: last_data,
      });
      const cekIphone = await IphoneModel.find();
      res.status(200).json(cekIphone);
    } else {
      const data = new IphoneModel({
        downloads: update_download_iphone,
        last_data_downloads: 0,
      });
      data.save();
      // var saveData = await IphoneModel.save(data);
      const cekIphone = await IphoneModel.find();
      res.status(200).json(cekIphone);
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.toString() });
  }
});

module.exports = app;

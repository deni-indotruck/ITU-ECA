const express = require("express");
const ImageModel = require("../models/image");
const app = express.Router();
const multer = require("multer");

//destination file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // console.log(file.originalname);
    cb(null, Date.now() + `-` + file.originalname);
  },
});

//filter file
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb("Images Only", false);
  }
};

app.post("/api/promo", async (req, res) => {
  //   const apiKey = req.get("apiKEy");
  //   if (apiKey != process.env.API_KEY) {
  //     return res.status(401).json({
  //       message: "Anauthorized",
  //     });
  //   }

  const upload = multer({ storage: storage, fileFilter: fileFilter }).single(
    "image"
  );
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.status(404).json("Error while Upload " + toString(err));
    } else if (err) {
      // An unknown error occurred when uploading.
      res.status(500).json("insert image please");
    } else {
      if (!req.file) {
        res.status(404).json("image not found, please insert image");
      } else if (!req.body.title) {
        res.status(404).json("title not found, please insert title");
      } else if (!req.body.description) {
        res
          .status(404)
          .json("description not found, please insert description");
      } else {
        var image = req.file.path.replace("images\\", "");

        var title = req.body.title;
        var description = req.body.description;

        const imageUpload = new ImageModel({
          image: image,
          title: title,
          description: description,
        });
        imageUpload.save();
        res.status(200).json({
          message: "insert promo success",
          data: { image: image, title: title, description: description },
        });
      }
    }
  });
});

module.exports = app;

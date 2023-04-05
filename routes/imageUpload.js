const express = require("express");
const ImageModel = require("../models/image");
const app = express.Router();
const multer = require("multer");
const { then } = require("../config/db");

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

app.get("/api/promo", async (req, res) => {
  var id_promo = req.query.id_promo;

  if (!id_promo) {
    res.status(404).json("Please Insert promo id");
  } else {
    ImageModel.findById(id_promo)
      .then((value) => {
        if (!value) {
          res.status(404).json({ message: "Promo Not Found" });
        } else {
          res.status(200).json({ data: value });
        }
      })
      .catch((error) => {
        res.status(200).json({ error: error });
      });
  }
});

app.post("/api/update_promo", async (req, res) => {
  var id_promo = req.query.id_promo;

  if (!id_promo) {
    res.status(404).json("Please Insert Promo Id");
  } else {
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

          const imageUpload = {
            image: image,
            title: title,
            description: description,
          };

          ImageModel.findByIdAndUpdate(id_promo, imageUpload, {
            useFindAndModify: true,
          })
            .then((value) => {
              res.status(200).json({
                message: "Update promo success",
                data: {
                  image: image,
                  title: title,
                  description: description,
                },
              });
            })
            .catch((err) => {
              res.status(500).json({ message: err.toString() });
            });
        }
      }
    });
  }
});

module.exports = app;

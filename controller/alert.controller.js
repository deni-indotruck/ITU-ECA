// const db = require("../models");
// const Error = db.Error;
// const User = db.user;
// var bodyParser = require("body-parser");
// const { application } = require("express");
// const moment = require("moment");
// const error = require("../models/error");

const alert = require("../models/alert");

// const item_per_page = 3;

exports.countAlert = async (req, res, next) => {
  alert.count().exec((err, data) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(data);
    }
  });

  //   res.send("as");

  //   if (!req.query.id) {
  //     res.status(401).send({ message: "Should Sing In First" });
  //   } else {

  //     User.findOne({ _id: req.query.id }).then((data) => {
  //       if (!data) {
  //         res.status(404).send({ message: "Account Not Found" });
  //       } else {
  //         if (!req.query.page) {
  //           res.status(404).send({ message: "Default Page Should Be 1" });
  //         } else {
  //           const page = req.query.page;
  //           if (page < 1) {
  //             res.status(404).send({
  //               message: "Page should more than 0",
  //             });
  //           } else {
  //             Book.find()
  //               // .skip((page - 1) * item_per_page)
  //               .limit(page * item_per_page)
  //               .then((data) => {
  //                 res.status(200).send({ data: data });
  //               });
  //           }
  //         }
  //       }
  //     });
  //   }
};

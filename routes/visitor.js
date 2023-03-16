const express = require("express");
const VisitorModel = require("../models/visitor");

const { application } = require("express");
const app = express.Router();
const bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post("/api/visitor", async (req, res) => {
  const checkVisitor = await VisitorModel.findOne();
  const visitor = req.body.visitor;

  if (checkVisitor) {
    const updateVisitor = await VisitorModel.findByIdAndUpdate(
      {
        _id: checkVisitor._id,
      },
      {
        visitor: visitor,
        last_data_visitor: checkVisitor.last_data_visitor,
      }
    );
  } else {
    const updateVisitor = await VisitorModel.create({
      visitor: 0,
      last_data_visitor: 0,
    });
  }
});

module.exports = app;

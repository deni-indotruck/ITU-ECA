const express = require("express");
const router = express.Router();

// controller that required
const errorController = require("../controller/error.controller");
const alertController = require("../controller/alert.controller");

// routes that availabel
router.get("/countError", errorController.countError);
router.get("/countAlert", alertController.countAlert);

module.exports = router;

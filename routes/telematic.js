const express = require("express");
const CredsModel = require("../models/creds");
const AndroidModel = require("../models/android");
const app = express.Router();
const axios = require("axios");

app.get("/api/telematic", async (req, res) => {
  const vin = req.query.vin;
  const brand = req.query.brand;
  const username = req.query.username || "";
  const password = req.query.password || "";

  if (brand == "RENAULT TRUCK") {
    try {
      var account = await CredsModel.findOne({
        username: username,
        password: password,
      });
      if (!account) {
        res.status(200).json({
          message: `Can't Found Account in Database`,
          data: { username: username, password: password },
        });
      } else {
        // res.json({ username: account.username, password: account.username });
        const vehiclePositions = await axios.get(
          `https://api.renault-trucks.com/vehicle/vehiclestatuses?vin=${vin}&latestOnly=true`,
          {
            headers: {
              Accept:
                "application/x.volvogroup.com.vehiclestatuses.v1.0+json; UTF-8",
            },
            auth: {
              username: account.username,
              password: password,
            },
          }
        );
        if (vehiclePositions) {
          console.log("successfully connected to renault trucks");
        }

        var stringData = "";
        // hrTotalVehicleDistance
        if (
          !vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
            .hrTotalVehicleDistance
        ) {
          stringData = stringData + `hrTotalVehicleDistance = null, `;
        } else {
          stringData =
            stringData +
            `hrTotalVehicleDistance = ${vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].hrTotalVehicleDistance} , `;
        }

        // totalEngineHours
        if (
          !vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
            .totalEngineHours
        ) {
          stringData = stringData + `totalEngineHours = null, `;
        } else {
          stringData =
            stringData +
            `totalEngineHours = ${vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].totalEngineHours} , `;
        }

        // latitude
        if (
          !vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
            .snapshotData.gnssPosition.latitude
        ) {
          stringData = stringData + `latitude = null, `;
        } else {
          stringData =
            stringData +
            `latitude = ${vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].snapshotData.gnssPosition.latitude} , `;
        }

        // longitude
        if (
          !vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
            .snapshotData.gnssPosition.longitude
        ) {
          stringData = stringData + `longitude = null, `;
        } else {
          stringData =
            stringData +
            `longitude = ${vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].snapshotData.gnssPosition.longitude} , `;
        }

        console.log(stringData);

        res.json({
          hrTotalVehicleDistance:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
              .hrTotalVehicleDistance,
          totalEngineHours:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
              .totalEngineHours,
          longitude:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
              .snapshotData.gnssPosition.longitude,
          latitude:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
              .snapshotData.gnssPosition.latitude,
        });
      }
    } catch (error) {
      if (error.response.status == 400) {
        console.log("connected to renault truck");
        res.json("vin format wrong!");
        console.log("vin format wrong!");
      } else if (error.response.status == 500) {
        console.log("connected to renault truck");
        res.json("username or password wrong!");
        console.log("username or password wrong!");
      } else if (error.response.status == 429) {
        console.log("can't connected to renault truck");
        res.json("unable get data, please refresh");
        console.log("unable get data, please refresh");
      } else if (error.response.status == 401) {
        console.log("can't connected to renault truck");
        res.json("Unauthorized, Credential expired");
        console.log("Unauthorized, Credential expired");
      } else if (error.response.status == 404) {
        console.log("connected to renault truck");
        res.json("VIN Not Found");
        console.log("VIN Not Found");
      } else if (error.response.status == 406) {
        console.log("connected to renault truck");
        res.json("Unsupported Accept Parameter");
        console.log("Unsupported Accept Parameter");
      } else {
        console.log("can not connected to renault truck");
        res.json(error);
      }
    }
  }
});

module.exports = app;

const express = require("express");
const app = express.Router();
const axios = require("axios");

app.get("/api/telematic", async (req, res) => {
  const apiKey = req.get("apiKEy");
  if (apiKey != process.env.API_KEY) {
    return res.status(401).json({
      message: "Anauthorized",
    });
  }

  const vin = req.query.vin;
  const brand = req.query.brand;

  if (brand == "RENAULT TRUCK") {
    try {
      const vehiclePositions = await axios.get(
        `https://api.renault-trucks.com/vehicle/vehiclestatuses?vin=${vin}&latestOnly=true`,
        {
          headers: {
            Accept:
              "application/x.volvogroup.com.vehiclestatuses.v1.0+json; UTF-8",
          },
          auth: {
            username: "5BB893139A",
            password: "XapyhWUruM",
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
          `hrTotalVehicleDistance = ${vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].hrTotalVehicleDistance.toFixed(
            3
          )} , `;
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
          `totalEngineHours = ${vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].totalEngineHours.toFixed(
            3
          )} , `;
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

      res.status(200).json({
        status: 200,
        data: {
          hour_meter:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].hrTotalVehicleDistance.toFixed(
              3
            ),
          oper_hours:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].totalEngineHours.toFixed(
              3
            ),
          longitude:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].snapshotData.gnssPosition.longitude.toString(),
          latitude:
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0].snapshotData.gnssPosition.latitude.toString(),
          fuel_used: (
            vehiclePositions.data.vehicleStatusResponse.vehicleStatuses[0]
              .engineTotalFuelUsed / 1000
          ).toFixed(3),
        },
      });
    } catch (error) {
      if (error.response.status == 400) {
        console.log("connected to renault truck");
        res.status(400).json("vin format wrong!");
        console.log("vin format wrong!");
      } else if (error.response.status == 500) {
        console.log("connected to renault truck");
        res.status(500).json("username or password wrong!");
        console.log("username or password wrong!");
      } else if (error.response.status == 429) {
        console.log("can't connected to renault truck");
        res.status(429).json("unable get data, please refresh");
        console.log("unable get data, please refresh");
      } else if (error.response.status == 401) {
        console.log("can't connected to renault truck");
        res.status(401).json("Unauthorized, Credential expired");
        console.log("Unauthorized, Credential expired");
      } else if (error.response.status == 404) {
        console.log("connected to renault truck");
        res.status(404).json("VIN Not Found");
        console.log("VIN Not Found");
      } else if (error.response.status == 406) {
        console.log("connected to renault truck");
        res.status(406).json("Unsupported Accept Parameter");
        console.log("Unsupported Accept Parameter");
      } else {
        console.log("can not connected to renault truck");
        res.status(500).json(error);
      }
    }
  }
});

module.exports = app;

const express = require("express");
const app = express.Router();
const axios = require("axios");

app.get("/api/renault/detail-truck", async (req, res) => {
  const vin = req.query.vin;

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
  } catch (error) {
    console.log("can not connected to renault truck");
    if (error.response.status == 400) {
      res.json("vin not found");
      console.log("vin not found");
    } else if (error.response.status == 500) {
      res.json("username or password wrong!");
      console.log("username or password wrong!");
    }
  }
});

module.exports = app;

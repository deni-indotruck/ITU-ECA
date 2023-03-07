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
    if (vehiclePositions.status == 200) {
      console.log("successfully connected to renault trucks");
    }
    console.log("success");

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
    res
      .status(500)
      .json({ error: "Internal server error", message: error.toString() });
  }
});

module.exports = app;

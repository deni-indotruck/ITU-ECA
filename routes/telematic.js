const express = require("express");
const CredsModel = require("../models/creds");
const RedeemCodeModel = require("../models/redeemcode");
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
      var account = await CredsModel.findOne({
        serialNumber: vin,
      });
      if (!account) {
        res.status(200).json({
          message: `Can't Found Account in Database with this Serial Number ${vin}`,
        });
      } else {
        const vehiclePositions = await axios.get(
          `https://api.renault-trucks.com/vehicle/vehiclestatuses?vin=${vin}&latestOnly=true`,
          {
            headers: {
              Accept:
                "application/x.volvogroup.com.vehiclestatuses.v1.0+json; UTF-8",
            },
            auth: {
              username: account.username,
              password: account.password,
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

        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();
        const date_time_now =
          year +
          "-" +
          month +
          "-" +
          date +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          seconds;

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
            last_update: date_time_now,
          },
        });
      }
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
  } else if (brand == "KALMAR") {
    var account = await CredsModel.findOne({
      serialNumber: vin,
    });
    if (!account) {
      res.status(200).json({
        message: `Can't Found Account in Database with this Serial Number ${vin}`,
      });
    } else {
      var errorMessage = "";

      try {
        const reqDataLocation = await axios.get(
          `https://kalmarcloudapi.ncic.cargotec.com/position?serialNumber=${vin}`,
          {
            headers: {
              "x-api-key": account.username,
            },
          }
        );
        if (reqDataLocation) {
          console.log("successfully connected to Kalmar Location");
        } else {
          errorMessage =
            errorMessage + " can't connect to kalmar total engine hours";
        }

        // longitude
        if (!reqDataLocation.data[0].longitude) {
          stringData = stringData + `hrlongitude = 0, `;
          var longitude = 0;
        } else {
          stringData =
            stringData +
            `hrlongitude = ${reqDataLocation.data[0].longitude} , `;
          var longitude = reqDataLocation.data[0].longitude.toString();
        }
        // latitude
        if (!reqDataLocation.data[0].latitude) {
          stringData = stringData + `hrlatitude = 0, `;
          var latitude = 0;
        } else {
          stringData =
            stringData + `hrlatitude = ${reqDataLocation.data[0].latitude} , `;
          var latitude = reqDataLocation.data[0].latitude.toString();
        }
      } catch (error) {
        errorMessage =
          errorMessage + " can't connect to kalmar total engine hours";
        stringData = stringData + `hrlongitude = 0, `;
        var longitude = 0;
        stringData = stringData + `hrlatitude = 0, `;
        var latitude = 0;
      }

      try {
        const reqDataTotalEngineHours = await axios.get(
          `https://kalmarcloudapi.ncic.cargotec.com/engineHours?serialNumber=${vin}`,
          {
            headers: {
              "x-api-key": account.username,
            },
          }
        );
        if (reqDataTotalEngineHours) {
          console.log("successfully connected to kalmar Total Engine Hours");
        } else {
          errorMessage =
            errorMessage + " can't connect to kalmar total engine hours";
        }

        var stringData = "";
        // totalEngineHours
        if (!reqDataTotalEngineHours.data.dataList[0].totalEngineHours) {
          stringData = stringData + `hrTotalEngineHours = 0, `;
          var totalEngineHours = 0;
        } else {
          stringData =
            stringData +
            `hrTotalEngineHours = ${reqDataTotalEngineHours.data.dataList[0].totalEngineHours} , `;
          var totalEngineHours =
            reqDataTotalEngineHours.data.dataList[0].totalEngineHours;
        }
      } catch (error) {
        errorMessage =
          errorMessage + " can't connect to kalmar total engine hours";
        stringData = stringData + `hrTotalEngineHours = 0, `;
        var totalEngineHours = 0;
      }

      try {
        const reqDataOperHours = await axios.get(
          `https://kalmarcloudapi.ncic.cargotec.com/fuelAndEnergyConsumption?serialNumber=${vin}`,
          {
            headers: {
              "x-api-key": account.username,
            },
          }
        );
        if (reqDataOperHours) {
          console.log("successfully connected to Kalmar Oper Hours");
        } else {
          errorMessage =
            errorMessage + " can't connect to kalmar total oper hours";
        }
        // totalFuelUsed
        if (!reqDataOperHours.data.dataList[0].totalFuelUsed) {
          stringData = stringData + `hrtotalFuelUsed = 0, `;
          var totalFuelUsed = 0;
        } else {
          stringData =
            stringData +
            `hrtotalFuelUsed = ${reqDataOperHours.data.dataList[0].totalFuelUsed} , `;
          var totalFuelUsed = (
            reqDataOperHours.data.dataList[0].totalFuelUsed / 1000
          ).toFixed(3);
        }
      } catch (error) {
        errorMessage =
          errorMessage + " can't connect to kalmar total oper hours";
        stringData = stringData + `hrtotalFuelUsed = 0, `;
        var totalFuelUsed = 0;
      }

      console.log(stringData);

      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      const date_time_now =
        year +
        "-" +
        month +
        "-" +
        date +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds;

      res.status(200).json({
        status: 200,
        data: {
          vin: vin,
          longitude: longitude,
          latitude: latitude,
          oper_hours: totalEngineHours,
          fuel_used: totalFuelUsed,
          last_update: date_time_now,
        },
      });
    }
  }
});

module.exports = app;

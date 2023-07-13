const cron = require("node-cron");
const vtAlert = require("../models/vtAlert");
const vtEquipment = require("../models/vtEquipment");
const mongoose = require("mongoose");
const axios = require("axios");
const updateVtAlert = cron.schedule("01 00 * * *", async () => {
  try {
    ///code here ///
    try {
      const checkConnection = await axios.get(
        `https://api.volvotrucks.com/alert/vehiclealerts`,
        {
          headers: {
            Accept:
              "application/x.volvogroup.com.vehiclealerts.v1.1+json; UTF-8",
          },
          auth: {
            username: process.env.TESTU,
            password: process.env.TESTP,
          },
        }
      );

      if (checkConnection) {
        const db = mongoose.connection.db;

        db.listCollections({ name: "vtalerts" }).next((err, collinfo) => {
          if (err) {
            console.log(err);
            return res.status(400).json("vtalerts not found");
          } else {
            console.log("deleting vtalerts");
            vtAlert.deleteMany({}, (err) => {
              if (err) {
                console.log(err);
                return res.status(400).json("can't delete collection vtalerts");
              } else {
                console.log("delete vtalerts success");

                // Melakukan join menggunakan operasi agregasi
                vtEquipment
                  .aggregate([
                    { $match: { telematic: "YES", brand: "VOLVO VT" } },
                    {
                      $lookup: {
                        from: "creds", // Nama koleksi kedua (case sensitive)
                        localField: "serial_no", // Field pada koleksi pertama
                        foreignField: "serialNumber", // Field pada koleksi kedua
                        as: "credsData", // Nama field yang akan menampung data gabungan
                      },
                    },
                  ])
                  .then((results) => {
                    // Lakukan sesuatu dengan hasil join di sini
                    results.forEach((fv) => {
                      const serial_no = fv.serial_no;
                      const id_vtEquipment = fv._id;
                      const username = fv.credsData[0].username;
                      const password = fv.credsData[0].password;

                      const getDataVT = axios
                        .get(
                          `https://api.volvotrucks.com/alert/vehiclealerts?vin=${serial_no}&latestOnly=true`,
                          {
                            headers: {
                              Accept:
                                "application/x.volvogroup.com.vehiclealerts.v1.1+json; UTF-8",
                            },
                            auth: {
                              username: username,
                              password: password,
                            },
                          }
                        )
                        .then((results) => {
                          console.log("");
                          console.log("serial_no :" + serial_no);
                          console.log(
                            "severity :" +
                              results.data.alertsResponse.alerts[0].severity
                          );
                          console.log(
                            "alertType :" +
                              results.data.alertsResponse.alerts[0].alertType
                          );
                          console.log("id_vtEquipment :" + id_vtEquipment);
                          console.log("");
                          console.log("Next");

                          const data = new vtAlert({
                            serialNumber: serial_no,
                            severity:
                              results.data.alertsResponse.alerts[0].severity,
                            alertType:
                              results.data.alertsResponse.alerts[0].alertType,
                            equipmentId: id_vtEquipment,
                          });
                          data.save();
                        })
                        .catch((error2) => {
                          console.error(error2);
                          return res.status(400).json({ error: error2 });
                        });
                    });
                    console.log("should be insert " + results.length + " data");
                    return res.status(200).json({
                      message: "insert " + results.length + " success",
                      results: results,
                    });
                  })
                  .catch((error) => {
                    console.error(error);
                    return res.status(400).json({ error: error });
                  });
              }
            });
          }
        });
      }
    } catch (error) {
      console.log(error.response);
      if (error.response.status == 401) {
        console.log("unable connect api volvo, unauthorized");
        return res.status(400).json({
          message: "unable connect api volvo, unauthorized",
          error: error.toString(),
        });
      } else {
        return res.status(400).json({
          message: "error ini nih brai",
          error: error.toString(),
        });
      }
    }
    ////////////////
  } catch (error) {
    console.log("got an error in this part");
    console.log(error.toString());
  }
});

module.exports = { updateVtAlert };

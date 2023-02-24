const excelToJson = require("convert-excel-to-json");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
app.get("/checkUsers", async (req, res) => {
  const result = excelToJson({
    sourceFile: "users.xlsx",
    header: {
      rows: 1,
    },
    columnToKey: {
      "*": "{{columnHeader}}",
    },
  });
  const bulk = [];
  for (const dataToInsert of result.users) {
    const password = await bcrypt.hash(`${dataToInsert.phone}`, 12);
    const token = jwt.sign(
      {
        email: dataToInsert.email,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "30 days",
      }
    );
    bulk.push({
      updateOne: {
        filter: { email: dataToInsert.email },
        update: {
          $setOnInsert: {
            email: dataToInsert.email,
            password: password,
            firstname: dataToInsert.firstname,
            middlename:
              dataToInsert.middlename == null ? "" : dataToInsert.middlename,
            lastname:
              dataToInsert.lastname == null ? "" : dataToInsert.lastname,
            mechanic_id: dataToInsert.mechanic_id,
            token: token,
            branch: dataToInsert.branch,
            role: dataToInsert.role,
            phone: dataToInsert.phone,
          },
        },
        upsert: true,
      },
    });
  }
  if (bulk.length > 0) await User.bulkWrite(bulk);
  res.json(bulk);
});

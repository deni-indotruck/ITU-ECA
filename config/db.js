const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connectDB = mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

module.exports = connectDB;

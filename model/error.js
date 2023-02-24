const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

module.exports = (mongoose, mongoosePaginate) => {
  var error = mongoose.Schema(
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      company_code: {
        type: String,
      },
      machine: {
        type: String,
      },
      date: {
        type: Date,
      },
      error_type: {
        type: String,
      },
      priority: {
        type: String,
      },
      counter: {
        type: String,
      },
      company: {
        type: String,
      },
      model: {
        type: String,
      },
      serial_number: {
        type: String,
      },
      local_code: {
        type: String,
      },

      // username: {
      //   type: String,
      // },
      // role: {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: "Role",
      // },
      // books: [
      //   {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: "Book",
      //     // required: true,
      //     // default: "",
      //   },
      // ],
    },
    { timestamps: true }
  );

  // user.method("toJSON", function () {
  //   const { __v, _id, ...object } = this.toObject();
  //   object.id = _id;
  //   return object;
  // });

  error.plugin(mongoosePaginate);

  const Error = mongoose.model("Error", error);
  return Error;
};

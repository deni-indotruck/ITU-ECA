const mongoose = require("mongoose");

module.exports = (mongoose) => {
  var error = mongoose.Schema(
    {
      company_code: {
        type: String,
        default: "",
      },
      machine: {
        type: String,
        default: "",
      },
      date: {
        type: Date,
        default: "",
      },
      error_type: {
        type: String,
        default: "",
      },
      priority: {
        type: String,
        default: "",
      },
      counter: {
        type: String,
        default: "",
      },
      company: {
        type: String,
        default: "",
      },
      model: {
        type: String,
        default: "",
      },
      serial_number: {
        type: String,
        default: "",
      },
      local_code: {
        type: String,
        default: "",
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
  // error.plugin(mongoosePaginate);

  const Error = mongoose.model("Error", error);
  return Error;
};

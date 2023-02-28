const cron = require("node-cron");
const VisitorModel = require("../models/visitor");
const updateVisitor = cron.schedule("*/60 * * * *", async () => {
  try {
    const last_data_visitor = await VisitorModel.findOne();

    if (last_data_visitor) {
      const updateVisitor = await VisitorModel.findByIdAndUpdate(
        { _id: last_data_visitor._id },
        {
          visitor: last_data_visitor.visitor + 3,
          last_data_visitor: last_data_visitor.visitor,
        }
      );
      console.log("success update visitor");
    } else {
      const updateVisitor = await VisitorModel.create({
        visitor: 0,
        last_data_visitor: 0,
      });
    }
  } catch (error) {
    console.log(error.toString());
  }
});
module.exports = { updateVisitor };

const mongoose = require("mongoose");

/** Database Configuration Settings */
exports.database = mongoose.connect(
  "mongodb+srv://hr_app_user:V35wJrdFrq0iyEqf@hr-app.nkghb.mongodb.net/hr-app?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

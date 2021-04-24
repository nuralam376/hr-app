const mongoose = require("mongoose");

/** Database Configuration Settings */
exports.database = mongoose.connect(
  "mongodb+srv://hr-user:TtigXTj0BL7XR7Ja@hr-app.nkghb.mongodb.net/hr-app?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

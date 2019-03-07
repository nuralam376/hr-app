const mongoose = require("mongoose");

/** Database Configuration Settings */
exports.database = mongoose.connect("mongodb://hr-app:hr123456@ds117509.mlab.com:17509/hr-app", {useNewUrlParser : true});

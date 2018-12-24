/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Package Table Field .*/

const PackageSchema = mongoose.Schema({
    name : 
    {
        type : String,
        required : true
    }
});

const Package = module.exports = mongoose.model("Package",PackageSchema);
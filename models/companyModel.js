/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

/** Company Table Field .*/

const CompanySchema = mongoose.Schema({
    name : 
    {
        type : String,
        required : true
    },
    email : 
    {
        type : String,
        required : true
    },
    address : 
    {
        type : String,
        required : true
    },
    contact : 
    {
        type : String,
        required : true
    },
    superadmin : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required : true
    },

    package : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required : false
    },
    events : [StatusSchema]
});

const Company = module.exports = mongoose.model("Company",CompanySchema);
/** Mongoose Module .*/
const mongoose = require("mongoose");

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
    logo : 
    {
        type : String,
        required : true
    },
    password : 
    {
        type : String,
        required : true
    },
    isSuperAdmin : 
    {
        type : Boolean,
        required : true,
        default : 0
    },
});

const Company = module.exports = mongoose.model("Company",CompanySchema);
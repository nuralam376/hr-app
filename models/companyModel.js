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
    contact : 
    {
        type : String,
        required : true
    },
    superadmin : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required : false
    },

    package : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required : false
    }
});

const Company = module.exports = mongoose.model("Company",CompanySchema);
/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Company Info Table Field .*/

const CompanyInfoSchema = mongoose.Schema({
    admin : 
    {
        type : Number,
        required: true,
        default : 0
    },
    supplier : 
    {
        type : Number,
        required : true,
        default : 0
    },
    user : 
    {
        type : Number,
        required : true,
        default : 0
    },
    group : 
    {
        type : Number,
        required : true,
        default : 0
    },
    pax : 
    {
        type : Number,
        required : true,
        default : 0
    },

    company : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required : false
    }
});

const CompanyInfo = module.exports = mongoose.model("CompanyInfo",CompanyInfoSchema);
/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Company Table Field .*/

const CompanySchema = mongoose.Schema({
    admin : 
    {
        type : Number,
        required: true,
        default : 0
    },
    supplier : 
    {
        type : Number,
        required : true
    },
    user : 
    {
        type : Number,
        required : true
    },

    company : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required : false
    }
});

const CompanyInfo = module.exports = mongoose.model("CompanyInfo",CompanySchema);
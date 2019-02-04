/** Mongoose Module .*/
const mongoose = require("mongoose");


/** Medical Table Field .*/

const MedicalSchema = mongoose.Schema({
    center_name : 
    {
        type : String,
        required : true
    },
    medical_slip :
    {
        type : String,
        required : true
    },
    issue : 
    {
        type : Date,
        required : true
    },
    expiry : 
    {
        type : Date,
        required : true
    },

    status : 
    {
        type : String,
        required : true
    },

    unfit_reason : 
    {
        type : String,
        required : false
    },

    interview_date : 
    {
        type : Date,
        required : false
    },
    
    pax : 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },

    company : 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Company",
        required : true
    },

    created_at : 
    {
        type : Date,
        required : true,
        default : Date.now()
    },
    updated_at : 
    {
        type : Date,
        required : true,
        default : Date.now()
    },
});

const Medical = module.exports = mongoose.model("Medical",MedicalSchema);
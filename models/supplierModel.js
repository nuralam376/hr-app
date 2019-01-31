/** Mongoose Module .*/
const mongoose = require("mongoose");


/** Status Schema*/

const StatusSchema = require("./statusSchema");

/** Supplier Table Field .*/

const SupplierSchema = mongoose.Schema({
    code : 
    {
        type : Number,
        required : true
    },
    name : 
    {
        type : String,
        required : true
    },
    nid : 
    {
        type : Number,
        required : true
    },
    contact : 
    {
        type : String,
        required : true,
    },
    introducer_name : 
    {
        type : String,
        required : true,
    },
    introducer_number : 
    {
        type : String,
        required : true
    },
    present_address : 
    {
        type : String,
        required : true
    },
    permanent_address : 
    {
        type : String,
        required : true
    },
    profile_photo : 
    {
        type : String,
        required : true
    },
    passport_photo : 
    {
        type : String,
        required : true
    },

    company : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required : false
    },
    
    seq_id : 
    {
        type : String,
        required: true,
        default : 0
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
    events : [StatusSchema]
});

const Supplier = module.exports = mongoose.model("Supplier",SupplierSchema);
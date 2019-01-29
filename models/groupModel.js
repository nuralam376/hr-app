/** Mongoose Module .*/
const mongoose = require("mongoose");


/** Group Table Field .*/

const GroupSchema = mongoose.Schema({
    group_seq : 
    {
        type : Number,
        required : true,
        default : 0
    },
    group_sl : 
    {
        type : Number,
        required : true
    },
    visa_number : 
    {
        type : Number,
        required : true
    },
    visa_nid : 
    {
        type : Number,
        required : true
    },
    supplier : 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required : true
    },
    zone : 
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Zone",
        required : false,
    },
    amount : 
    {
        type : Number,
        required : true
    },
    enjazit_image : 
    {
        type : String,
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
    }
});

const Group = module.exports = mongoose.model("Group",GroupSchema);
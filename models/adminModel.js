/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Supplier Table Field .*/

const AdminSchema = mongoose.Schema({
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
    birth_date :
    {
        type : String,
        required : true
    },
    blood_group : 
    {
        type : String,
        required : true
    },
    nid : 
    {
        type : Number,
        required : true
    },
    passport :
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
    password : 
    {
        type : String,
        required : true
    },
    company : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required : false
    }
});

const Admin = module.exports = mongoose.model("Admin",AdminSchema);
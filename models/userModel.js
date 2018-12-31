/** Mongoose Module .*/
const mongoose = require("mongoose");

/** User Table Field .*/

const UserSchema = mongoose.Schema({
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

    supplier : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required : false
    },
    
    company : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required : false
    }
});

const User = module.exports = mongoose.model("User",UserSchema);
/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Admin Table Field .*/

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
    contact : 
    {
        type : Number,
        required : true
    },

    address : 
    {
        type : String,
        required : true
    },
    
    profile_photo : 
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
    company : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required : false
    }
});

const Admin = module.exports = mongoose.model("Admin",AdminSchema);
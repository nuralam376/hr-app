/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = mongoose.Schema({
    type : 
    {
        type : String,
        required : true
    },
    display_name : 
    {
        type : String,
        required: true
    },
    description : 
    {
        type : String,
        required : true
    },
    time : 
    {
        type : Date,
        required : true,
        default : Date.now()
    }
});

module.exports = StatusSchema;
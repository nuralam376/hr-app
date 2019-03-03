/** Mongoose Module */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**  Mofa Collection */
const mofaSchema = new Schema({
    health_payment : 
    {
        type : Number,
        required : true,
        default : 0 
    },
    embassy_payment : 
    {
        type : Number,
        required : true,
        default : 0
    },
    type : 
    {
        type : Number,
        required : true,
        default : 0
    },
    e_number :
    {
        type : Number,
        required : false
    },
    pax : 
    {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    group : 
    {
        type : Schema.Types.ObjectId,
        ref : "Group",
        required : true
    },
    company : 
    {
        type : Schema.Types.ObjectId,
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

const Mofa = module.exports = mongoose.model("Mofa",mofaSchema);
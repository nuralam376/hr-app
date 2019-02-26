/** Mongoose Module */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**  Mofa Collection */
const mofaSchema = new Schema({
    health_payment : 
    {
        type : Number,
        required : true,
        default : 1100 
    },
    embassy_payment : 
    {
        type : Number,
        required : true,
        default : 1200
    },
    type : 
    {
        type : Number,
        required : true,
        default : 100
    },
    e_number :
    {
        type : Number,
        required : true
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
        required : false,
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
/** Mongoose Module */
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tcSchema = new Schema({
    tc_received : 
    {
        type : Number,
        required : true,
        default : 0
    },
    tc_pdf : 
    {
        type : String,
        required : false
    },
    finger : 
    {
        type : Number,
        required : true,
        default : 0
    },
    pax : 
    {
        type : Schema.Types.ObjectId,
        ref : "User",
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

const Tc = module.exports = mongoose.model("Tc",tcSchema);
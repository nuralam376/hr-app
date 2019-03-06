/** Mongoose Module */
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/** Delivery Schema */
const deliverySchema = new Schema({
    received_by : 
    {
        type : String,
        required : true
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

const Delivery = module.exports = mongoose.model("Delivery",deliverySchema);
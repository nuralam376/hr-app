/** Mongoose Module */
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

const Schema = mongoose.Schema;

/** Flight Schema */
const flightSchema = new Schema({
    probable_date:
    {
        type: Date,
        required: true
    },
    flight_date:
    {
        type: Date,
        required: false
    },
    probable_airlines:
    {
        type: String,
        required: true
    },
    flight_airlines:
    {
        type: String,
        required: false
    },
    price:
    {
        type: Number,
        required: false
    },
    pax:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    zone:
    {
        type: Schema.Types.ObjectId,
        ref: "Zone",
        required: false
    },
    company:
    {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    created_at:
    {
        type: Date,
        required: true,
        default: Date.now()
    },
    updated_at:
    {
        type: Date,
        required: true,
        default: Date.now()
    },
    events: [StatusSchema]
});

flightSchema.index({ company: 1, pax: 1 });


const Flight = module.exports = mongoose.model("Flight", flightSchema);
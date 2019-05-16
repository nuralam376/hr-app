/** Mongoose Module */
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

const Schema = mongoose.Schema;

const tcSchema = new Schema({
    tc_received:
    {
        type: Number,
        required: true,
        default: 0
    },
    tc_pdf:
    {
        type: String,
        required: false
    },
    finger:
    {
        type: Number,
        required: true,
        default: 0
    },
    pax:
    {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
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


tcSchema.index({ company: 1, pax: 1 });

const Tc = module.exports = mongoose.model("Tc", tcSchema);
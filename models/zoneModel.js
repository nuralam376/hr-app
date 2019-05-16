/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

/** Zone Table Field .*/

const ZoneSchema = mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    country:
    {
        type: String,
        required: true
    },
    company:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: false
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

ZoneSchema.index({ company: 1 });

const Zone = module.exports = mongoose.model("Zone", ZoneSchema);
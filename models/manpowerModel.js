/** Mongoose Module */
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

const Schema = mongoose.Schema;

/** Manpower Schema */
const manpowerSchema = new Schema({
    ready:
    {
        type: Number,
        required: true,
        default: 0
    },
    clearance_date:
    {
        type: Date,
        required: false,
    },
    card_no:
    {
        type: String,
        required: false
    },
    card_photo:
    {
        type: String,
        required: false
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

manpowerSchema.index({ company: 1, pax: 1 });


const Manpower = module.exports = mongoose.model("Manpower", manpowerSchema);
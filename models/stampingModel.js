/** Mongoose Module */
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

const Schema = mongoose.Schema;

/** Stamping Schema */
const stampingSchema = new Schema({
    status:
    {
        type: String,
        required: true
    },
    pc_image:
    {
        type: String,
        required: true
    },
    visa_no:
    {
        type: Number,
        required: false
    },
    stamping_date:
    {
        type: Date,
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

stampingSchema.index({ company: 1, pax: 1 });

const Stamping = module.exports = mongoose.model("stamping", stampingSchema);
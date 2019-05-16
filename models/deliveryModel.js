/** Mongoose Module */
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

const Schema = mongoose.Schema;

/** Delivery Schema */
const deliverySchema = new Schema({
    received_by:
    {
        type: String,
        required: true
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

deliverySchema.index({ company: 1, pax: 1 });

const Delivery = module.exports = mongoose.model("Delivery", deliverySchema);
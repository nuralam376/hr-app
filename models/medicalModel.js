/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

/** Medical Table Field .*/

const MedicalSchema = mongoose.Schema({
    center_name:
    {
        type: String,
        required: false
    },
    medical_slip:
    {
        type: String,
        required: false
    },
    issue:
    {
        type: Date,
        required: false
    },
    medical_expiry:
    {
        type: Date,
        required: false
    },

    status:
    {
        type: String,
        required: false
    },

    unfit_reason:
    {
        type: String,
        required: false
    },

    unfit_slip:
    {
        type: String,
        required: false
    },

    interview_date:
    {
        type: Date,
        required: false
    },

    pax:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    group:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },

    company:
    {
        type: mongoose.Schema.Types.ObjectId,
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

MedicalSchema.index({ company: 1, pax: 1 });


const Medical = module.exports = mongoose.model("Medical", MedicalSchema);
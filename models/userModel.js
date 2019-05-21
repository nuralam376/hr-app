/** Mongoose Module .*/
const mongoose = require("mongoose");


/** Status Schema*/

const StatusSchema = require("./statusSchema");

/** User Table Field .*/

const UserSchema = mongoose.Schema({
    code:
    {
        type: Number,
        required: true
    },
    name:
    {
        type: String,
        required: true
    },
    father:
    {
        type: String,
        required: true
    },
    mother:
    {
        type: String,
        required: true
    },
    contact:
    {
        type: String,
        required: true
    },
    birth_date:
    {
        type: Date,
        required: true
    },
    category:
    {
        type: String,
        required: true
    },
    national:
    {
        type: String,
        required: true
    },
    gender:
    {
        type: String,
        required: true
    },
    religion:
    {
        type: String,
        required: true
    },
    maritial:
    {
        type: String,
        required: true
    },
    nid:
    {
        type: Number,
        required: true
    },
    passport:
    {
        type: String,
        required: true
    },
    issue:
    {
        type: Date,
        required: true
    },
    expiry:
    {
        type: Date,
        required: true
    },
    present_address:
    {
        type: String,
        required: true
    },
    permanent_address:
    {
        type: String,
        required: true
    },
    profile_photo:
    {
        type: String,
        required: true
    },
    passport_photo:
    {
        type: String,
        required: true
    },

    supplier:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    group:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },

    company:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: false
    },
    experience_image:
    {
        type: String,
        required: false
    },
    experience_year:
    {
        type: Number,
        required: false
    },
    experience_month:
    {
        type: Number,
        required: false
    },
    experience_day:
    {
        type: Number,
        required: false
    },
    seq_id:
    {
        type: String,
        required: true,
        default: 0
    },
    created_at:
    {
        type: Date,
        required: false,
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

UserSchema.index({ company: 1, code: 1 });


const User = module.exports = mongoose.model("User", UserSchema);
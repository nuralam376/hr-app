/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Status Schema*/

const StatusSchema = require("./statusSchema");

/** Admin Table Field .*/

const AdminSchema = mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true
    },
    contact:
    {
        type: Number,
        required: true
    },

    address:
    {
        type: String,
        required: true
    },

    profile_photo:
    {
        type: String,
        required: true
    },

    password:
    {
        type: String,
        required: true
    },

    isEmailVerified:
    {
        type: Boolean,
        required: true,
        default: false
    },

    emailVerificationToken:
    {
        type: String,
        required: true
    },

    isSuperAdmin:
    {
        type: Boolean,
        required: true,
        default: 0
    },
    company:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: false
    },

    seq_id:
    {
        type: String,
        required: true,
        default: 0
    },
    roles: [String],
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

AdminSchema.index({ company: 1 });


const Admin = module.exports = mongoose.model("Admin", AdminSchema);
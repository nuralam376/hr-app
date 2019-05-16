/** Mongoose Module */
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/** Admin Roles Schema */
const roleSchema = new Schema({
    name:
    {
        type: String,
        required: true
    },
    slug:
    {
        type: String,
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
    }
});

roleSchema.index({ company: 1 });


const Role = module.exports = mongoose.model("Role", roleSchema);
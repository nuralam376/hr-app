/** Mongoose Module .*/
const mongoose = require("mongoose");

/** Forget Password Table Field .*/

const ForgetPasswordSchema = mongoose.Schema({
    admin : 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required : false
    },
    token : 
    {
        type : String,
        required : true
    },
    start_time : 
    {
        type : Number,
        required:true
    },
    end_time : 
    {
        type : Number,
        required : true
    }
});

const forgetPassword = module.exports = mongoose.model("ForgetPassword",ForgetPasswordSchema);
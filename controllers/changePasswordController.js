/** This is the Forget Password controller page. Forget Password related Functions are here .*/

/** Required modules */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Authetication Check File */
const auth = require("../config/auth");

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");

/** Foregt Password Model Schema */
let forgetPasswordModel = require("../models/forgetPassword");

/**
 * Shows Change Password Page
 * 
 */
router.get("/:id",async(req,res,next) => {
    try 
    {
       let tokenCheck  = await forgetPasswordModel.findOne({token : req.params.id}); // Finds the token

       /** Checks whether the token is valid */
       if(tokenCheck && Date.now() < tokenCheck.end_time)
       {
           res.render("change-password");
       }
       else
       {
           req.flash("danger","Token Incorrect");
           res.redirect("/");
       }
    }
    catch(err)
    {
        console.log(err);
    }
});

module.exports = router;
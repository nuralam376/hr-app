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
        if(req.isAuthenticated())
        {
            req.flash("danger","Unauthorized Access");
            return res.redirect("/");
        }
       let tokenCheck  = await forgetPasswordModel.findOne({token : req.params.id}); // Finds the token

       /** Checks whether the token is valid */
       if(tokenCheck && Date.now() < tokenCheck.end_time)
       {
           res.render("change-password",{
               token : req.params.id
           });
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

/** Receives New Passwords from Admin */
router.post("/:id",[
    check("password").not().isEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password must be 6 characters"),
    check("confirm_password").custom((value,{req,loc,path}) => {
        if(value != req.body.password)
        {
            throw new Error("Passwords don't match")
        }
        else
        {
            return typeof value == undefined ? "" : value;
        }
    }),
    sanitizeBody("password").trim().unescape()
],async(req,res,next) => {
    try
    {
        if(req.isAuthenticated())
        {
            res.redirect("/dashboard");
        }
        else
        {
            let forms = {
                token : req.body.token,
            };

            /** Shows Errors */
            let errors = validationResult(req);

            if(!errors.isEmpty())
            {
                res.render("change-password",{
                    errors : errors.array(),
                    forms : forms,
                    token : req.params.id
                });
            }
            else
            {
                let admin = await forgetPasswordModel.findOne({token : req.body.token}).populate("admin"); // Finds the admin info

                if(admin)
                {
                    let hashPwd = await bcrypt.hash(req.body.password,10); // Encrypted the password
                    let adminData = {};
                    adminData.password = hashPwd;
                    let adminPwdUpdate = await AdminModel.updateOne({_id : admin.admin._id},adminData); // Updates the admin's password

                    if(adminPwdUpdate)
                    {
                        let tokenDelete = await forgetPasswordModel.deleteMany({$or : [{admin : admin.admin._id}, {token : req.params._id}]}); // Deletes the token afte updating the password

                        if(tokenDelete)
                        {
                            req.flash("success","Password Changed");
                            res.redirect("/");
                        }
                    }
                    else
                    {
                        req.flash("danger","Something went wrong");
                        res.redirect("/");
                    }
                }
                else
                {
                    req.flash("danger","Admin Not Found");
                    res.redirect("/");
                }
            }
        }
    }
    catch(err)
    {
        console.log(err);
    }
});

module.exports = router;
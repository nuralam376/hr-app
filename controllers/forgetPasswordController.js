/** This is the Forget Password controller page. Forget Password related Functions are here .*/

/** Required modules */
const express = require("express");
const router = express.Router();
const crypto = require('crypto');
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Mail Configuration */
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth : {
        api_key : "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"
    }
}));

/** Authetication Check File */
const auth = require("../config/auth");

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");

/** Foregt Password Model Schema */
let forgetPasswordModel = require("../models/forgetPassword");


/**
 * Shows Forget Password Page
 * 
 */
router.get("/",async(req,res,next) => {
    try
    {
        if(req.isAuthenticated())
        {
            res.redirect("/dashboard");
        }
        else
        {
            res.render("forget-password");
        }
    }
    catch(err)
    {
        console.log(err);
    }
});


/** Receives Email from Admin to change the forget password */
router.post("/",[
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid").custom((value, {req,location,path}) => {
        let admin = AdminModel.findOne({email : req.body.email});

        if(!admin)
        {
           throw new Error("Email not found");
        }
        else
        {
            return value;
        }
    }),
    sanitizeBody("username").trim().unescape()
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
                email : req.body.email
            };

            /** Shows Errors */
            let errors = validationResult(req);

            if(!errors.isEmpty())
            {
                res.render("forget-password",{
                    errors : errors.array(),
                    forms : forms
                });
            }
            else
            {
                /** Finds the email in the database */
                let admin = await AdminModel.findOne({email : req.body.email});

                if(!admin)
                {
                    
                    res.render("forget-password",{
                        errorMsg : "Email Not Found",
                        forms : forms
                    });
                }
                else
                {
                    const secret = admin._id + admin.password + Date.now();
                    const hashToken = crypto.createHmac('sha256', secret)
                                    .update('hr-app')
                                    .digest('hex');                              
                    /** Saves data in the Forget Password Schema */
                    let fp = new forgetPasswordModel();
                    fp.admin = admin._id;
                    fp.token = hashToken;
                    fp.start_time = Date.now();
                    fp.end_time = fp.start_time + (1000 * 60 * 60 * 24);  // Sets 24 hours time validity
                

                    let fpSave = await fp.save();

                    if(fpSave)
                    {
                        let fullUrl = req.protocol + '://' + req.get('host');
                        req.flash("success","A mail has been sent to your email");
                        res.redirect("/");
                        await transporter.sendMail({
                            to : req.body.email,
                            from : "nuraalam939@gmail.com",
                            subject : "Hr-App Password Change",
                            html : 
                            "<h2>You have requested to change your password. Please click the below link to proceed.</h2><p><a href = '"+fullUrl+"/change-password/"+hashToken+"'>Change your password</a></p><p>This link is only valid for 24 hours.</p><h3>If you do not request for this, please contact us</h3>"
                        });
                    }
                    else
                    {
                        req.flash("danger","Something went wrong");
                        res.redirect("/forget-password");
                    }

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
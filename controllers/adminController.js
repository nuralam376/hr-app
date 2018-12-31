/** This is the Admin controller page. Admin CRUD Functions are here .*/

/** Required modules */
const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");
const multer = require("multer");

/** Authetication Check File */
const auth = require("../config/auth");

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");


/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/admin",
    filename : function(req,file,cb)
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});


/** Implements File upload validation */
const upload = multer({
    storage : storage,
    fileFilter : function(req,file,cb){
        checkFileType(req,file,cb)
    }
});


/**
 * Checks Whether the file is an image or not
 * 
 */
function checkFileType(req,file,cb)
{
    let ext = path.extname(file.originalname);
    let size = file.size;
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
         req.fileValidationError = "Forbidden extension";
         return cb(null, false, req.fileValidationError);
   }
   cb(null, true);
}


/**
 * Shows All Admins Information
 * 
 */

router.get("/",auth,isSuperAdmin,async(req,res) => {
    try
    {
        if(req.user.isSuperAdmin)
        {
            let admins = await AdminModel.find({company : req.user.company}); // Find All Admins of the logged in admin's company 

            //If Admin found
            if(admins)
            {
                res.render("admins/index",{
                    admins : admins
                });
            }
        }
    }
    catch(err)
    {
        console.log(err);
    }
});

/** Shows Registration page for Admin Account Creation*/
router.get("/register",auth,isSuperAdmin,async(req,res) => {
    try
    {
        res.render("admins/register");
    }
    catch(error)    
    {
        console.log(error);
    }
});


/** Receives Admin input data for registration */
router.post("/register",auth,isSuperAdmin,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
    check("email").isEmail().withMessage("Email must be valid"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("blood").not().isEmpty().withMessage("Blood Group is required"),
    check("nid").not().isEmpty().withMessage("National ID is required"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),

    check("password").not().isEmpty().withMessage("Password is required"),
    check("password").isLength({min:6}).withMessage("Password must be 6 characters"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("password").trim().unescape(),
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt(),
],async(req,res) => {
    try
    {
        /** Cheks Wheteher the email is already exist */
        let adminCheck = await AdminModel.findOne({email : req.body.email});

        if(adminCheck)
        {
            req.flash("danger","Email Already exists");
            res.statusCode = 302;
            res.redirect("/admin/register");
            return res.end();
        }

         /** Stores Admin Input Data  */
        let forms = {
            name : req.body.name,
            email : req.body.email,
            blood : req.body.blood,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            birth_date : req.body.birth_date,
            nid : req.body.nid,
            passport : req.body.passport,
            password : req.body.password,
            profile_photo : "dummy.jpeg",
            passport_photo : "dummy.jpeg",
        };

        /** Checks if the Admin uploads any file */
        if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
        {
            if(req.files[0].fieldname == "profile_photo")
                forms.profile_photo = req.files[0].filename;
            else
                forms.passport_photo = req.files[0].filename;
        }
        
        if(typeof req.files[1] !== "undefined" && req.files[1].fieldname == "passport_photo" && req.fileValidationError == null)
        {
            forms.passport_photo = req.files[1].filename;
        }
            
        let errors = validationResult(req);

        /** Shows Errors in view Page */
        if(!errors.isEmpty())
        {
            res.render("admins/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError
            });
        }
        /** Checks File Validation Error */
        else if(typeof req.fileValidationError != undefined && req.fileValidationError != null)
        {
            res.render("admins/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError
            });
        }
        
        else
        {
            /** Stores Forms Input data in admin object */
            let admin = new AdminModel();
            admin.name = forms.name;
            admin.email = forms.email;
            admin.birth_date = forms.birth_date;
            admin.blood_group = forms.blood;
            admin.nid = forms.nid;
            admin.passport = forms.passport;
            admin.present_address = forms.present_address;
            admin.permanent_address = forms.permanent_address;
            admin.profile_photo = forms.profile_photo;
            admin.passport_photo = forms.passport_photo;
            admin.password = forms.password;
            admin.company = req.user.company;

            /** Encrypted the Admin Password */

            let hashPwd = await bcrypt.hash(admin.password,10);    
            admin.password = hashPwd;
                

            let adminCreate = await admin.save(); // Creates New Admin

            if(adminCreate)
            {
                req.flash("success","New Admin account has been created");
                res.redirect("/admin");
            }
        }
    }
    catch(error)
    {
        console.log(error);
    }       
    
});

/** Cheks Whether the logged in admin is Super Admin */
function isSuperAdmin(req,res,next)
{
    if(req.user.isSuperAdmin)
    {
        next(); // If the Admin is SuperAdmin, then proceed
    }
    else
    {
        req.flash("danger","Unauthorized Access");
        res.redirect("/dashboard");
    }
}

module.exports = router;
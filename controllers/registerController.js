/** This is the SuperAdmin register controller page. SuperAdmin Registration related functions are here. */

/** Required modules */
const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody } = require("express-validator/filter");
const multer = require("multer");

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/superadmin",
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



/** Shows Registration page for SuperAdmin*/
router.get("/",async(req,res) => {
    try
    {
        if(!req.isAuthenticated())
        {
            res.render("register");
        }
        else
        {
            res.redirect("/user");
        }    
    }
    catch(error)    
    {
        console.log(error);
    }
});


/** Receives SuperAdmin input data for registration */
router.post("/",upload.any(),[
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

        /** Checks if the SuperAdmin uploads any file */
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

            if(!errors.isEmpty())
            {
                res.render("register",{
                    errors : errors.array(),
                    form : forms,
                    fileError : req.fileValidationError
                });
            }
            else if(typeof req.fileValidationError != undefined && req.fileValidationError != null)
            {
                res.render("register",{
                    errors : errors.array(),
                    form : forms,
                    fileError : req.fileValidationError
                });
            }
        
        else
        {
            let superAdmin = new AdminModel();
            superAdmin.name = forms.name;
            superAdmin.email = forms.email;
            superAdmin.birth_date = forms.birth_date;
            superAdmin.blood_group = forms.blood;
            superAdmin.nid = forms.nid;
            superAdmin.passport = forms.passport;
            superAdmin.present_address = forms.present_address;
            superAdmin.permanent_address = forms.permanent_address;
            superAdmin.profile_photo = forms.profile_photo;
            superAdmin.passport_photo = forms.passport_photo;
            superAdmin.password = forms.password;
            superAdmin.isSuperAdmin = true;

              // Checks If the superAdmin has any supplier and assigned supplier to superAdmin
              if(req.body.supplier !== "")
              {
                  forms.supplier = req.body.supplier;
                  superAdmin.supplier = forms.supplier;
              }

            bcrypt.genSalt(10,function(err,salt){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    bcrypt.hash(superAdmin.password, salt, function(err,hash){
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            superAdmin.password = hash;

                            superAdmin.save(function(err,admin){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {
                                    req.flash("success","Your account has been created. Please fill up the company details to log in");
                                    res.redirect("/register/" + admin._id + "/company");
                                }
                            });
                        }
                    });
                }
            });
           
        }
    }
    catch(error)
    {
        console.log(error);
    }
        
    
});

/**
 * Represents Company Registration Information.
 * 
 * @param {string} id - The Object Id of the SuperAdmin for the Company.
 *
 */

router.get("/:id/company",async(req,res) => {
    try
    {
        let superAdmin = await AdminModel.findOne({_id : req.params.id});
        if(superAdmin)
        {
            res.render("company/register");
        }
    }
    catch(error)    
    {
        console.log(error);
        req.flash("danger","Unknown SuperAdmin. Please register");
        res.redirect("/register");
    }
});

module.exports = router;
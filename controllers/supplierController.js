/** This is the Suuplier controller page. Supplier CRUD functions are here. */

/** Required modules */
const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody } = require("express-validator/filter");
const multer = require("multer");

/** Supplier Model Schema */
const SupplierModel = require("../models/supplierModel");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/supplier",
    filename : (req,file,cb) => 
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

/** Implements File upload validation */
const upload = multer({
    storage : storage,
    fileFilter : (req,file,cb) => {
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



/** Renders All Suppliers */
router.get("/",ensureAuthenticated,async(req,res) => {
    try 
    {
        let suppliers = await SupplierModel.find({});

        res.render("supplier/index",{
            suppliers : suppliers
        });
    }
    catch(err)
    {
        console.log(err);
    }    

});

/** Shows Supplier Registration Page */

router.get("/register",ensureAuthenticated,async(req,res) => {
    try 
    {
        res.render("supplier/register");
    }
    catch(err)
    {
        console.log(err);
    }    

});

/** Receives Supplier input data for registration */
router.post("/register",upload.any(),[
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
    try {
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

        /** Checks if the Supplier uploads any file */
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
            res.render("supplier/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError
            });
        }
        else
        {
            let supplier = new SupplierModel();
            supplier.name = forms.name;
            supplier.email = forms.email;
            supplier.birth_date = forms.birth_date;
            supplier.blood_group = forms.blood;
            supplier.nid = forms.nid;
            supplier.passport = forms.passport;
            supplier.present_address = forms.present_address;
            supplier.permanent_address = forms.permanent_address;
            supplier.profile_photo = forms.profile_photo;
            supplier.passport_photo = forms.passport_photo;
            supplier.password = forms.password;

            
            bcrypt.genSalt(10,function(err,salt){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    bcrypt.hash(supplier.password, salt, (err,hash) => {
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            supplier.password = hash;

                            let newSupplier = supplier.save(function(err){
                                if(err)
                                {
                                    console.log(err);
                                }
                                else
                                {
                                    req.flash("success","New Supplier has been created");
                                    res.redirect("/supplier");
                                }
                            });
                        }
                    });
                }
            });
           
        }
        
    } 
    catch (error) {
        console.log(error);
    }
        
    
});



/** Checks Whether the user is logged in or not*/
function ensureAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }
}

module.exports = router;
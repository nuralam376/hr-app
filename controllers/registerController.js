const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody } = require("express-validator/filter");
const multer = require("multer");

let UserModel = require("../models/userModel");

const storage = multer.diskStorage({
    destination : "./public/uploads",
    filename : function(req,file,cb)
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage : storage,
});




router.get("/",function(req,res){
    if(req.isAuthenticated())
    {
        res.redirect("/user");
    }
    else
    {
        res.render("register");
    }    
});

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
    check("profile_photo").not().isEmpty().withMessage("Profile Photo is required"),
    check("passport_photo").not().isEmpty().withMessage("Personal Photo is required"),
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
],function(req,res){
        let forms = {
            name : req.body.name,
            email : req.body.email,
            blood : req.body.blood,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            birth_date : req.body.birth_date,
            nid : req.body.nid,
            passport : req.body.passport,
            password : req.body.password
        };
        
        if(req.files.length > 0)
        {
            if(typeof req.files[0] != undefined)
            {
                req.body.profile_photo =req.files[0].filename;
            }
            if(typeof req.files[1] != undefined)
            {
                req.body.passport_photo =req.files[1].filename;
            }       
        }    
       

        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("register",{
                errors : errors.array(),
                form : forms
            });
        }
        
    
});

module.exports = router;
/** This is the SuperAdmin register controller page. SuperAdmin Registration related functions are here. */

/** Required modules */
const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody } = require("express-validator/filter");


/** Admin Model Schema */
let AdminModel = require("../models/adminModel");

/** Company Model Schema */
let CompanyModel = require("../models/companyModel");

/** Package Model Schema */
let PackageModel = require("../models/packageModel");

/** Company Info Model Schema */
let CompanyInfoModel = require("../models/companyInfoModel");


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
            res.redirect("/dashboard");
        }    
    }
    catch(error)    
    {
        console.log(error);
    }
});


/** Receives SuperAdmin input data for registration */
router.post("/",[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid"),
    check("contact").not().isEmpty().withMessage("Contact is required").isNumeric().withMessage("Contact No. must be numeric"),
    check("address").not().isEmpty().withMessage("Address is required"),
    check("pass").not().isEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password must be 6 characters"),
    check("confirm_pass").custom((value,{req,loc,path}) => {
        if(value != req.body.pass)
        {
            throw new Error("Passwords don't match")
        }
        else
        {
            return typeof value == undefined ? "" : value;
        }
    }),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("contact").trim().unescape(),
    sanitizeBody("address").trim().unescape(),
    sanitizeBody("pass").trim().unescape(),
],async(req,res) => {
    try
    {
        /** Cheks Wheteher the email is already exist */
        let superAdminCheck = await AdminModel.findOne({email : req.body.email});

        if(superAdminCheck)
        {
            req.flash("danger","Email Already exists");
            res.statusCode = 302;
            res.redirect("/register");
            return res.end();
        }

        /** Stores Input Data in form object */
        let forms = {
            name : req.body.name,
            email : req.body.email,
            contact : req.body.contact,
            address : req.body.address,
            pass : req.body.pass,
            profile_photo : "dummy.jpeg",
        };

        
        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("register",{
                errors : errors.array(),
                form : forms
            });
        }
        
        
        else
        {
            /** Saves Forms data in SuperAdmin Object */
            let superAdmin = new AdminModel();
            superAdmin.name = forms.name;
            superAdmin.email = forms.email;
            superAdmin.contact = forms.contact;
            superAdmin.address = forms.address;
            superAdmin.profile_photo = forms.profile_photo;
            superAdmin.password = forms.pass;
            superAdmin.isSuperAdmin = true;

            /** Encrypted the Admin Password */

            let hashPwd = await bcrypt.hash(superAdmin.password,10);    
            superAdmin.password = hashPwd;
                

            let superAdminCreate = await superAdmin.save(); // Creates New SuperAdmin

            if(superAdminCreate)
            {
                req.flash("success","Your account has been created. Please fill up the company details.");
                res.redirect("/register/" + superAdminCreate._id + "/company");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/register");
            }
           
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
    
        let superAdmin = await AdminModel.findById(req.params.id);
        
        if(superAdmin)
        {
            /** Checks If the SuperAdmin has already a company id */
            if(typeof superAdmin.company === "undefined")
            {
                res.render("company/register",{
                    superAdmin : superAdmin._id
                });
            }
            else
            {
                res.redirect("/dashboard");
            }    
        }
        else
        {
            req.flash("danger","Unknown SuperAdmin. Please register");
            res.redirect("/register");
        }
    }
    catch(error)    
    {
        console.log(error);
        req.flash("danger","Unknown SuperAdmin. Please register");
        res.redirect("/register");
    }
});

/** Receives Company input data for registration */
router.post("/:id/company",[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid"),
    check("address").not().isEmpty().withMessage("Address is required"),
    check("contact").not().isEmpty().withMessage("Contact No. is required").isNumeric().withMessage("Contact No. must be numeric"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("address").trim().unescape()
],async(req,res) => {
    try
    {
        let forms = {
            name : req.body.name,
            email : req.body.email,
            address : req.body.address,
            contact : req.body.contact
        };

            
        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("company/register",{
                errors : errors.array(),
                superAdmin : req.params.id,
                form : forms
            });
        }
        
        else
        {
            /** Save Form data in Company Model */
            let company = new CompanyModel();
            company.name = forms.name;
            company.email = forms.email;
            company.address = forms.address;
            company.contact = forms.contact;
            company.superadmin = req.body.superAdmin;

            /** Assigned Package to Company */
            let packageCheck = await PackageModel.findOne({name : "Free"});

            // If Package exits then assigned to company
            if(packageCheck)
            {
                company.package = packageCheck._id; 
            }
            // Otherwise Created new Package
            else
            {
                let packageCreate = new PackageModel();
                packageCreate.name = "Free";
                let newPackage = await packageCreate.save();
                company.package = newPackage._id;
            }  
            
            let newCompany = await company.save();

            if(newCompany)
            {
                let query = {_id : req.params.id};
                let admin = {};
                admin.company = newCompany._id;
                admin.seq_id = "sa_1";

                let companyInfo = new CompanyInfoModel();
                companyInfo.company = newCompany._id;

                let newCompanyInfo = await companyInfo.save();

                /** Assigend Company to Admin */
                let adminUpdate = await AdminModel.updateOne(query,admin);
                if(adminUpdate)
                {
                    req.flash("success","Company Created Successfully");
                    res.redirect("/login");
                }
            }
        }   
        
    }
    catch(error)
    {
        console.log(error);
    }
        
    
});

module.exports = router;
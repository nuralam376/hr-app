/** This is the Admin Dashbard page.*/

/** Required modules */
const express = require("express");
const router = express.Router();
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Authetication File */
const auth = require("../config/auth");

/** Company Model Schema */
let CompanyModel = require("../models/companyModel");



/** Shows Company Details */

router.get("/",auth,async(req,res) => {
    try{
        let company = await CompanyModel.findOne({_id : req.user.company});
        if(company)
        {
            res.render("company/index",{
                company : company
            });
        }
    }
    catch(err){
        console.log(err);
    }
    
});

/** Shows Company Details in Admin Dashboard */

router.get("/edit",auth,isSuperAdmin,async(req,res) => {
    try{
        
        let company = await CompanyModel.findOne({_id : req.user.company, superadmin : req.user._id}); // Finds the Company
        
        
        if(company)
        {
            res.render("company/edit",{
                company : company
            });
        }
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/dashboard");
        }
    }
    catch(err){
        console.log(err);
    }
    
});

/** Receives Company input data for updating the datails of the Company */

router.post("/update",auth,isSuperAdmin,[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid"),
    check("contact").not().isEmpty().withMessage("Contact is required").isNumeric().withMessage("Contact No. must be numeric"),
    check("address").not().isEmpty().withMessage("Address is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("contact").trim().unescape(),
    sanitizeBody("address").trim().unescape(),
    sanitizeBody("pass").trim().unescape(),
],async(req,res) => {
       try
       {        
            let query = {_id : req.user.company, superadmin : req.user._id}; 

            let companyInfo = await CompanyModel.findOne(query); // Finds the Company
            
            // If Company exists
            if(companyInfo)
            {
                 /** Stores Company input data in forms Object*/
                 let forms = {
                    name : req.body.name,
                    email : req.body.email,
                    contact : req.body.contact,
                    address : req.body.address,
                };


                let errors = validationResult(req); 
               
                
                if(!errors.isEmpty())
                {
                
                    res.render("company/edit",{
                        errors : errors.array(),
                        company : companyInfo
                    });
                
                }
                else
                {

                    /** Stores Forms data in newCompany Object */
                    let newCompany = {};
                    newCompany.name = forms.name;
                    newCompany.email = forms.email;
                    newCompany.contact = forms.contact;
                    newCompany.address = forms.address;
                    newCompany.superadmin = req.user._id;

                    
                    let companyUpdate = await CompanyModel.updateOne(query,newCompany); // Update the Company Info
                    
                    if(companyUpdate)
                    {
                        req.flash("success","Company Details Updated");
                        res.redirect("/dashboard");
                    }
                    else
                    {
                        req.flash("danger","Something went wrong");
                        res.redirect("/dashboard");
                    }
                }
            }
            else
            {
                req.flash("danger","Company Not Found");
                res.redirect("/dashboard");
            }
       }
       catch(error)
       {
           console.log(error);
       }
                    
});


function isSuperAdmin(req,res,next)
{
    if(req.user.isSuperAdmin)
    {
        next();
    }
    else
    {
        req.flash("danger","Unauthorized Access");
        res.redirect("/dashboard");
    }
}

module.exports = router;
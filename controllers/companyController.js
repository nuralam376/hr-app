/** This is the Admin Dashbard page.*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication File */
const auth = require("../config/auth");

/** Admin Model Schema */
let CompanyModel = require("../models/companyModel");


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
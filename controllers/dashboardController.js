/** This is the Admin Dashbard page.*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication File */
const auth = require("../config/auth");

/** Admin Model Schema */
let CompanyModel = require("../models/companyModel");

/** Shows Company Details in Admin Dashboard */

router.get("/",auth,async(req,res) => {
    try{
        let company = await CompanyModel.findOne({_id : req.user.company});
        if(company)
        {
            res.render("dashboard",{
                company : company
            });
        }
    }
    catch(err){
        console.log(err);
    }
    
});

module.exports = router;
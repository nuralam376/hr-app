/** This is the Admin controller page. Admin CRUD Functions are here .*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication Check File */
const auth = require("../config/auth");

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");


/**
 * Shows All Admins Information
 * 
 */

router.get("/",auth,async(req,res) => {
    try
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
    catch(err)
    {
        console.log(err);
    }
});


module.exports = router;
/** This is the Admin Dashbard page.*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication File */
const auth = require("../config/auth");


/** Shows Company Details in Admin Dashboard */

router.get("/",auth,async(req,res) => {
    try{
        res.render("dashboard");
    }
    catch(err){
        console.log(err);
    }
    
});

module.exports = router;
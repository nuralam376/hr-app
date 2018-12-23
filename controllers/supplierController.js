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
let SupplierModel = require("../models/supplierModel");



/** Receives supplier input data for registration */
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
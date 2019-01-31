/** Supplier Routes.*/

/** Required modules */
const express = require("express");
const router = express.Router();
const path = require("path");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody } = require("express-validator/filter");

/** Authetication File */
const auth = require("../config/auth");

/** Dashboard Controller */
const SupplierController = require("../controllers/supplierController");

const multer = require("multer");


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

/** All Routes of the Supplier */

router.get("/",auth,SupplierController.getAllSuppliers);
router.get("/register",auth,SupplierController.getSupplierRegistration);
router.post("/register",auth,upload.any(),[
    check("code").not().isEmpty().withMessage("Code is required").isNumeric().withMessage("Code must be numeric"),
    check("name").not().isEmpty().withMessage("Name is required"),
    check("nid").not().isEmpty().withMessage("NID / Passport No. is required"),
    check("contact").not().isEmpty().withMessage("Contact No. is required"),
    check("introducer_name").not().isEmpty().withMessage("Introducer Name is required"),
    check("introducer_number").not().isEmpty().withMessage("Introducer Number is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),

    sanitizeBody("name").trim().unescape(),
    sanitizeBody("nid").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("introducer_name").trim().unescape(),
    sanitizeBody("introducer_number").trim().unescape(),
    sanitizeBody("contact").trim().unescape()
],SupplierController.postSupplierRegistration);

router.get("/edit/:id",auth,SupplierController.editSupplier);

router.post("/update/:id",auth,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("nid").not().isEmpty().withMessage("NID / Passport No. is required"),
    check("contact").not().isEmpty().withMessage("Contact No. is required"),
    check("introducer_name").not().isEmpty().withMessage("Introducer Name is required"),
    check("introducer_number").not().isEmpty().withMessage("Introducer Number is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),

    sanitizeBody("name").trim().unescape(),
    sanitizeBody("nid").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("introducer_name").trim().unescape(),
    sanitizeBody("introducer_number").trim().unescape(),
    sanitizeBody("contact").trim().unescape()
],SupplierController.updateSupplier);

router.delete("/delete/:id",auth,SupplierController.deleteSupplier);
router.get("/timeline/:id",auth,SupplierController.suppliersTimeline);
router.get("/:id",auth,SupplierController.getSupplier);

module.exports = router;
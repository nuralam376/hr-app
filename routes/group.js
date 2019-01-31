/** Required Modules */
const express = require("express");
const router = express.Router();
const path = require("path");
/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Group Controller */
const GroupController = require("../controllers/groupController");

/** Auth Configuration */
const auth = require("../config/auth");

const multer = require("multer");


/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/enjazit",
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

/** Group Routes */
router.get("/",auth,GroupController.getAllGroups);
router.get("/register",auth,GroupController.getGroupRegistration);
router.post("/register",auth,upload.any(),[
    check("group_seq").not().isEmpty().withMessage("Group Seq is required").isNumeric().withMessage("Group Seq must be numeric"),
    check("group_sl").not().isEmpty().withMessage("Group Sl is required").isNumeric().withMessage("Group SL must be numeric"),
    check("visa").not().isEmpty().withMessage("Visa Number required").isNumeric().withMessage("Visa Number must be numeric"),
    check("id").not().isEmpty().withMessage("Visa ID is required").isNumeric().withMessage("Visa Id must be numeric"),
    check("supplier").not().isEmpty().withMessage("Visa Supplier is required"),
    check("zone").not().isEmpty().withMessage("Zone is required"),
    check("amount").not().isEmpty().withMessage("Amount is required"),
    check("occupation").not().isEmpty().withMessage("Occupation is required"),
],GroupController.postGroupRegistration);
router.get("/edit/:id",auth,GroupController.editGroup);
router.post("/update/:id",auth,upload.any(),[
    check("group_sl").not().isEmpty().withMessage("Group Sl is required").isNumeric().withMessage("Group SL must be numeric"),
    check("visa_number").not().isEmpty().withMessage("Visa Number required").isNumeric().withMessage("Visa Number must be numeric"),
    check("visa_id").not().isEmpty().withMessage("Visa ID is required").isNumeric().withMessage("Visa Id must be numeric"),
    check("visa_supplier").not().isEmpty().withMessage("Visa Supplier is required"),
    check("zone").not().isEmpty().withMessage("Zone is required"),
    check("amount").not().isEmpty().withMessage("Amount is required"),
    check("occupation").not().isEmpty().withMessage("Occupation is required"),
],GroupController.updateGroup);
router.delete("/delete/:id",auth,GroupController.deleteGroup);
router.get("/:id",auth,GroupController.getGroup);

module.exports = router;

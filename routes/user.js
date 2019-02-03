/** User routes*/

/** Required modules */
const express = require("express");
const router = express.Router();
const path = require("path");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Authetication File */
const auth = require("../config/auth");

/** Multer Configuration */
const multer = require("multer");
/** User Controller Page */
const UserController = require("../controllers/userController");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/user",
    filename : function(req,file,cb)
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});


/** Implements File upload validation */
const upload = multer({
    storage : storage,
    fileFilter : function(req,file,cb){
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


/** All routes of the user */
router.get("/",auth,UserController.getAllUsers);
router.get("/register",auth,UserController.getRegistration);
router.post("/register",auth,upload.any(),[
    check("code").not().isEmpty().withMessage("Code is required"),
    check("name").not().isEmpty().withMessage("Name is required"),
    check("father").not().isEmpty().withMessage("Father Name is required"),
    check("mother").not().isEmpty().withMessage("Mother Name is required"),
    check("contact").not().isEmpty().withMessage("Contact No. is required"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("blood").not().isEmpty().withMessage("Blood Group is required"),
    check("national").not().isEmpty().withMessage("Nationality is required"),
    check("nid").not().isEmpty().withMessage("National ID is required").isNumeric().withMessage("National Id must be numeric"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("issue").not().isEmpty().withMessage("Passport Date of issue is required"),
    check("expiry").not().isEmpty().withMessage("Passport Date of expiry is required"),
    check("present_address").not().isEmpty().withMessage("Present Address is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),
    check("gender").not().isEmpty().withMessage("Gender is required"),
    check("religion").not().isEmpty().withMessage("Religion is required"),
    check("maritial").not().isEmpty().withMessage("Maritial Status is required"),
    check("group").not().isEmpty().withMessage("Group is required"),
    check("supplier").not().isEmpty().withMessage("Supplier is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("gender").trim().unescape(),
    sanitizeBody("father").trim().unescape(),
    sanitizeBody("mother").trim().unescape(),
    sanitizeBody("contact").trim().unescape(),
    sanitizeBody("gender").trim().unescape(),
    sanitizeBody("religion").trim().unescape(),
    sanitizeBody("maritial").trim().unescape(),
    sanitizeBody("national").trim().unescape(),
    sanitizeBody("nid").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
],UserController.postRegistration);

router.get("/edit/:id",auth,UserController.editUser);

router.post("/update/:id",auth,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
    check("email").isEmail().withMessage("Email must be valid"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("blood").not().isEmpty().withMessage("Blood Group is required"),
    check("nid").not().isEmpty().withMessage("National ID is required"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt(),
],UserController.updateUser);

router.delete("/delete/:id",auth,UserController.deleteUser);

router.get("/sticker/:id",auth,UserController.getUsersSticker);

router.get("/pdf/:id",auth,UserController.downloadUsersSticker);

router.get("/timeline/:id",auth,UserController.usersTimeline);

router.get("/:id",auth,UserController.getUser);

module.exports = router;
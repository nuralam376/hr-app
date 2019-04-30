/** Supplier Routes.*/

/** Required modules */
const express = require("express");
const router = express.Router();
const path = require("path");
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Authetication File */
const auth = require("../config/auth");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("supplier");

/** Dashboard Controller */
const SupplierController = require("../controllers/supplierController");

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require("../config/s3");
/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region: "ap-south-1"
});

/** Initialize Multer storage Variable for file upload */

const s3 = new aws.S3();

/** Implements File upload validation */
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "hr-app-test",
        acl: 'public-read',
        expires: Date.now() + 100,
        ServerSideEncryption: "AES256",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname + "-" + Date.now() + path.extname(file.originalname) });
        },
        key: function (req, file, cb) {
            if (file.fieldname == "profile_photo") {
                supplierProfilePhoto = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
                cb(null, req.user.company + "/suppliers/" + supplierProfilePhoto)
            }
            else {
                supplierPassportPhoto = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
                cb(null, req.user.company + "/suppliers/" + supplierPassportPhoto)
            }
        }
    }),
    fileFilter: function (req, file, cb) {
        checkFileType(req, file, cb)
    }
});


/**
 * Checks Whether the file is an image or not
 * 
 */
function checkFileType(req, file, cb) {
    let ext = path.extname(file.originalname);
    let size = file.size;
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        req.fileValidationError = "Forbidden extension";
        return cb(null, false, req.fileValidationError);
    }
    cb(null, true);
}

/** All Routes of the Supplier */

router.get("/", auth, roleCheck, SupplierController.getAllSuppliers);
router.get("/register", auth, roleCheck, SupplierController.getSupplierRegistration);
router.post("/register", auth, roleCheck, upload.any(), [
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
], SupplierController.postSupplierRegistration);

router.get("/edit/:id", auth, roleCheck, SupplierController.editSupplier);

router.post("/update/:id", auth, roleCheck, upload.any(), [
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
], SupplierController.updateSupplier);

router.delete("/delete/:id", auth, roleCheck, SupplierController.deleteSupplier);
router.get("/timeline/:id", auth, roleCheck, SupplierController.suppliersTimeline);
router.get("/sticker/:id", auth, roleCheck, SupplierController.getSuppliersSticker);
router.get("/pdf/:id", auth, roleCheck, SupplierController.downloadSuppliersSticker);
router.get("/:id", auth, roleCheck, SupplierController.getSupplier);

module.exports = router;
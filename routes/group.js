/** Required Modules */
const express = require("express");
const router = express.Router();
const path = require("path");
/** Validation Configuration */
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Group Controller */
const GroupController = require("../controllers/groupController");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("group");

/** Auth Configuration */
const auth = require("../config/auth");

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
            enjazitPhoto = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
            cb(null, req.user.company + "/groups/" + enjazitPhoto)
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

/** Group Routes */
router.get("/", auth, roleCheck, GroupController.getAllGroups);
router.get("/register", auth, roleCheck, GroupController.getGroupRegistration);
router.post("/register", auth, roleCheck, upload.any(), [
    check("group_seq").not().isEmpty().withMessage("Group Seq is required").isNumeric().withMessage("Group Seq must be numeric"),
    check("group_sl").not().isEmpty().withMessage("Group Sl is required").isNumeric().withMessage("Group SL must be numeric"),
    check("visa").not().isEmpty().withMessage("Visa Number required").isNumeric().withMessage("Visa Number must be numeric"),
    check("id").not().isEmpty().withMessage("Visa ID is required").isNumeric().withMessage("Visa Id must be numeric"),
    check("supplier").not().isEmpty().withMessage("Visa Supplier is required"),
    check("zone").not().isEmpty().withMessage("Zone is required"),
    check("amount").not().isEmpty().withMessage("Amount is required"),
    check("occupation").not().isEmpty().withMessage("Occupation is required"),
    sanitizeBody("group_seq").trim().unescape(),
    sanitizeBody("group_sl").trim().unescape(),
    sanitizeBody("visa").trim().unescape(),
    sanitizeBody("id").trim().unescape(),
    sanitizeBody("supplier").trim().unescape(),
    sanitizeBody("amount").trim().unescape(),
    sanitizeBody("occupation").trim().unescape(),
], GroupController.postGroupRegistration);
router.get("/edit/:id", auth, roleCheck, GroupController.editGroup);
router.post("/update/:id", auth, roleCheck, upload.any(), [
    check("group_sl").not().isEmpty().withMessage("Group Sl is required").isNumeric().withMessage("Group SL must be numeric"),
    check("visa_number").not().isEmpty().withMessage("Visa Number required").isNumeric().withMessage("Visa Number must be numeric"),
    check("visa_id").not().isEmpty().withMessage("Visa ID is required").isNumeric().withMessage("Visa Id must be numeric"),
    check("visa_supplier").not().isEmpty().withMessage("Visa Supplier is required"),
    check("zone").not().isEmpty().withMessage("Zone is required"),
    check("amount").not().isEmpty().withMessage("Amount is required"),
    check("occupation").not().isEmpty().withMessage("Occupation is required"),
    sanitizeBody("group_sl").trim().unescape(),
    sanitizeBody("visa").trim().unescape(),
    sanitizeBody("id").trim().unescape(),
    sanitizeBody("supplier").trim().unescape(),
    sanitizeBody("amount").trim().unescape(),
    sanitizeBody("occupation").trim().unescape(),
], GroupController.updateGroup);
router.delete("/delete/:id", auth, roleCheck, GroupController.deleteGroup);

router.get("/getGroupImage/:image", auth, roleCheck, GroupController.getGroupImage);
router.get("/:id", auth, roleCheck, GroupController.getGroup);

module.exports = router;

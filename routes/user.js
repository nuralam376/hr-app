/** User routes*/

/** Required modules */
const express = require("express");
const router = express.Router();
const path = require("path");

/** Validation Configuration */
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Authetication File */
const auth = require("../config/auth");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("pax");

/** SuperAdmin Access */
const isSuperAdmin = require("../config/isSuperAdmin");


/** User Controller Page */
const UserController = require("../controllers/userController");

const upload = require("../util/uploadFile");


/** All routes of the user */
router.get("/", auth, roleCheck, UserController.getAllUsers);
router.get("/register", auth, roleCheck, UserController.getRegistration);
router.post("/register", auth, roleCheck, upload.any(), [
    check("code").not().isEmpty().withMessage("Code is required").isNumeric().withMessage("Code must be numeric"),
    check("name").not().isEmpty().withMessage("Name is required"),
    check("father").not().isEmpty().withMessage("Father Name is required"),
    check("mother").not().isEmpty().withMessage("Mother Name is required"),
    check("contact").not().isEmpty().withMessage("Contact No. is required"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("category").not().isEmpty().withMessage("Category is required"),
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
    sanitizeBody("code").trim().unescape(),
    sanitizeBody("category").trim().unescape(),
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
], UserController.postRegistration);

router.get("/edit/:id", auth, roleCheck, UserController.editUser);

router.post("/update/:id", auth, roleCheck, upload.any(), [
    check("name").not().isEmpty().withMessage("Name is required"),
    check("father").not().isEmpty().withMessage("Father Name is required"),
    check("mother").not().isEmpty().withMessage("Mother Name is required"),
    check("contact").not().isEmpty().withMessage("Contact No. is required"),
    check("category").not().isEmpty().withMessage("Category is required"),
    check("national").not().isEmpty().withMessage("Nationality is required"),
    check("nid").not().isEmpty().withMessage("National ID is required").isNumeric().withMessage("National Id must be numeric"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("present_address").not().isEmpty().withMessage("Present Address is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),
    check("gender").not().isEmpty().withMessage("Gender is required"),
    check("religion").not().isEmpty().withMessage("Religion is required"),
    check("maritial").not().isEmpty().withMessage("Maritial Status is required"),
    check("group").not().isEmpty().withMessage("Group is required"),
    check("supplier").not().isEmpty().withMessage("Supplier is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("category").trim().unescape(),
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
], UserController.updateUser);

router.delete("/delete/:id", auth, isSuperAdmin, UserController.deleteUser);

router.get("/sticker/:id", auth, roleCheck, UserController.getUsersSticker);

router.get("/pdf/:id", auth, roleCheck, UserController.downloadUsersSticker);

router.get("/timeline/:id", auth, isSuperAdmin, UserController.usersTimeline);

router.get("/:id", auth, roleCheck, UserController.getUser);

module.exports = router;
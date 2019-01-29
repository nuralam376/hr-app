/** Required Modules */
const express = require("express");
const router = express.Router();

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Group Controller */
const GroupController = require("../controllers/groupController");

/** Auth Configuration */
const auth = require("../config/auth");

/** Group Routes */
router.get("/",auth,GroupController.getAllGroups);
router.get("/register",auth,GroupController.getGroupRegistration);
router.post("/register",auth,[
    check("name").not().isEmpty().withMessage("Zone Name is required"),
    check("country").not().isEmpty().withMessage("Country is required"),
    sanitizeBody("name").toString(),
    sanitizeBody("country").toString(),
],GroupController.postGroupRegistration);
router.get("/edit/:id",auth,GroupController.editGroup);
router.post("/update/:id",auth,[
    check("name").not().isEmpty().withMessage("Zone Name is required"),
    check("country").not().isEmpty().withMessage("Country is required"),
    sanitizeBody("name").toString(),
    sanitizeBody("country").toString(),
],GroupController.updateGroup);
router.delete("/delete/:id",auth,GroupController.deleteGroup);
router.get("/:id",auth,GroupController.getGroup);

module.exports = router;

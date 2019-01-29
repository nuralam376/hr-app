/** Required Modules */
const express = require("express");
const router = express.Router();

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Zone Controller */
const ZoneController = require("../controllers/zoneController");

/** Auth Configuration */
const auth = require("../config/auth");

/** Zone Routes */
router.get("/",auth,ZoneController.getAllZones);
router.get("/register",auth,ZoneController.getZoneRegistration);
router.post("/register",auth,[
    check("name").not().isEmpty().withMessage("Zone Name is required"),
    check("country").not().isEmpty().withMessage("Country is required"),
    sanitizeBody("name").toString(),
    sanitizeBody("country").toString(),
],ZoneController.postZoneRegistration);
router.get("/edit/:id",auth,ZoneController.editZone);
router.post("/update/:id",auth,[
    check("name").not().isEmpty().withMessage("Zone Name is required"),
    check("country").not().isEmpty().withMessage("Country is required"),
    sanitizeBody("name").toString(),
    sanitizeBody("country").toString(),
],ZoneController.updateZone);
router.delete("/delete/:id",auth,ZoneController.deleteZone);
router.get("/:id",auth,ZoneController.getZone);

module.exports = router;

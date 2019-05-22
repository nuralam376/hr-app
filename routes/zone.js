/** Required Modules */
const express = require("express");
const router = express.Router();

/** Validation Configuration */
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Zone Controller */
const ZoneController = require("../controllers/zoneController");

/** Auth Configuration */
const auth = require("../config/auth");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("zone");

/** SuperAdmin Access */
const isSuperAdmin = require("../config/isSuperAdmin");

/** Zone Routes */
router.get("/", auth, roleCheck, ZoneController.getAllZones);
router.get("/register", auth, roleCheck, ZoneController.getZoneRegistration);
router.post("/register", auth, roleCheck, [
    check("name").not().isEmpty().withMessage("Zone Name is required"),
    check("country").not().isEmpty().withMessage("Country is required"),
    sanitizeBody("name").toString(),
    sanitizeBody("country").toString(),
], ZoneController.postZoneRegistration);
router.get("/edit/:id", auth, roleCheck, ZoneController.editZone);
router.post("/update/:id", auth, roleCheck, [
    check("name").not().isEmpty().withMessage("Zone Name is required"),
    check("country").not().isEmpty().withMessage("Country is required"),
    sanitizeBody("name").toString(),
    sanitizeBody("country").toString(),
], ZoneController.updateZone);
router.delete("/delete/:id", auth, isSuperAdmin, ZoneController.deleteZone);
router.get("/names", auth, roleCheck, ZoneController.getAllNames);
router.get("/timeline/:id", auth, isSuperAdmin, ZoneController.zoneTimeline);
router.get("/:id", auth, roleCheck, ZoneController.getZone);

module.exports = router;

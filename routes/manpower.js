const express = require("express");

const router = express.Router();
const path = require("path");

/** TC Controller */
const manpowerController = require("../controllers/manpowerController");

/** Authentication File */
const auth = require("../config/auth");

const upload = require("../util/uploadFile");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("manpower");

/** SuperAdmin Access */
const isSuperAdmin = require("../config/isSuperAdmin");


/** Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

router.get("/", auth, roleCheck, manpowerController.getAllInfos);

router.get("/search", auth, roleCheck, manpowerController.getSearch);

router.get("/search/:id", auth, roleCheck, manpowerController.registerManpower);

router.post("/search", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], manpowerController.postSearch);

router.post("/register/:id", auth, roleCheck, manpowerController.postManpower);

router.get("/status", auth, roleCheck, manpowerController.getStatusSearch);

router.post("/status", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], manpowerController.postStatusSearch);

router.get("/status/:id", auth, roleCheck, manpowerController.getRegisterManpowerStatus);

router.post("/status/:id", auth, roleCheck, upload.any(), [
    body("clearance").not().isEmpty().withMessage("Clearance Date is required"),
    body("card_no").not().isEmpty().withMessage("SmartCard No. is required"),
    sanitizeBody("clearance").toDate(),
    sanitizeBody("card_no").trim().unescape(),
], manpowerController.postRegisterManpowerStatus);

router.delete("/delete/:id", auth, isSuperAdmin, manpowerController.deleteManpower);

router.get("/timeline/:id", auth, isSuperAdmin, manpowerController.manpowerTimeline);

module.exports = router;
const express = require("express");

const router = express.Router();
const path = require("path");

/** Stamping Controller */
const stampingController = require("../controllers/stampingController");

/** Authentication File */
const auth = require("../config/auth");

const upload = require("../util/uploadFile");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("stamping");

/** Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

router.get("/", auth, roleCheck, stampingController.getAllInfos);

router.get("/search", auth, roleCheck, stampingController.getSearch);

router.get("/search/:id", auth, roleCheck, stampingController.registerStamping);

router.post("/search", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], stampingController.postSearch);

router.post("/register/:id", auth, roleCheck, [
    sanitizeBody("status").trim().unescape()
], upload.any(), stampingController.postStamping);

router.get("/completesearch", auth, roleCheck, stampingController.getCompleteStampingSearch);

router.post("/completesearch", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], stampingController.postStampingCompleteSearch);

router.get("/completeregistration/:id", auth, roleCheck, stampingController.getCompleteRegistration);

router.post("/completeregistration/:id", auth, roleCheck, [
    body("visa_no").not().isEmpty().withMessage("Visa No is required"),
    body("stamping_date").not().isEmpty().withMessage("Stamping Date is required"),
    sanitizeBody("visa_no").trim().unescape(),
    sanitizeBody("stamping_date").trim().unescape().toDate()
], stampingController.postCompleteStampingRegistration);

router.delete("/delete/:id", auth, roleCheck, stampingController.deleteStamping);

module.exports = router;
/** Required Modules */
const express = require("express");
const router = express.Router();

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Auth Configuration */
const auth = require("../config/auth");

/** Medical Controller */
const MedicalController = require("../controllers/medicalController");

/** Medical Routes */
router.get("/",auth,MedicalController.getAllMedicals);

router.get("/pax",auth, MedicalController.getMedicalRegistrationSearch);

router.post("/pax",auth,[
    check("code").not().isEmpty().withMessage("Code is required"),
    sanitizeBody("code").trim().unescape()
],MedicalController.postPAXCode);
module.exports = router;

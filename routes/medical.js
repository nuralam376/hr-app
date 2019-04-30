/** Required Modules */
const express = require("express");
const router = express.Router();
const path = require("path");

/** Validation Configuration */
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Auth Configuration */
const auth = require("../config/auth");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("medical");

/** Medical Controller */
const MedicalController = require("../controllers/medicalController");

/** Multer Configuration */
const multer = require("multer");

const upload = require("../util/uploadFile");

/** Medical Routes */
// router.get("/",auth,MedicalController.getAllMedicals);

router.get("/", auth, roleCheck, MedicalController.getMedicalRegistrationSearch);

router.post("/", auth, roleCheck, [
    check("code").not().isEmpty().withMessage("Code is required").isNumeric().withMessage("Code must be numeric"),
    sanitizeBody("code").trim().unescape()
], MedicalController.postPAXCodeForGroup);

router.get("/all", auth, roleCheck, MedicalController.allMedicals);


router.post("/center", auth, roleCheck, [
    check("code").not().isEmpty().withMessage("Code is required").isNumeric().withMessage("Code must be numeric"),
    sanitizeBody("code").trim().unescape()
], MedicalController.postPAXCodeForMedicalCenter);


router.post("/register", auth, roleCheck, MedicalController.postMedicalGroup);

router.get("/register/center", auth, roleCheck, MedicalController.getMedicalCenterInfo);


router.post("/register/center/:id", auth, roleCheck, upload.any(), [
    check("center").not().isEmpty().withMessage("Center Name is required"),
    check("issue").not().isEmpty().withMessage("Medical Issue Date is required"),
    sanitizeBody("code").trim().unescape(),
    sanitizeBody("issue").trim().toDate(),
], MedicalController.postMedicalRegistration);

router.get("/report", auth, roleCheck, MedicalController.searchPAXForReport);

router.post("/report", auth, roleCheck, MedicalController.getReportRegistration);

router.get("/register/report/:id", auth, roleCheck, MedicalController.getMedicalPAXInfoForReport);

router.post("/register/report/:id", auth, roleCheck, upload.any(), [
    check("expiry").not().isEmpty().withMessage("Medical Expiration Date is required")
], MedicalController.postMedicalReportInfo);

router.get("/center/edit/:id", auth, roleCheck, MedicalController.editMedicalCenterInfo);
router.post("/center/update/:id", auth, roleCheck, upload.any(), [
    check("center").not().isEmpty().withMessage("Center Name is required"),
    check("issue").not().isEmpty().withMessage("Medical Issue Date is required")
], MedicalController.updateMedicalCenterInfo);

router.get("/report/edit/:id", auth, roleCheck, MedicalController.editMedicalReportInfo);

router.post("/report/update/:id", auth, roleCheck, upload.any(), [
    check("expiry").not().isEmpty().withMessage("Medical Expiration Date is required")
], MedicalController.updateMedicalReportInfo);

router.get("/register/center/:id", auth, roleCheck, MedicalController.getMedicalPAXInfoForCenter);
router.get("/register/:id", auth, roleCheck, MedicalController.getMedicalPAXInfo);
router.delete("/delete/:id", auth, roleCheck, MedicalController.deleteMedicalInfo);
router.get("/print/:id", auth, roleCheck, MedicalController.printDoc);
router.get("/passport/:id", auth, roleCheck, MedicalController.printPassport);
router.get("/application/:id", auth, roleCheck, MedicalController.printApplication);
router.get("/enjazit/:id", auth, roleCheck, MedicalController.printEnjazit);
router.get("/:id", auth, roleCheck, MedicalController.getMedicalInfo);


module.exports = router;

/** Required Modules */
const express = require("express");
const router = express.Router();
const path = require("path");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Auth Configuration */
const auth = require("../config/auth");

/** Medical Controller */
const MedicalController = require("../controllers/medicalController");

/** Multer Configuration */
const multer = require("multer");

const upload = require("../util/uploadFile");

/** Medical Routes */
// router.get("/",auth,MedicalController.getAllMedicals);

router.get("/",auth, MedicalController.getMedicalRegistrationSearch);

router.post("/",auth,[
    check("code").not().isEmpty().withMessage("Code is required").isNumeric().withMessage("Code must be numeric"),
    sanitizeBody("code").trim().unescape()
],MedicalController.postPAXCodeForGroup);

router.get("/all",auth,MedicalController.allMedicals);


router.post("/center",auth,[
    check("code").not().isEmpty().withMessage("Code is required").isNumeric().withMessage("Code must be numeric"),
    sanitizeBody("code").trim().unescape()
],MedicalController.postPAXCodeForMedicalCenter);


router.post("/register",auth,MedicalController.postMedicalGroup);

router.get("/register/center",auth, MedicalController.getMedicalCenterInfo);


router.post("/register/center/:id",auth,upload.any(),[
    check("center").not().isEmpty().withMessage("Center Name is required"),
    check("issue").not().isEmpty().withMessage("Medical Issue Date is required"),
    sanitizeBody("code").trim().unescape(),
    sanitizeBody("issue").trim().toDate(),
],MedicalController.postMedicalRegistration);

router.get("/report",auth,MedicalController.searchPAXForReport);

router.post("/report",auth,MedicalController.getReportRegistration);

router.get("/register/report/:id",auth,MedicalController.getMedicalPAXInfoForReport);

router.post("/register/report/:id",auth,upload.any(),[
    check("expiry").not().isEmpty().withMessage("Medical Expiration Date is required")
],MedicalController.postMedicalReportInfo);

router.get("/center/edit/:id",auth,MedicalController.editMedicalCenterInfo);
router.post("/center/update/:id",auth,upload.any(),[
    check("center").not().isEmpty().withMessage("Center Name is required"),
    check("issue").not().isEmpty().withMessage("Medical Issue Date is required")
],MedicalController.updateMedicalCenterInfo);

router.get("/report/edit/:id",auth,MedicalController.editMedicalReportInfo);

router.post("/report/update/:id",auth,upload.any(),[
    check("expiry").not().isEmpty().withMessage("Medical Expiration Date is required")
],MedicalController.updateMedicalReportInfo);

router.get("/register/center/:id",auth,MedicalController.getMedicalPAXInfoForCenter);
router.get("/register/:id",auth,MedicalController.getMedicalPAXInfo);
router.delete("/delete/:id",auth,MedicalController.deleteMedicalInfo);
router.get("/print/:id",auth,MedicalController.printDoc);
router.get("/passport/:id",auth,MedicalController.printPassport);
router.get("/application/:id",auth,MedicalController.printApplication);
router.get("/enjazit/:id",auth,MedicalController.printEnjazit);
router.get("/:id",auth,MedicalController.getMedicalInfo);


module.exports = router;

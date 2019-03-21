const express = require("express");

const router = express.Router();
const path = require("path");

/** TC Controller */
const manpowerController = require("../controllers/manpowerController");

/** Authentication File */
const auth = require("../config/auth");

const upload = require("../util/uploadFile");

/** Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

router.get("/",auth,manpowerController.getAllInfos);

router.get("/search",auth,manpowerController.getSearch);

router.get("/search/:id",auth,manpowerController.registerManpower);

router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],manpowerController.postSearch);

router.post("/register/:id",auth,manpowerController.postManpower);

router.get("/status",auth,manpowerController.getStatusSearch);

router.post("/status",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],manpowerController.postStatusSearch);

router.get("/status/:id",auth,manpowerController.getRegisterManpowerStatus);

router.post("/status/:id",auth,upload.any(),[
    body("clearance").not().isEmpty().withMessage("Clearance Date is required"),
    body("card_no").not().isEmpty().withMessage("SmartCard No. is required"),
    sanitizeBody("clearance").toDate(),
    sanitizeBody("card_no").trim().unescape(),
],manpowerController.postRegisterManpowerStatus);

router.delete("/delete/:id",auth,manpowerController.deleteManpower);

module.exports = router;
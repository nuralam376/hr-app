const express = require("express");

const router = express.Router();
const path = require("path");

/** Stamping Controller */
const stampingController = require("../controllers/stampingController");

/** Authentication File */
const auth = require("../config/auth");

const upload = require("../util/uploadFile");

/** Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

router.get("/",auth,stampingController.getAllInfos);

router.get("/search",auth,stampingController.getSearch);

router.get("/search/:id",auth,stampingController.registerStamping);

router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],stampingController.postSearch);

router.post("/register/:id",auth,[
    sanitizeBody("status").trim().unescape()
],upload.any(),stampingController.postStamping);

router.get("/completesearch",auth,stampingController.getCompleteStampingSearch);

router.post("/completesearch",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],stampingController.postStampingCompleteSearch);

router.get("/completeregistration/:id",auth,stampingController.getCompleteRegistration);

router.post("/completeregistration/:id",auth,[
    body("visa_no").not().isEmpty().withMessage("Visa No is required"),
    body("stamping_date").not().isEmpty().withMessage("Stamping Date is required"),
    sanitizeBody("visa_no").trim().unescape(),
    sanitizeBody("stamping_date").trim().unescape().toDate()
],stampingController.postCompleteStampingRegistration);

router.delete("/delete/:id",auth,stampingController.deleteStamping);

module.exports = router;
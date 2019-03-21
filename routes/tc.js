const express = require("express");

const router = express.Router();
const path = require("path");

/** TC Controller */
const tcController = require("../controllers/tcController");

/** Authentication File */
const auth = require("../config/auth");

const upload = require("../util/uploadFile");


/** Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

router.get("/",auth,tcController.getAllInfos);

router.get("/search",auth,tcController.getSearch);

router.get("/search/:id",auth,tcController.registerTC);

router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],tcController.postSearch);

router.post("/register/:id",auth,upload.any(),tcController.postTC);

router.get("/download/:id",auth,tcController.downloadTC);

router.delete("/delete/:id",auth,tcController.deleteTc);


module.exports = router;
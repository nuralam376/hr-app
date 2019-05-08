const express = require("express");

const router = express.Router();
const path = require("path");

/** TC Controller */
const tcController = require("../controllers/tcController");

/** Authentication File */
const auth = require("../config/auth");

const upload = require("../util/uploadFile");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("tc");


/** Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

router.get("/", auth, roleCheck, tcController.getAllInfos);

router.get("/search", auth, roleCheck, tcController.getSearch);

router.get("/search/:id", auth, roleCheck, tcController.registerTC);

router.post("/search", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], tcController.postSearch);

router.post("/register/:id", auth, roleCheck, upload.any(), tcController.postTC);

router.get("/download/:id", auth, roleCheck, tcController.downloadTC);

router.delete("/delete/:id", auth, roleCheck, tcController.deleteTc);

router.get("/timeline/:id", auth, roleCheck, tcController.tcTimeline);



module.exports = router;
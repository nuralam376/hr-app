const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Flight Controller */
const flightController = require("../controllers/flightController");


router.get("/",auth,flightController.getAllInfos);

router.get("/search",auth,flightController.getSearch);


router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],flightController.postSearch);

router.get("/requisition/:id",auth,flightController.registerRequisition);

router.post("/requisition/:id",auth,[
    body("probable_date").not().isEmpty().withMessage("Probable Date is required"),
    body("probable_airlines").not().isEmpty().withMessage("Probable Airlines is required"),
    sanitizeBody("probable_date").toDate(),
    sanitizeBody("probable_airlines").trim().unescape(),
],flightController.postRequisition);

module.exports = router;
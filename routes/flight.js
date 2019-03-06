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

router.get("/report",auth,flightController.getReportSearch);


router.post("/report",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],flightController.postReportSearch);

router.get("/report/:id",auth,flightController.registerReport);

router.post("/report/:id",auth,[
    body("flight_date").not().isEmpty().withMessage("Flight Date is required"),
    body("flight_airlines").not().isEmpty().withMessage("Airlines is required"),
    body("price").not().isEmpty().withMessage("Price is required").isNumeric().withMessage("Price must be numeric"),
    sanitizeBody("flight_date").toDate(),
    sanitizeBody("flight_airlines").trim().unescape(),
    sanitizeBody("price").trim().unescape(),
],flightController.postReport);

router.delete("/delete/:id",auth,flightController.deleteFlight);

module.exports = router;
const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("flight");

/** Flight Controller */
const flightController = require("../controllers/flightController");


router.get("/", auth, roleCheck, flightController.getAllInfos);

router.get("/search", auth, roleCheck, flightController.getSearch);


router.post("/search", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], flightController.postSearch);

router.get("/requisition/:id", auth, roleCheck, flightController.registerRequisition);

router.post("/requisition/:id", auth, roleCheck, [
    body("probable_date").not().isEmpty().withMessage("Probable Date is required"),
    body("probable_airlines").not().isEmpty().withMessage("Probable Airlines is required"),
    sanitizeBody("probable_date").toDate(),
    sanitizeBody("probable_airlines").trim().unescape(),
], flightController.postRequisition);

router.get("/report", auth, roleCheck, flightController.getReportSearch);


router.post("/report", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], flightController.postReportSearch);

router.get("/report/:id", auth, roleCheck, flightController.registerReport);

router.post("/report/:id", auth, roleCheck, [
    body("flight_date").not().isEmpty().withMessage("Flight Date is required"),
    body("flight_airlines").not().isEmpty().withMessage("Airlines is required"),
    body("price").not().isEmpty().withMessage("Price is required").isNumeric().withMessage("Price must be numeric"),
    sanitizeBody("flight_date").toDate(),
    sanitizeBody("flight_airlines").trim().unescape(),
    sanitizeBody("price").trim().unescape(),
], flightController.postReport);

router.delete("/delete/:id", auth, roleCheck, flightController.deleteFlight);

module.exports = router;
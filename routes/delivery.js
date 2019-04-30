const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("delivery");

/** Delivery  Controller */
const deliveryController = require("../controllers/deliveryController");


router.get("/", auth, roleCheck, deliveryController.getAllInfos);

router.get("/search", auth, roleCheck, deliveryController.getSearch);


router.post("/search", auth, roleCheck, [
    body("code", "Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
], deliveryController.postSearch);

router.get("/report/:id", auth, roleCheck, deliveryController.registerReport);

router.post("/report/:id", auth, roleCheck, [
    body("received_by").not().isEmpty().withMessage("Received by is required"),
    sanitizeBody("received_by").trim().unescape()
], deliveryController.postReport);

router.delete("/delete/:id", auth, roleCheck, deliveryController.deleteDelivery);


module.exports = router;
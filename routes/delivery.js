const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Delivery  Controller */
const deliveryController = require("../controllers/deliveryController");


router.get("/",auth,deliveryController.getAllInfos);

router.get("/search",auth,deliveryController.getSearch);


router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],deliveryController.postSearch);

router.get("/report/:id",auth,deliveryController.registerReport);

router.post("/report/:id",auth,[
    body("received_by").not().isEmpty().withMessage("Received by is required"),
    sanitizeBody("received_by").trim().unescape()
],deliveryController.postReport);

router.delete("/delete/:id",auth,deliveryController.deleteDelivery);


module.exports = router;
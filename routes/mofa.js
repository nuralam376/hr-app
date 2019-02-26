const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Mofa Controller */
const mofaController = require("../controllers/mofaController");


router.get("/index",auth,mofaController.getMofas);

router.get("/search",auth,mofaController.getMofaSearch);

router.post("/search",auth,[
    body("code").not().isEmpty().withMessage("PAX Code is required"),
    sanitizeBody("code").trim().unescape()
],mofaController.postSearch);

router.post("/register",auth,mofaController.postMofaRegistration);

module.exports = router;
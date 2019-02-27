const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Mofa Controller */
const mofaController = require("../controllers/mofaController");


router.get("/",auth,mofaController.getMofas);

router.get("/search",auth,mofaController.getMofaSearch);

router.post("/search",auth,[
    body("code").not().isEmpty().withMessage("PAX Code is required"),
    sanitizeBody("code").trim().unescape()
],mofaController.postSearch);

router.post("/register",auth,[
    body("occupation").not().isEmpty().withMessage("Occupation is required"),
    sanitizeBody("occupation").trim().unescape()
],mofaController.postMofaRegistration);

router.get("/groups",auth,mofaController.getAllGroups);

router.get("/sticker/:id",auth,mofaController.getSticker);

router.get("/pdf/:id",auth,mofaController.downloadSticker);

router.delete("/delete/:id",auth,mofaController.deleteMofa);

module.exports = router;
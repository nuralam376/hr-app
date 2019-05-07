const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/**Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Mofa Controller */
const mofaController = require("../controllers/mofaController");

/** Checks Role of the Admin */
const hasRole = require("../config/hasRole");

const roleCheck = hasRole("mofa");


router.get("/", auth, roleCheck, mofaController.getMofas);

router.get("/search", auth, roleCheck, mofaController.getMofaSearch);

router.post("/search", auth, roleCheck, [
    body("code").not().isEmpty().withMessage("PAX Code is required"),
    sanitizeBody("code").trim().unescape()
], mofaController.postSearch);

router.post("/register", auth, roleCheck, [
    body("occupation").not().isEmpty().withMessage("Occupation is required"),
    sanitizeBody("occupation").trim().unescape()
], mofaController.postMofaRegistration);

router.get("/groups", auth, roleCheck, mofaController.getAllGroups);

router.get("/sticker/:id", auth, roleCheck, mofaController.getSticker);

router.get("/pdf/:id", auth, roleCheck, mofaController.downloadSticker);

router.get("/timeline/:id", auth, roleCheck, mofaController.mofaTimeline);

router.delete("/delete/:id", auth, roleCheck, mofaController.deleteMofa);

module.exports = router;
const express = require("express");

const router = express.Router();

/** Authentication */
const auth = require("../config/auth");

/** Mofa Controller */
const mofaController = require("../controllers/mofaController");


router.get("/index",auth,mofaController.getMofas);

module.exports = router;
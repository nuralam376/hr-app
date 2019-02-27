const express = require("express");

const router = express.Router();

/** Stamping Controller */
const stampingController = require("../controllers/stampingController");

/** Authentication File */
const auth = require("../config/auth");

router.get("/search",auth,stampingController.getSearch);

module.exports = router;
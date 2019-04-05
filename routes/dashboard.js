/** This is the Admin Dashbard Routes.*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication File */
const auth = require("../config/auth");

/** Dashboard Controller */
const dashboardController = require("../controllers/dashboardController");

/** Shows Company Details in Admin Dashboard */

router.get("/",auth, dashboardController.getDashboard);

router.get("/data",auth, dashboardController.getChartData);

module.exports = router;
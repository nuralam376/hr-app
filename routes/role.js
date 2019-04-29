/** This is the Admin Roles Dashbard Routes.*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication File */
const auth = require("../config/auth");

/** Role Controller */
const roleController = require("../controllers/roleController");

/** Admin Roles Routes */

router.get("/", auth, roleController.getAdminRoles);

router.get("/admin", auth, roleController.createAdminRoles);


module.exports = router;

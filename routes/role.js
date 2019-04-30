/** This is the Admin Roles Dashbard Routes.*/

/** Required modules */
const express = require("express");
const router = express.Router();

/** Authetication File */
const auth = require("../config/auth");

/** SuperAdmin Check */
const isSuperAdmin = require("../config/isSuperAdmin");

/** Role Controller */
const roleController = require("../controllers/roleController");

/**Validation */
const { check, body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

/** Admin Roles Routes */

router.get("/", auth, isSuperAdmin, roleController.getAdminRoles);

router.get("/admin", auth, isSuperAdmin, roleController.createAdminRoles);

router.post("/admin", auth, isSuperAdmin, [
    body("admin").not().isEmpty().withMessage("Admin is required"),
    sanitizeBody("admin").trim().unescape()
], roleController.postAdminRoles);

module.exports = router;

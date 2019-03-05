const express = require("express");

const router = express.Router();
const path = require("path");

/** TC Controller */
const manpowerController = require("../controllers/manpowerController");

/** Authentication File */
const auth = require("../config/auth");

/** Multer Configuration */
const multer = require("multer");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/manpower",
    filename : function(req,file,cb)
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});


/** Implements File upload validation */
const upload = multer({
    storage : storage,
    fileFilter : function(req,file,cb){
        checkFileType(req,file,cb)
    }
});


/**
 * Checks Whether the file is an image or not
 * 
 */
function checkFileType(req,file,cb)
{
    let ext = path.extname(file.originalname);
    let size = file.size;
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
         req.fileValidationError = "Forbidden extension";
         return cb(null, false, req.fileValidationError);
   }
   cb(null, true);
}

/** Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

router.get("/",auth,manpowerController.getAllInfos);

router.get("/search",auth,manpowerController.getSearch);

router.get("/search/:id",auth,manpowerController.registerManpower);

router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],manpowerController.postSearch);

router.post("/register/:id",auth,manpowerController.postManpower);

router.get("/status",auth,manpowerController.getStatusSearch);

router.post("/status",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],manpowerController.postStatusSearch);

router.get("/status/:id",auth,manpowerController.getRegisterManpowerStatus);

router.post("/status/:id",auth,upload.any(),[
    body("clearance").not().isEmpty().withMessage("Clearance Date is required"),
    body("card_no").not().isEmpty().withMessage("SmartCard No. is required"),
    sanitizeBody("clearance").toDate(),
    sanitizeBody("card_no").trim().unescape(),
],manpowerController.postRegisterManpowerStatus);



module.exports = router;
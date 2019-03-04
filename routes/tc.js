const express = require("express");

const router = express.Router();
const path = require("path");

/** TC Controller */
const tcController = require("../controllers/tcController");

/** Authentication File */
const auth = require("../config/auth");

/** Multer Configuration */
const multer = require("multer");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/stamping",
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
    if (ext !== '.pdf') {
         req.fileValidationError = "Forbidden extension";
         return cb(null, false, req.fileValidationError);
   }
   cb(null, true);
}

/** Validation */
const {check,body} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

router.get("/",auth,tcController.getAllInfos);

router.get("/search",auth,tcController.getSearch);

router.get("/search/:id",auth,tcController.registerTC);

router.post("/search",auth,[
    body("code","Pax is required").not().isEmpty(),
    sanitizeBody("code").trim().unescape()
],tcController.postSearch);

module.exports = router;
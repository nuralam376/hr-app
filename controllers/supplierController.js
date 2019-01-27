/** This is the Suuplier controller page. Supplier CRUD functions are here. */

/** Required modules */
const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const moment = require("moment");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody } = require("express-validator/filter");
const multer = require("multer");

/** Authentication Check File */
const auth = require("../config/auth");

/** Supplier Model Schema */
const SupplierModel = require("../models/supplierModel");

/** Company Info Model Schema */
let CompanyInfoModel = require("../models/companyInfoModel");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/supplier",
    filename : (req,file,cb) => 
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

/** Implements File upload validation */
const upload = multer({
    storage : storage,
    fileFilter : (req,file,cb) => {
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



/** Renders All Suppliers */
router.get("/",auth,async(req,res) => {
    try 
    {
        let suppliers = await SupplierModel.find({company : req.user.company});

        res.render("supplier/index",{
            suppliers : suppliers
        });
    }
    catch(err)
    {
        console.log(err);
    }    

});

/** Shows Supplier Registration Page */

router.get("/register",auth,async(req,res) => {
    try 
    {
        res.render("supplier/register");
    }
    catch(err)
    {
        console.log(err);
    }    

});

/** Receives Supplier input data for registration */
router.post("/register",auth,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
    check("email").isEmail().withMessage("Email must be valid"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("blood").not().isEmpty().withMessage("Blood Group is required"),
    check("nid").not().isEmpty().withMessage("National ID is required").isNumeric().withMessage("National Id must be numeric"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),

    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("password").trim().unescape(),
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt(),
],async(req,res) => {
    try {
        let forms = {
            name : req.body.name,
            email : req.body.email,
            blood : req.body.blood,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            birth_date : req.body.birth_date,
            nid : req.body.nid,
            passport : req.body.passport,
            profile_photo : "dummy.jpeg",
            passport_photo : "dummy.jpeg",
        };

        /** Checks if the Supplier uploads any file */
        if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
        {
            if(req.files[0].fieldname == "profile_photo")
                forms.profile_photo = req.files[0].filename;
            else
                forms.passport_photo = req.files[0].filename;
        }
        
        if(typeof req.files[1] !== "undefined" && req.files[1].fieldname == "passport_photo" && req.fileValidationError == null)
        {
            forms.passport_photo = req.files[1].filename;
        }

        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("supplier/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError
            });
        }
        else if(typeof req.fileValidationError != undefined && req.fileValidationError != null)
        {
            res.render("supplier/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError
            });
        }
        else
        {
            /** Stores Forms data in supplier object */
            let supplier = new SupplierModel();
            supplier.name = forms.name;
            supplier.email = forms.email;
            supplier.birth_date = forms.birth_date;
            supplier.blood_group = forms.blood;
            supplier.nid = forms.nid;
            supplier.passport = forms.passport;
            supplier.present_address = forms.present_address;
            supplier.permanent_address = forms.permanent_address;
            supplier.profile_photo = forms.profile_photo;
            supplier.passport_photo = forms.passport_photo;
            supplier.company = req.user.company;      

             /** Supplier Status */
             let supplierStatus = {
                type : "profile_created",
                display_name : "Profile Created",
                description : `${req.user.name} created profile of ${supplier.name}`,
            };

            supplier.events.push(supplierStatus);

            
            let company = await CompanyInfoModel.findOne({company : req.user.company}); // Finds the last Inserted Id of the Supplier
            let supplierCount = company.supplier + 1; 
            
            supplier.seq_id =  "s_" + supplierCount; // Adds 1 in the Supplier Sequence Number

            let newSupplier = await supplier.save(); // Saves New Supplier

            if(newSupplier)
            {
                let companyInfo = {};
                companyInfo.supplier = supplierCount;
                let query = {company: req.user.company};
                let companyInfoUpdate = await CompanyInfoModel.findOneAndUpdate(query,companyInfo); // Updates the Number of the Supplier
                req.flash("success","New Supplier has been created");
                res.redirect("/supplier");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/supplier");
            }
        }
        
    } 
    catch (error) {
        console.log(error);
    }
        
    
});

/**
 * Represents Supplier Edit Options.
 * 
 * @param {string} id - The Object Id of the Supplier.
 *
 */

router.get("/edit/:id",auth,async(req,res) => {
    try
    {
        
        let query = {seq_id : req.params.id, company : req.user.company}; 
    
        let supplier = await SupplierModel.findOne(query); // Find the logged in Admin's Company Supplier
        
        if(supplier)
        {
            res.render("supplier/edit",{
                supplier : supplier,
            });
        }
        else
        {
            req.flash("danger","Not Found");
            res.redirect("/supplier");
        }    
    
    }
    catch(error)
    {
        console.log(error);
    }   
 

});

/**
 * Receives Supplier input data for updating the supplier
 * @param {string} id - The Object Id of the Supplier.
*/

router.post("/update/:id",auth,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
    check("email").isEmail().withMessage("Email must be valid"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("blood").not().isEmpty().withMessage("Blood Group is required"),
    check("nid").not().isEmpty().withMessage("National ID is required").isNumeric().withMessage("National Id must be numeric"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("password").trim().unescape(),
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt(),
],async(req,res) => {

    try{
        let forms = {
            name : req.body.name,
            email : req.body.email,
            blood : req.body.blood,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            birth_date : req.body.birth_date,
            nid : req.body.nid,
            passport : req.body.passport,
        };

       
            let query = {_id : req.params.id, company : req.user.company};

            let newSupplier = await SupplierModel.findOne(query);

            if(newSupplier)
            {
                let errors = validationResult(req);
                forms.profile_photo = newSupplier.profile_photo;
                forms.passport_photo = newSupplier.passport_photo;
    
                if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
                {
                    if(req.files[0].fieldname == "profile_photo")
                        forms.profile_photo = req.files[0].filename;
                    else
                        forms.passport_photo = req.files[0].filename;
                }
                
                if(typeof req.files[1] !== "undefined" && req.files[1].fieldname == "passport_photo" && req.fileValidationError == null)
                {
                    forms.passport_photo = req.files[1].filename;
                }
    
                if(!errors.isEmpty())
                {
                   
                    res.render("users/edit",{
                        errors : errors.array(),
                        supplier : supplier,
                        fileError : req.fileValidationError
                    });
                  
                }
                else
                {
                    if(newSupplier.profile_photo !== forms.profile_photo && newSupplier.profile_photo != "dummy.jpeg")
                    {
                        fs.unlink("./public/uploads/supplier/"+newSupplier.profile_photo, (err) => {
                             if(err)
                             {
                                 console.log(err);
                             }
                         });
                    }
                    if(newSupplier.passport_photo !== forms.passport_photo && newSupplier.passport_photo != "dummy.jpeg")
                    {
                        fs.unlink("./public/uploads/supplier/"+newSupplier.passport_photo, (err) => {
                            if(err)
                             {
                                 console.log(err);
                             }
                         });
                    }
    
                    let supplier = {};
                    supplier.name = forms.name;
                    supplier.email = forms.email;
                    supplier.birth_date = forms.birth_date;
                    supplier.blood_group = forms.blood;
                    supplier.nid = forms.nid;
                    supplier.passport = forms.passport;
                    supplier.present_address = forms.present_address;
                    supplier.permanent_address = forms.permanent_address;
                    supplier.profile_photo = newSupplier.profile_photo;
                    supplier.passport_photo = newSupplier.passport_photo;
                    supplier.profile_photo = forms.profile_photo;
                    supplier.passport_photo = forms.passport_photo;
                    supplier.company = req.user.company;
                    supplier.updated_at = Date.now();
    
      
                    let supplierUpdate = await SupplierModel.updateOne(query,supplier);

                    if(supplierUpdate)
                    {
                        req.flash("success","Supplier Details Updated");
                        res.redirect("/supplier");
                    }
                    else
                    {
                        req.flash("danger","Something went wrong");
                        res.redirect("/supplier");
                    }
                   
                }
            }  
    }
    catch(err)
    {
        console.log(err);
    }

});

/**
 * Represents Supplier Delete options
 * @param {string} id - The Object Id of the Supplier.
*/

router.delete("/delete/:id",auth,async(req,res) => {
    try
    {
        let query = {_id : req.params.id, company : req.user.company}; // Deletes the Supplier

        let supplier = await SupplierModel.findOne(query);

        if(supplier)
        {
                /** Removes the old files */
            if(supplier.profile_photo != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/supplier/"+supplier.profile_photo, (err) => {
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
            if(supplier.passport_photo != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/supplier/"+supplier.passport_photo, (err) => {
                    if(err)
                        {
                            console.log(err);
                        }
                    });
            }

            let supplierDelete = await SupplierModel.deleteOne(query);

            if(supplierDelete)
            {
                req.flash("danger","Supplier Deleted");
                res.redirect("/supplier");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/supplier");
            }  
        }
    }
    catch(err)
    {
        console.log(err);
    }
  
});

/**
 * Shows Timeline of the supplier
 * @param {string} id - The Object Id of the Supplier.
*/

router.get("/timeline/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id};

        let supplier = await SupplierModel.findOne(query);
        res.render("supplier/timeline",{
            newSupplier : supplier,
            moment : moment
        });
    }
    catch(error)
    {
        console.log(error);
    }

}); 


/**
 * Shows Individual Supplier
 * @param {string} id - The Object Id of the Supplier.
*/

router.get("/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id,company : req.user.company};
        let supplier = await SupplierModel.findOne(query).exec();
        if(supplier)
        {
            res.render("supplier/view",{
                supplier : supplier
            });
        }    
        else
        {
            req.flash("danger","Not Found");
            res.redirect("/supplier");
        }
    }
    catch(error)
    {
        console.log(error);
    }

}); 

module.exports = router;
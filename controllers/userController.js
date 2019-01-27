/** This is the User controller page. User CRUD Functions are here .*/

/** Required modules */
const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");
const pdf = require("pdfkit");
const moment = require("moment");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");
const multer = require("multer");


/** Authentication Check File */
const auth = require("../config/auth");

/** User Model Schema */
let UserModel = require("../models/userModel");
/** Supplier Model Schema */
let SupplierModel = require("../models/supplierModel");

/** Company Info Model Schema */
let CompanyInfoModel = require("../models/companyInfoModel");

/** Initialize Multer storage Variable for file upload */
const storage = multer.diskStorage({
    destination : "./public/uploads/user",
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

/**
 * Shows User Home Page
 * 
 */

router.get("/",auth,async(req,res) => {
    try 
    {
        let users = await UserModel.find({company : req.user.company}).populate("supplier"); // Finds the Users of the Logged in Admin's Company
        
        if(users)
        {
            res.render("users/index",{
                users : users
            });
        }
    }
    catch(error)
    {
        console.log(error);
    }
   

});

/** Shows Registration page */
router.get("/register",auth,async(req,res) => {
    try
    {
    
        let suppliers = await SupplierModel.find({company : req.user.company}).exec(); // Selects All the Suppliers

        res.render("users/register",{
            suppliers : suppliers
        });
       
    }
    catch(error)    
    {
        console.log(error);
    }
});


/** Receives user input data for registration */
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
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt()
],async(req,res) => {
    try
    {
        /** Stores The Users Input Field in forms Object */
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

        /** Checks if the user uploads any file */
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

          // Checks If the user has any supplier and assigned supplier to user
          if(req.body.supplier !== "")
          {
              forms.supplier = req.body.supplier;
          }

            let suppliers = await SupplierModel.find({company : req.user.company}).exec();
            
            let errors = validationResult(req);

            if(!errors.isEmpty())
            {
                res.render("users/register",{
                    errors : errors.array(),
                    form : forms,
                    suppliers : suppliers,
                    fileError : req.fileValidationError
                });
            }
            else if(typeof req.fileValidationError != undefined && req.fileValidationError != null)
            {
                res.render("users/register",{
                    errors : errors.array(),
                    form : forms,
                    suppliers : suppliers,
                    fileError : req.fileValidationError
                });
            }
        
        else
        {
            /** Stores the users data in User Object */
            let user = new UserModel();
            user.name = forms.name;
            user.email = forms.email;
            user.birth_date = forms.birth_date;
            user.blood_group = forms.blood;
            user.nid = forms.nid;
            user.passport = forms.passport;
            user.present_address = forms.present_address;
            user.permanent_address = forms.permanent_address;
            user.profile_photo = forms.profile_photo;
            user.passport_photo = forms.passport_photo;
            user.company = req.user.company;

            /** User Status */
            let userStatus = {
                type : "profile_created",
                display_name : "Profile Created",
                description : `${req.user.name} created profile of ${user.name}`,
            };

            user.events.push(userStatus);

            // Checks If the user has any supplier and assigned supplier to user
            if(req.body.supplier !== "")
            {
                user.supplier = forms.supplier;
            }

            let company = await CompanyInfoModel.findOne({company : req.user.company}); // Finds the last Inserted Id of the User
            let userCount = company.user + 1; 
            
            user.seq_id = "w_" + userCount; // Adds 1 in the User Sequence Number

            let userSave = await user.save(); // Saves the new User

            if(userSave)
            {
                let companyInfo = {};
                companyInfo.user = userCount;
                let query = {company: req.user.company};
                let companyInfoUpdate = await CompanyInfoModel.findOneAndUpdate(query,companyInfo); // Updates the Number of the User
                req.flash("success","New User has been created");
                res.redirect("/user");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/user");
            }
            
           
        }
    }
    catch(error)
    {
        console.log(error);
    }
        
    
});
/**
 * Represents User Edit Options.
 * 
 * @param {string} id - The Object Id of the User.
 *
 */

router.get("/edit/:id",auth,async(req,res) => {
    try
    {
       
          let query = {seq_id : req.params.id, company : req.user.company}; // Finds the User

          let user = await UserModel.findOne(query);

          let suppliers = await SupplierModel.find({company : req.user.company});
          
          if(user)
          {
            res.render("users/edit",{
                newUser : user,
                suppliers : suppliers
            });
        }
        else
        {
            req.flash("danger","No User Found");
            res.redirect("/user");
        }   
        
    }
    catch(error)
    {
        console.log(error);
    }   
 

});

/**
 * Receives User input data for updating the user
 * @param {string} id - The Object Id of the User.
*/

router.post("/update/:id",auth,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required"),
    check("email").isEmail().withMessage("Email must be valid"),
    check("birth_date").not().isEmpty().withMessage("Birth Date is required"),
    check("blood").not().isEmpty().withMessage("Blood Group is required"),
    check("nid").not().isEmpty().withMessage("National ID is required"),
    check("passport").not().isEmpty().withMessage("Passport Id is required"),
    check("present_address").not().isEmpty().withMessage("Present Addres is required"),
    check("permanent_address").not().isEmpty().withMessage("Permanent Address is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt(),
],async(req,res) => {

    try
    {
        /** Stores the forms data */
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

        let newUser = await UserModel.findOne(query);

        let errors = validationResult(req);
        forms.profile_photo = newUser.profile_photo;
        forms.passport_photo = newUser.passport_photo;

        /** Checks whether the user updates the picture */
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
                newUser : newUser,
                fileError : req.fileValidationError
            });
            
        }
        else
        {
            /** Removes the old files */
            if(newUser.profile_photo !== forms.profile_photo && newUser.profile_photo != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/user/"+newUser.profile_photo, (err) => {
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
            if(newUser.passport_photo !== forms.passport_photo && newUser.passport_photo != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/user/"+newUser.passport_photo, (err) => {
                    if(err)
                        {
                            console.log(err);
                        }
                    });
            }

            /** Saves the User Input Data */
            let user = {};
            user.name = forms.name;
            user.email = forms.email;
            user.birth_date = forms.birth_date;
            user.blood_group = forms.blood;
            user.nid = forms.nid;
            user.passport = forms.passport;
            user.present_address = forms.present_address;
            user.permanent_address = forms.permanent_address;
            user.profile_photo = newUser.profile_photo;
            user.passport_photo = newUser.passport_photo;
            user.profile_photo = forms.profile_photo;
            user.passport_photo = forms.passport_photo;
            user.company = req.user.company;
            user.updated_at = Date.now();

            // Checks If the user has any supplier and assigned supplier to user
            if(req.body.supplier !== "")
            {
                forms.supplier = req.body.supplier;
                user.supplier = forms.supplier;
            }
            

            let userUpdate = await UserModel.updateOne(query,user);
            if(userUpdate)
            {
                req.flash("success","User Details Updated");
                res.redirect("/user");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/user");
            }
          
        }
        
    }
    catch(error)
    {
        console.log(error);
    }
                    
});
               

/**
 * Represents User Delete options
 * @param {string} id - The Object Id of the User.
*/

router.delete("/delete/:id",auth,async(req,res) => {

    try
    {
        let query = {_id : req.params.id, company : req.user.company}; // Deletes the User

        let user = await UserModel.findOne(query);

        if(user)
        {
                /** Removes the old files */
            if(user.profile_photo != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/user/"+user.profile_photo, (err) => {
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
            if(user.passport_photo != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/user/"+user.passport_photo, (err) => {
                    if(err)
                        {
                            console.log(err);
                        }
                    });
            }

            let userDelete = await UserModel.deleteOne(query);

            if(userDelete)
            {
                req.flash("danger","User Deleted");
                res.redirect("/user");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/user");
            }  
        }
      
    }
    catch(error)
    {
        console.log(error);
    }

  
});

/**
 * Generates Users Sticker
 * @param {string} id - The Object Id of the User.
*/

router.get("/sticker/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id, company : req.user.company};

        let user = await UserModel.findOne(query).populate("supplier").populate("company").exec();

        res.render("users/sticker",{
            newUser : user
        });
    }
    catch(error)
    {
        console.log(error);
    }

}); 

/**
 * Generates Sticker PDF
 * @param {string} id - The Object Id of the User.
*/

router.get("/pdf/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id, company : req.user.company};

        let user = await UserModel.findOne(query).populate("supplier").populate("company").exec();

        let stickerPdf = require("../util/pdfmake");

        stickerPdf(res,user);
       
    }
    catch(error)
    {
        console.log(error);
    }

}); 

/**
 * Shows Timeline of the user
 * @param {string} id - The Object Id of the User.
*/

router.get("/timeline/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id};

        let user = await UserModel.findOne(query);
        res.render("users/timeline",{
            newUser : user,
            moment : moment
        });
    }
    catch(error)
    {
        console.log(error);
    }

}); 

/**
 * Shows Individual User
 * @param {string} id - The Object Id of the User.
*/

router.get("/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id, company : req.user.company};

        let user = await UserModel.findOne(query).populate("supplier").exec();
        res.render("users/view",{
            newUser : user
        });
    }
    catch(error)
    {
        console.log(error);
    }

}); 



module.exports = router;
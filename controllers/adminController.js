/** This is the Admin controller page. Admin CRUD Functions are here .*/

/** Required modules */
const express = require("express");

const path = require("path");
const router = express.Router();
const fs = require("fs");
const bcrypt = require("bcryptjs");
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const moment = require("moment");

/** Authetication Check File */
const auth = require("../config/auth");

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");

/** Company Info Model Schema */
let CompanyInfoModel = require("../models/companyInfoModel");

/** Created Events Module */
const createdEvents = require("../util/events");

const config = require("../config/s3");
/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region : "ap-south-1"
});

/** Initialize Multer storage Variable for file upload */

const s3 = new aws.S3();

/** S3 Get File */
const s3GetFile = require("../util/getS3File");

/** Implements File upload validation */
const upload = multer({
    storage : multerS3({
        s3 : s3,
        bucket : "hr-app-test",
        acl: 'public-read',
        expires : Date.now() + 100,
        ServerSideEncryption : "AES256",
        metadata: function (req, file, cb) {
          cb(null, {fieldName: file.fieldname + "-" + Date.now() + path.extname(file.originalname)});
        },
        key: function (req, file, cb) {
          adminPhoto = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
          cb(null,req.user.company + "/admins/" + adminPhoto)
        }
    }),
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
 * Shows All Admins Information
 * 
 */

router.get("/",auth,isSuperAdmin,async(req,res) => {
    try
    {
        
        let admins = await AdminModel.find({company : req.user.company, isSuperAdmin : false}).sort({created_at : -1}); // Find All Admins of the logged in admin's company 

        //If Admin found
        if(admins)
        {
            let newAdmins = admins.map(admin => {
                
                let url = s3GetFile(req,"/admins/",admin.profile_photo);
    
                admin["imageUrl"] = url;
    
                return admin;
            });
            res.render("admins/index",{
                admins : newAdmins
            });
        }
        
    }
    catch(err)
    {
        console.log(err);
    }
});

/** Shows Registration page for Admin Account Creation*/
router.get("/register",auth,isSuperAdmin,async(req,res) => {
    try
    {
        res.render("admins/register");
    }
    catch(error)    
    {
        console.log(error);
    }
});


/** Receives Admin input data for registration */
router.post("/register",auth,isSuperAdmin,[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid"),
    check("contact").not().isEmpty().withMessage("Contact is required").isNumeric().withMessage("Contact No. must be numeric"),
    check("address").not().isEmpty().withMessage("Address is required"),
    check("pass").not().isEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password must be 6 characters"),
    check("confirm_pass").custom((value,{req,loc,path}) => {
        if(value != req.body.pass)
        {
            throw new Error("Passwords don't match")
        }
        else
        {
            return typeof value == undefined ? "" : value;
        }
    }),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("contact").trim().unescape(),
    sanitizeBody("address").trim().unescape(),
    sanitizeBody("pass").trim().unescape(),
],async(req,res) => {
    try
    {
        /** Cheks Wheteher the email is already exist */
        let adminCheck = await AdminModel.findOne({email : req.body.email});

        if(adminCheck)
        {
            req.flash("danger","Email Already exists");
            res.statusCode = 302;
            res.redirect("/admin/register");
            return res.end();
        }

         /** Stores Admin Input Data  */
        let forms = {
            name : req.body.name,
            email : req.body.email,
            contact : req.body.contact,
            address : req.body.address,
            pass : req.body.pass,
            profile_photo : "dummy.jpeg",
        };

            
        let errors = validationResult(req);

        /** Shows Errors in view Page */
        if(!errors.isEmpty())
        {
            res.render("admins/register",{
                errors : errors.array(),
                form : forms,
            });
        }
        
        else
        {
            /** Stores Forms Input data in admin object */
            let admin = new AdminModel();
            admin.name = forms.name;
            admin.email = forms.email;
            admin.contact = forms.contact;
            admin.address = forms.address;
            admin.profile_photo = forms.profile_photo;
            admin.password = forms.pass;
            admin.company = req.user.company;

            /** Encrypted the Admin Password */

            let hashPwd = await bcrypt.hash(admin.password,10);    
            admin.password = hashPwd;

            let company = await CompanyInfoModel.findOne({company : req.user.company}); // Finds the last Inserted Id of the Admins
            let adminCount = company.admin + 1; 
            
            admin.seq_id = "a_"+ adminCount; // Adds 1 in the Admin Sequence Number

              /** Admin Status */
              let adminStatus = {
                type : "profile_created",
                display_name : "Profile Created",
                description : `${req.user.name} created profile of ${admin.name}`,
            };

            admin.events.push(adminStatus);
                

            let adminCreate = await admin.save(); // Creates New Admin

        
            if(adminCreate)
            {
                let companyInfo = {};
                companyInfo.admin = adminCount;
                let query = {company: req.user.company};
                let companyInfoUpdate = await CompanyInfoModel.findOneAndUpdate(query,companyInfo); // Updates the Number of Admins

                req.flash("success","New Admin account has been created");
                res.redirect("/admin");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/admin");
            }
        }
    }
    catch(error)
    {
        console.log(error);
    }       
    
});

/** Logged in Admin's Profile */

router.get("/profile",auth,async(req,res) => {
    try{

        let query = {_id : req.user._id}; // Admin Object Id 

        let adminInfo = await AdminModel.findOne(query); // Finds Admin 

        // If Admin exists
        if(adminInfo)
        {
            res.render("admins/profile",{
                adminInfo : adminInfo
            });
        }
        else
        {
            req.flash("danger","Not Found");
            res.redirect("/dashboard");
        }    
    }
    catch(error)
    {
        console.log(error);
    }

}); 


/** Represents Admin Profile Edit Options. */

router.get("/profile/edit",auth,async(req,res) => {
    try
    {    
        let query = {_id : req.user._id, company : req.user.company}; 

        let adminInfo = await AdminModel.findOne(query); // Finds Admin 

        // If Admin exists
        if(adminInfo)
        {

            res.render("admins/profile_edit",{
                adminInfo : adminInfo
            });
        }
        else
        {
            req.flash("danger","Not Found");
            res.redirect("/dashboard");
        }    
        
    }
    catch(error)
    {
        console.log(error);
    }   

});

/**
 * Represents Admin Edit Options.
 * 
 * @param {string} id - The Object Id of the Admin.
 *
 */

router.get("/edit/:id",auth,isSuperAdmin,async(req,res) => {
    try
    {    
        let query = {seq_id : req.params.id, company : req.user.company, isSuperAdmin : false}; // Admin Object Id, Company and Normal Admin

        let adminInfo = await AdminModel.findOne(query); // Finds Admin 

        // If Admin exists
        if(adminInfo)
        {
            
            res.render("admins/edit",{
                adminInfo : adminInfo
            });
        }
        else
        {
            req.flash("danger","Not Found");
            res.redirect("/dashboard");
        }    
        
    }
    catch(error)
    {
        console.log(error);
    }   

});

/**
 * Receives Admin input data for updating the admin profile
 * @param {string} id - The Object Id of the Admin.
*/

router.post("/profile/update",auth,upload.any(),[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid"),
    check("contact").not().isEmpty().withMessage("Contact No. is required").isNumeric().withMessage("Contact No. must be numeric"),
    check("address").not().isEmpty().withMessage("Address is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("contact").trim().unescape(),
    sanitizeBody("address").trim().unescape(),
],async(req,res) => {
       try
       {       
            let query = {_id : req.user._id, company : req.user.company}; 

            let adminInfo = await AdminModel.findOne(query); // Finds the Admin
            
            // If Admin exists
            if(adminInfo)
            {
                 /** Stores Admin input data in forms Object*/
                let forms = {
                    name : req.body.name,
                    email : req.body.email,
                    contact : req.body.contact,
                    address : req.body.address,
                };
                forms.profile_photo = adminInfo.profile_photo;

                /** Cheks Wheteher the email is already exist */
                let adminEmailCheck = await AdminModel.findOne({email : req.body.email});
                
                if(adminEmailCheck && adminEmailCheck.email != req.user.email)
                {
                    req.flash("danger","Email Already exists");
                    res.statusCode = 302;
                    res.redirect("/admin/profile");
                    return res.end();
                }
              
                let errors = validationResult(req); 
               
                
                /** If File exists, then update */
                if(typeof adminPhoto !== "undefined" && req.fileValidationError == null)
                {
                    forms.profile_photo = adminPhoto;
                }
            

                if(!errors.isEmpty())
                {
                
                    res.render("admins/profile_edit",{
                        errors : errors.array(),
                        adminInfo : adminInfo,
                        fileError : req.fileValidationError
                    });
                
                }
                else
                {
                    if(adminInfo.profile_photo !== forms.profile_photo && adminInfo.profile_photo !== "dummy.jpeg")
                    {
                        /** Removes the previous file */
                        let params = {
                            Bucket: "hr-app-test", 
                            Key: req.user.company + "/admins/" + adminInfo.profile_photo 
                           };
                        s3.deleteObject(params,(err,data) => {
                            if(err)
                            {
                                console.log(err);
                            }
                        });
                    }

                    /** Stores Forms data in newAdmin Object */
                    let newAdmin = {};
                    newAdmin.name = forms.name;
                    newAdmin.email = forms.email;
                    newAdmin.contact = forms.contact;
                    newAdmin.address = forms.address;
                    newAdmin.profile_photo = forms.profile_photo;
                    newAdmin.company = req.user.company;
                    newAdmin.updated_at = Date.now();

                    if(req.user.isSuperAdmin)
                    {
                        newAdmin.isSuperAdmin = true;
                    }

                    
                    let adminUpdate = await AdminModel.updateOne(query,newAdmin); // Update the Admin's Info
                    
                    if(adminUpdate)
                    {
                        req.flash("success","Admin Details Updated");
                        res.redirect("/admin/profile");
                    }
                    else
                    {
                        req.flash("danger","Something went wrong");
                        res.redirect("/admin/profile");
                    }
                }
            }
            else
            {
                req.flash("danger","Admin Not Found");
                res.redirect("/admin");
            }
       }
       catch(error)
       {
           console.log(error);
       }
                    
});

/**
 * Receives Admin input data for updating the admin
 * @param {string} id - The Object Id of the Admin.
*/

router.post("/update/:id",auth,isSuperAdmin,[
    check("name").not().isEmpty().withMessage("Name is required"),
    check("email").not().isEmpty().withMessage("Email is required").isEmail().withMessage("Email must be valid"),
    check("contact").not().isEmpty().withMessage("Contact is required").isNumeric().withMessage("Contact No. must be numeric"),
    check("address").not().isEmpty().withMessage("Address is required"),
    sanitizeBody("name").trim().unescape(),
    sanitizeBody("email").trim().unescape(),
    sanitizeBody("contact").trim().unescape(),
    sanitizeBody("address").trim().unescape(),
    sanitizeBody("pass").trim().unescape(),
],async(req,res) => {
       try
       {        
            let query = {_id : req.params.id, company : req.user.company}; 

            let adminInfo = await AdminModel.findOne(query); // Finds the Admin
            
            // If Admin exists
            if(adminInfo)
            {
                 /** Stores Admin input data in forms Object*/
                 let forms = {
                    name : req.body.name,
                    email : req.body.email,
                    contact : req.body.contact,
                    address : req.body.address,
                };
                forms.profile_photo = adminInfo.profile_photo;

                /** Cheks Wheteher the email is already exist */
                let adminEmailCheck = await AdminModel.findOne({email : req.body.email});
                
                if(adminEmailCheck && adminEmailCheck.email != adminInfo.email)
                {
                    req.flash("danger","Email Already exists");
                    res.statusCode = 302;
                    res.redirect("/admin");
                    return res.end();
                }

                let errors = validationResult(req); 
               
                
                if(!errors.isEmpty())
                {
                
                    res.render("admins/edit",{
                        errors : errors.array(),
                        adminInfo : adminInfo,
                        fileError : req.fileValidationError
                    });
                
                }
                else
                {

                    /** Stores Forms data in newAdmin Object */
                    let newAdmin = {};
                    newAdmin.name = forms.name;
                    newAdmin.email = forms.email;
                    newAdmin.contact = forms.contact;
                    newAdmin.address = forms.address;
                    newAdmin.profile_photo = forms.profile_photo;
                    newAdmin.company = req.user.company;
                    newAdmin.updated_at = Date.now();

                    await createdEvents(req,newAdmin,req.params.id,"admin");
                    let adminUpdate = await AdminModel.updateOne(query,newAdmin); // Update the Admin's Info
                    
                    if(adminUpdate)
                    {
                        req.flash("success","Admin Details Updated");
                        res.redirect("/admin");
                    }
                    else
                    {
                        req.flash("danger","Something went wrong");
                        res.redirect("/admin");
                    }
                }
            }
            else
            {
                req.flash("danger","Admin Not Found");
                res.redirect("/admin");
            }
       }
       catch(error)
       {
           console.log(error);
       }
                    
});



/**
 * Represents Admin Delete option
 * @param {string} id - The Object Id of the Admin.
*/

router.delete("/delete/:id",auth,isSuperAdmin,async(req,res) => {

    try
    {
        let query = {_id : req.params.id, company : req.user.company};

        let adminDelete = await AdminModel.deleteOne(query); // Deletes the Admin
    
        if(adminDelete)
        {
            req.flash("danger","Admin Deleted");
            res.redirect("/admin");
        }
        
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/admin");
        }
    }
    catch(error)
    {
        console.log(error);
    }
});

/**
 * Shows Timeline of the Admin
 * @param {string} id - The Object Id of the Admin.
*/

router.get("/timeline/:id",auth,async(req,res) => {
    try{
        let query = {seq_id : req.params.id};

        let admin = await AdminModel.findOne(query);
        res.render("admins/timeline",{
            newAdmin : admin,
            moment : moment
        });
    }
    catch(error)
    {
        console.log(error);
    }

}); 
    
  

/**
 * Shows Individual Admin
 * @param {string} id - The Object Id of the Admin.
*/

router.get("/:id",auth,isSuperAdmin,async(req,res) => {
    try{

        let query = {seq_id : req.params.id, company : req.user.company, isSuperAdmin : false}; // Admin Object Id, Company and Normal Admin

        let adminInfo = await AdminModel.findOne(query); // Finds Admin 

        // If Admin exists
        if(adminInfo)
        {
            let url = s3GetFile(req,"/admins/",adminInfo.profile_photo); 

            res.render("admins/view",{
                adminInfo : adminInfo,
                imageUrl : url
            });
        }
        else
        {
            req.flash("danger","Not Found");
            res.redirect("/dashboard");
        }    
    }
    catch(error)
    {
        console.log(error);
    }

}); 

/** Cheks Whether the logged in admin is Super Admin */
function isSuperAdmin(req,res,next)
{
    if(req.user.isSuperAdmin)
    {
        next(); // If the Admin is SuperAdmin, then proceed
    }
    else
    {
        req.flash("danger","Unauthorized Access");
        res.redirect("/dashboard");
    }
}

module.exports = router;
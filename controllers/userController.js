const express = require("express");
const path = require("path");
const router = express.Router();
const bcrypt = require("bcryptjs");
const fs = require("fs");

const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");
const multer = require("multer");

let UserModel = require("../models/userModel");

const storage = multer.diskStorage({
    destination : "./public/uploads",
    filename : function(req,file,cb)
    {
        cb(null,file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage : storage,
    fileFilter : function(req,file,cb){
        checkFileType(req,file,cb)
    }
});

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

router.get("/",ensureAuthenticated,function(req,res){
    UserModel.find({},function(err,users){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("users/index",{
                users : users
            });
        }
    });
});



router.get("/edit/:id",ensureAuthenticated,function(req,res){
  if(req.user.isAdmin)
  {
    let query = {_id : req.params.id};

    UserModel.findOne(query,function(err,user){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("users/edit",{
                newUser : user
            });
        }
    });
  }
  else
  {
      req.flash("danger","Unauthorize Access");
      res.redirect("/user");
  }

});

router.post("/update/:id",upload.any(),[
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
    sanitizeBody("password").trim().unescape(),
    sanitizeBody("birth_date").trim().unescape(),
    sanitizeBody("blood").trim().unescape(),
    sanitizeBody("passport").trim().unescape(),
    sanitizeBody("present_address").trim().unescape(),
    sanitizeBody("permanent_address").trim().unescape(),
    sanitizeBody("nid").trim().toInt(),
],function(req,res){
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


       
        let query = {_id : req.params.id};

        UserModel.findOne(query,function(err,newUser){
            let errors = validationResult(req);
            forms.profile_photo = newUser.profile_photo;
            forms.passport_photo = newUser.passport_photo;

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
                if(newUser.profile_photo !== forms.profile_photo)
                {
                    fs.unlink("./public/uploads/"+newUser.profile_photo, function(err){
                         if(err)
                         {
                             console.log(err);
                         }
                     });
                }
                if(newUser.passport_photo !== forms.passport_photo)
                {
                    fs.unlink("./public/uploads/"+newUser.passport_photo, function(err){
                        if(err)
                         {
                             console.log(err);
                         }
                     });
                }

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
                user.password = newUser.password;
                user.profile_photo = forms.profile_photo;
                user.passport_photo = forms.passport_photo;

              
  
                UserModel.updateOne(query,user,function(err){
                    if(err)
                    {
                        console.log(err);
                    }
                    else
                    {
                        req.flash("success","User Details Updated");
                        res.redirect("/user");
                    }
                });
            }
        });
                    
});
               
          

router.delete("/delete/:id",ensureAuthenticated,function(req,res){
    if(req.user.isAdmin)
    {
        let query = {_id : req.params.id};

        UserModel.deleteOne(query,function(err){
            req.flash("danger","User Deleted");
            res.redirect("/user");
        });
    }
    else
    {
        req.flash("danger","Unauthorize Access");
        res.redirect("/user");
    }
  
});

router.get("/:id",ensureAuthenticated,function(req,res){
    let query = {_id : req.params.id};

    UserModel.findOne(query,function(err,user){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("users/view",{
                newUser : user
            });
        }
    });
});  

function ensureAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }
}

module.exports = router;
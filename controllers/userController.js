/** This is the User controller page. User CRUD Functions are here .*/

/** Required modules */
const fs = require("fs");
var moment = require('moment-timezone');

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");

/** Created Events Module */
const createdEvents = require("../util/events");

/** User Model Schema */
let UserModel = require("../models/userModel");
/** Supplier Model Schema */
let SupplierModel = require("../models/supplierModel");
/** Group Model Schema */
let GroupModel = require("../models/groupModel");

/** Company Info Model Schema */
let CompanyInfoModel = require("../models/companyInfoModel");



/**
 * Shows All users
 * 
 */

exports.getAllUsers= async(req,res) => {
    try 
    {
        let users = await UserModel.find({company : req.user.company}).populate("supplier").populate("group"); // Finds the Users of the Logged in Admin's Company
        
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
   

};

/** Shows Registration page */
exports.getRegistration = async(req,res) => {
    try
    {
    
        let suppliers = await SupplierModel.find({company : req.user.company}).exec(); // Selects All the Suppliers
        let groups = await GroupModel.find({company : req.user.company}).exec(); // Selects All the Groups
        let companyInfo = await CompanyInfoModel.findOne({company : req.user.company});

        res.render("users/register",{
            suppliers : suppliers,
            companyInfo : companyInfo,
            groups : groups
        });
       
    }
    catch(error)    
    {
        console.log(error);
    }
};

/** Receives user input data for registration */
exports.postRegistration  = async(req,res) => {
    try
    {
        /** Stores The Users Input Field in forms Object */
        let forms = {
            code : req.body.code,
            name : req.body.name,
            father : req.body.father,
            mother : req.body.mother,
            contact : req.body.contact,
            blood : req.body.blood,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            birth_date : req.body.birth_date,
            national : req.body.national,
            gender : req.body.gender,
            religion : req.body.religion,
            maritial : req.body.maritial,
            nid : req.body.nid,
            passport : req.body.passport,
            issue : req.body.issue,
            expiry : req.body.expiry,
            group : req.body.group,
            supplier : req.body.supplier,
            experience : req.body.experience
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

            let suppliers = await SupplierModel.find({company : req.user.company}).exec();
            let groups = await GroupModel.find({company : req.user.company}).exec(); // Selects All the Groups
            let companyInfo = await CompanyInfoModel.findOne({company : req.user.company});
            
            let errors = validationResult(req);

            if(!errors.isEmpty())
            {
                res.render("users/register",{
                    errors : errors.array(),
                    form : forms,
                    suppliers : suppliers,
                    fileError : req.fileValidationError,
                    groups : groups,
                    companyInfo : companyInfo
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
            await saveNewUser(req,res,forms,suppliers,groups,companyInfo);
        }
    }
    catch(error)
    {
        console.log(error);
    }
        
    
};
/**
 * Represents User Edit Options.
 * 
 * @param {string} id - The Object Id of the User.
 *
 */

exports.editUser = async(req,res) => {
    try
    {
       
          let query = {seq_id : req.params.id, company : req.user.company}; // Finds the User

          let user = await UserModel.findOne(query);

          let suppliers = await SupplierModel.find({company : req.user.company});
          let groups = await GroupModel.find({company : req.user.company});
          
          if(user)
          {
            res.render("users/edit",{
                newUser : user,
                suppliers : suppliers,
                groups : groups,
                moment : moment
            });
        }
        else
        {
            req.flash("danger","No Pax Found");
            res.redirect("/pax");
        }   
        
    }
    catch(error)
    {
        console.log(error);
    }   
 

};

/**
 * Receives User input data for updating the user
 * @param {string} id - The Object Id of the User.
*/

exports.updateUser = async(req,res) => {

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
            await createdEvents(req,user,req.params.id,"user");
            let userUpdate = await UserModel.updateOne(query,user);
            if(userUpdate)
            {
                req.flash("success","PAX Details Updated");
                res.redirect("/pax");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/pax");
            }
          
        }
        
    }
    catch(error)
    {
        console.log(error);
    }
                    
};
               

/**
 * Represents User Delete options
 * @param {string} id - The Object Id of the User.
*/

exports.deleteUser = async(req,res) => {

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
            if(user.experience_image)
            {
                fs.unlink("./public/uploads/user/"+user.experience_image, (err) => {
                    if(err)
                        {
                            console.log(err);
                        }
                    });
            }

            let userDelete = await UserModel.deleteOne(query);

            if(userDelete)
            {
                req.flash("danger","PAX Deleted");
                res.redirect("/pax");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/pax");
            }  
        }
      
    }
    catch(error)
    {
        console.log(error);
    }

  
};

/**
 * Generates Users Sticker
 * @param {string} id - The Object Id of the User.
*/

exports.getUsersSticker = async(req,res) => {
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

}; 

/**
 * Generates Sticker PDF
 * @param {string} id - The Object Id of the User.
*/

exports.downloadUsersSticker = async(req,res) => {
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

}; 

/**
 * Shows Timeline of the user
 * @param {string} id - The Object Id of the User.
*/

exports.usersTimeline = async(req,res) => {
    try{
        let query = {seq_id : req.params.id};

        let user = await UserModel.findOne(query);
        res.render("users/timeline",{
            events : user.events.reverse(),
            moment : moment
        });
    }
    catch(error)
    {
        console.log(error);
    }

}; 

/**
 * Shows Individual User
 * @param {string} id - The Object Id of the User.
*/

exports.getUser = async(req,res) => {
    try{
        let query = {seq_id : req.params.id, company : req.user.company};

        let user = await UserModel.findOne(query).populate("supplier").populate("group").exec();
        res.render("users/view",{
            newUser : user
        });
    }
    catch(error)
    {
        console.log(error);
    }

}; 


/** Saves New User from User Form Data */
const saveNewUser = async(req,res,forms,suppliers,groups,companyInfo) => {
     /** Stores the users data in User Object */
     let user = new UserModel();
     user.code = forms.code;
     user.name = forms.name;
     user.father = forms.father;
     user.mother = forms.mother;
     user.contact = forms.contact;
     user.birth_date = forms.birth_date;
     user.blood_group = forms.blood;
     user.nid = forms.nid;
     user.passport = forms.passport;
     user.issue = forms.issue;
     user.expiry = forms.expiry;
     user.present_address = forms.present_address;
     user.permanent_address = forms.permanent_address;
     user.national = forms.national;
     user.gender = forms.gender;
     user.religion = forms.religion;
     user.maritial = forms.maritial;
     user.group = forms.group;
     user.supplier = forms.supplier;
     user.company = req.user.company;
     user.created_at = Date.now();
    /** Checks if both the images are exists */
    if(forms.profile_photo && forms.passport_photo)
    {
        user.profile_photo = forms.profile_photo;
        user.passport_photo = forms.passport_photo;
        /** If the user has any experience */
        if(req.body.experience == 1)
        {
            forms.experience_year = req.body.year;
            forms.experience_month = req.body.month;
            forms.experience_day = req.body.day;
           
            /** Checks if the user uploads any experience file */
            
            if(typeof req.files[2] !== "undefined" && req.files[2].fieldname == "experience_image" && req.fileValidationError == null)
            {
                forms.experience_image = req.files[2].filename;
            }
            else
            {
                return res.render("users/register",{
                    form : forms,
                    suppliers : suppliers,
                    fileError : "Experience Image is required",
                    groups : groups,
                    companyInfo : companyInfo
                });
            }
            user.experience_image = forms.experience_image;
            user.experience_year = forms.experience_year;
            user.experience_month = forms.experience_month;
            user.experience_day = forms.experience_day;
        }

         /** User Status */
         let userStatus = {
             type : "profile_created",
             display_name : "Profile Created",
             description : `${req.user.name} created profile of ${user.name}`,
         };

         user.events.push(userStatus);

         let company = await CompanyInfoModel.findOne({company : req.user.company}); // Finds the last Inserted Id of the User
         let userCount = forms.code; 
         
         user.seq_id = "w_" + userCount; // Adds 1 in the User Sequence Number


         let userSave = await user.save(); // Saves the new User

         if(userSave)
         {
             let companyInfo = {};
             companyInfo.user = userCount;
             let query = {company: req.user.company};
             let companyInfoUpdate = await CompanyInfoModel.findOneAndUpdate(query,companyInfo); // Updates the Number of the User
             req.flash("success","New PAX has been created");
             res.redirect("/pax");
         }
         else
         {
             req.flash("danger","Something went wrong");
             res.redirect("/pax");
         }
    }
    else
    {
        res.render("users/register",{
            form : forms,
            suppliers : suppliers,
            fileError : "Both Images are required",
            groups : groups,
            companyInfo : companyInfo
        });
    }
}
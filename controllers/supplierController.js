/** This is the Suuplier controller page. Supplier CRUD functions are here. */

/** Required modules */
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const {check,validationResult} = require("express-validator/check");


/** Created Events Module */
const createdEvents = require("../util/events");

/** Supplier Model Schema */
const SupplierModel = require("../models/supplierModel");

/** Company Info Model Schema */
let CompanyInfoModel = require("../models/companyInfoModel");

/** Delete S3 Object File */
const s3DeleteFile = require("../util/deleteS3File");

/** Renders All Suppliers */
exports.getAllSuppliers = async(req,res) => {
    try 
    {
        let suppliers = await SupplierModel.find({company : req.user.company});

        res.render("supplier/index",{
            suppliers : suppliers.reverse(),
            moment : moment,
        });
    }
    catch(err)
    {
        console.log(err);
    }    

};

/** Shows Supplier Registration Page */

exports.getSupplierRegistration = async(req,res) => {
    let companyInfo = await CompanyInfoModel.findOne({company : req.user.company});
    try 
    {
        res.render("supplier/register",{
            companyInfo : companyInfo
        });
    }
    catch(err)
    {
        console.log(err);
    }    

};

/** Receives Supplier input data for registration */
exports.postSupplierRegistration = async(req,res) => {
    try {
        let forms = {
            code : req.body.code,
            name : req.body.name,
            nid : req.body.nid,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            contact : req.body.contact,
            introducer_name : req.body.introducer_name,
            introducer_number : req.body.introducer_number
        };

        let companyInfo = await CompanyInfoModel.findOne({company : req.user.company});

        /** Checks if the Supplier uploads any file */
        if(typeof supplierProfilePhoto !== "undefined" && req.fileValidationError == null)
        {
                forms.profile_photo = supplierProfilePhoto;
        }
        
        if(typeof supplierPassportPhoto !== "undefined" && req.fileValidationError == null)
        {
            forms.passport_photo = supplierPassportPhoto;
        }

        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("supplier/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError,
                companyInfo : companyInfo
            });
        }
        else if(typeof req.fileValidationError != undefined && req.fileValidationError != null)
        {
            res.render("supplier/register",{
                errors : errors.array(),
                form : forms,
                fileError : req.fileValidationError,
                companyInfo : companyInfo
            });
        }
        else
        {
           await supplierSave(req,res,forms);
        }
        
    } 
    catch (error) {
        console.log(error);
    }
        
    
};

/**
 * Represents Supplier Edit Options.
 * 
 * @param {string} id - The Object Id of the Supplier.
 *
 */

exports.editSupplier = async(req,res) => {
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
 

};

/**
 * Receives Supplier input data for updating the supplier
 * @param {string} id - The Object Id of the Supplier.
*/

exports.updateSupplier = async(req,res) => {

    try{
        let forms = {
            code : req.body.code,
            name : req.body.name,
            nid : req.body.nid,
            present_address : req.body.present_address,
            permanent_address : req.body.permanent_address,
            contact : req.body.contact,
            introducer_name : req.body.introducer_name,
            introducer_number : req.body.introducer_number
        };

       
            let query = {_id : req.params.id, company : req.user.company};

            let newSupplier = await SupplierModel.findOne(query);

            if(newSupplier)
            {
                let errors = validationResult(req);
                forms.profile_photo = newSupplier.profile_photo;
                forms.passport_photo = newSupplier.passport_photo;
    
                if(typeof supplierProfilePhoto !== "undefined" && req.fileValidationError == null)
                {
                        forms.profile_photo = supplierProfilePhoto;
                }
                
                if(typeof supplierPassportPhoto !== "undefined" && req.fileValidationError == null)
                {
                    forms.passport_photo = supplierPassportPhoto;
                }
    
                if(!errors.isEmpty())
                {
                   
                    res.render("supplier/edit",{
                        errors : errors.array(),
                        supplier : newSupplier,
                        fileError : req.fileValidationError
                    });
                  
                }
                else
                {
                    if(newSupplier.profile_photo !== forms.profile_photo && newSupplier.profile_photo != "dummy.jpeg")
                    {
                        s3DeleteFile(req,"/suppliers/",newSupplier.profile_photo);
                    }
                    if(newSupplier.passport_photo !== forms.passport_photo && newSupplier.passport_photo != "dummy.jpeg")
                    {
                        s3DeleteFile(req,"/suppliers/",newSupplier.passport_photo);
                    }
    
                    let supplier = {};
                    supplier.name = forms.name;
                    supplier.nid = forms.nid;
                    supplier.present_address = forms.present_address;
                    supplier.permanent_address = forms.permanent_address;
                    supplier.contact = forms.contact;
                    supplier.introducer_name = forms.introducer_name;
                    supplier.introducer_number = forms.introducer_number;
                    supplier.profile_photo = forms.profile_photo;
                    supplier.passport_photo = forms.passport_photo;              
                    supplier.company = req.user.company;
                    supplier.updated_at = Date.now();
                    
                    await createdEvents(req,supplier,req.params.id,"supplier");
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

};

/**
 * Represents Supplier Delete options
 * @param {string} id - The Object Id of the Supplier.
*/

exports.deleteSupplier = async(req,res) => {
    try
    {
        let query = {_id : req.params.id, company : req.user.company}; // Deletes the Supplier

        let supplier = await SupplierModel.findOne(query);

        if(supplier)
        {
                /** Removes the old files */
            if(supplier.profile_photo != "dummy.jpeg")
            {
                s3DeleteFile(req,"/suppliers/",supplier.profile_photo);
            }
            if(supplier.passport_photo != "dummy.jpeg")
            {
                s3DeleteFile(req,"/suppliers/",supplier.passport_photo);
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
  
};

/**
 * Shows Timeline of the supplier
 * @param {string} id - The Object Id of the Supplier.
*/

exports.suppliersTimeline = async(req,res) => {
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

}; 


/**
 * Shows Individual Supplier
 * @param {string} id - The Object Id of the Supplier.
*/

exports.getSupplier = async(req,res) => {
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

}; 

/** Saves New Supplier */
const supplierSave = async(req,res,forms) => {

    if(forms.profile_photo && forms.passport_photo)
    {

        /** Stores Forms data in supplier object */
        let supplier = new SupplierModel();
        supplier.code = forms.code;
        supplier.name = forms.name;
        supplier.nid = forms.nid;
        supplier.present_address = forms.present_address;
        supplier.permanent_address = forms.permanent_address;
        supplier.contact = forms.contact;
        supplier.introducer_name = forms.introducer_name;
        supplier.introducer_number = forms.introducer_number;
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
        let supplierCount = forms.code; 
        
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
    else
    {
        res.render("supplier/register",{
            form : forms,
            fileError : "Both Images are required",
        });
    }
}


/**
 * Generates Suppliers Sticker
 * @param {string} id - The Object Id of the Supplier.
*/

exports.getSuppliersSticker = async(req,res) => {
    try{
        let query = {seq_id : req.params.id, company : req.user.company};

        let supplier = await SupplierModel.findOne(query);

        res.render("supplier/sticker",{
            newSupplier : supplier
        });
    }
    catch(error)
    {
        console.log(error);
    }

}; 

/**
 * Generates Sticker PDF
 * @param {string} id - The Object Id of the Supplier.
*/

exports.downloadSuppliersSticker = async(req,res) => {
    try{
        let query = {seq_id : req.params.id, company : req.user.company};

        let supplier = await SupplierModel.findOne(query);

        let stickerPdf = require("../util/supplierPdf");

        stickerPdf(res,supplier);
       
    }
    catch(error)
    {
        console.log(error);
    }

}; 


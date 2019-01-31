/** Group Model */

const GroupModel = require("../models/groupModel");

/** Supplier Model */
const CompanyInfoModel = require("../models/companyInfoModel");

/** Zone Model */
const ZoneModel = require("../models/zoneModel");

const moment = require("moment-timezone");
const fs = require("fs");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Gets All groups */
exports.getAllGroups = async(req,res) => {
    try 
    {
        let groups = await GroupModel.find({company : req.user.company}).populate("zone"); 

        if(groups)
        {
            res.render("group/index",{
                groups : groups.reverse(),
                moment : moment
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
};

/** Gets Registration page for group */
exports.getGroupRegistration = async(req,res) => {
    try
    {
        let group = await CompanyInfoModel.findOne({company : req.user.company});
        let zone = await ZoneModel.find({company : req.user.company});

        res.render("group/register",{
            zone : zone,
            group : group
        });
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Saves group */

exports.postGroupRegistration = async(req,res) => {
    try
    {   
        let forms  = {
            group_seq : req.body.group_seq,
            group_sl : req.body.group_sl,
            id : req.body.id,
            supplier : req.body.supplier,
            visa : req.body.visa,
            zone : req.body.zone,
            amount : req.body.amount,
            occupation : req.body.occupation
        };
       /** Checks whetere any file is uploaded */
       if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
       {
           if(req.files[0].fieldname == "enjazit_image")
               forms.enjazit_image = req.files[0].filename;
       }
        let errors = validationResult(req);
        let group_sl = await CompanyInfoModel.findOne({company : req.user.company});

        if(!errors.isEmpty())
        {
            res.render("group/register",{
                errors : errors.array(),
                form : forms,
                group : group_sl,
                fileError : req.fileValidationError
            });
        }
        else
        {
           await groupSave(req,res,forms);
        }
    }
    catch(err)
    {
        console.log(err);
    }
}


/** Edits group Info */

exports.editGroup = async(req,res) => {
    try
    {
        let id = req.params.id;
        let group = await GroupModel.findOne({_id : id, company : req.user.company}).populate("zone");

        if(group)
        {
            res.render("group/edit",{
                group : group
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Updates group */
exports.updateGroup = async(req,res) => {
    try
    {
        let forms = {
            group_sl : req.body.group_sl,
            id : req.body.id,
            visa_number : req.body.visa_number,
            visa_supplier : req.body.visa_supplier,
            visa_id : req.body.visa_id,
            zone : req.body.zone,
            amount : req.body.amount,
            occupation : req.body.occupation
        };

        let errors = validationResult(req);
        let group = await GroupModel.findOne({_id : req.params.id, company : req.user.company}).populate("zone");

        
        if(group)
        {
            forms.enjazit_image = group.enjazit_image;
            
            /** Checks whetere any file is uploaded */
            if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
            {
                if(req.files[0].fieldname == "enjazit_image")
                    forms.enjazit_image = req.files[0].filename;
            }
            if(!errors.isEmpty())
            {
                res.render("group/edit",{
                    errors : errors.array(),
                    form : forms,
                    group : group,
                    fileError : req.fileValidationError
                });
            }
            else
            {
                if(group.enjazit_image !== forms.enjazit_image)
                {
                    fs.unlink("./public/uploads/enjazit/"+group.enjazit_image, (err) => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                }
                await groupUpdate(req,res,forms,group);
            }
        }
        else
        {
            req.flash("danger","Group Not Found");
            res.redirect("/group");
        }
       
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Deletes group */
exports.deleteGroup = async(req,res) => {
    try
    {   
        let query = {_id : req.params.id, company : req.user.company}; // Deletes the group

        let group = await GroupModel.findOne(query);

        if(group)
        {
                /** Removes the old files */
            if(group.enjazit_image != "dummy.jpeg")
            {
                fs.unlink("./public/uploads/enjazit/"+group.enjazit_image, (err) => {
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }

            let groupDelete = await GroupModel.deleteOne(query);

            if(groupDelete)
            {
                req.flash("danger","Group Deleted");
                res.redirect("/group");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/group");
            }  
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Get group's Info */

exports.getGroup = async(req,res) => {
    try
    {
        let id = req.params.id;

        let group = await GroupModel.findOne({_id : id, company : req.user.company}).populate("zone");

        if(group)
        {
            res.render("group/view",{
                group : group
            });
        }
        else
        {
            req.flash("danger","group Not found");
            res.redirect("/group/");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

const groupSave = async(req,res,forms) =>
{
    if(forms.enjazit_image)
    {
        /** Saves forms data in group object */
        let group = new GroupModel();
        group.group_seq =  forms.group_seq;
        group.group_sl = forms.group_sl;
        group.visa_number = forms.visa;
        group.visa_supplier = forms.supplier;
        group.visa_id = forms.id;
        group.amount = forms.amount;
        group.company = req.user.company;
        group.occupation = forms.occupation;
        group.enjazit_image = forms.enjazit_image;
    
        let zone = await ZoneModel.findOne({company : req.user.company, name : forms.zone}); // Finds Zone

        /** If Zones found, then set previous zone to group */
        if(zone)
        {
            group.zone = zone._id;
        }
        /** New Zone Created */
        else
        {
            let newZone = new ZoneModel();
            newZone.name = forms.zone;
            newZone.country = "--";
            newZone.company = req.user.company;
            let newZoneSave = await newZone.save();
            group.zone = newZoneSave._id;
        }

        let companyInfo = {};
        companyInfo.group = forms.group_seq;
        await CompanyInfoModel.update({company : req.user.company}, companyInfo);

        let groupSave = await group.save(); // Saves group data

        if(groupSave)
        {
            req.flash("success","Group created successfully");
            res.redirect("/group");
        }
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/group");
        }
    }
    else
    {
        let group = await CompanyInfoModel.findOne({company : req.user.company});
       res.render("group/register",{
           form : forms,
           fileError : "Enjazit Image is required",
           group : group
       });
    }    
}

const groupUpdate = async(req,res,forms) =>
{
        /** Saves forms data in group object */
        let group = {};
        group.group_sl = forms.group_sl;
        group.visa_number = forms.visa_number;
        group.visa_supplier = forms.visa_supplier;
        group.visa_id = forms.visa_id;
        group.amount = forms.amount;
        group.company = req.user.company;
        group.occupation = forms.occupation;
        group.enjazit_image = forms.enjazit_image;
    
        let zone = await ZoneModel.findOne({company : req.user.company, name : forms.zone}); // Finds Zone

        /** If Zones found, then set previous zone to group */
        if(zone)
        {
            group.zone = zone._id;
        }
        /** New Zone Created */
        else
        {
            let newZone = new ZoneModel();
            newZone.name = forms.zone;
            newZone.country = "--";
            newZone.company = req.user.company;
            let newZoneSave = await newZone.save();
            group.zone = newZoneSave._id;
        }

        let groupUpdate = await GroupModel.updateOne({_id : req.params.id, company : req.user.company},group); // Updates group data

        if(groupUpdate)
        {
            req.flash("success","Group updated successfully");
            res.redirect("/group");
        }
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/group");
        }
}
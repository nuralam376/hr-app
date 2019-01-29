/** Group Model */

const GroupModel = require("../models/groupModel");

/** Supplier Model */
const SupplierModel = require("../models/supplierModel");

/** Zone Model */
const ZoneModel = require("../models/zoneModel");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Gets All groups */
exports.getAllGroups = async(req,res) => {
    try 
    {
        let groups = await GroupModel.find({company : req.user.company}); 

        if(groups)
        {
            res.render("group/index",{
                groups : groups
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
        let group = await GroupModel.findOne({company : req.user.company});
        let suppliers = await SupplierModel.find({company : req.user.company});
        let zone = await ZoneModel.find({company : req.user.company});

        if(group)
        {
            group_seq = group.group_seq + 1;
        }
        else
        {
            group_seq = 328;
        }    

        res.render("group/register",{
            group : group_seq,
            suppliers : suppliers,
            zone : zone
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
            name : req.body.name,
            country : req.body.country,
        };

        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("group/register",{
                errors : errors.array(),
                form : forms
            });
        }
        else
        {
            /** Saves forms data in group object */
            let group = new GroupModel();
            group.name = forms.name;
            group.country = forms.country;
            group.company = req.user.company;

            let groupSave = await group.save(); // Saves group data

            if(groupSave)
            {
                req.flash("success","group created successfully");
                res.redirect("/group");
            }
            else
            {
                req.flash("danger","Something went wrong");
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

        let group = await GroupModel.findOne({_id : id, company : req.user.company});

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

/** Edits group Info */

exports.editGroup = async(req,res) => {
    try
    {
        let id = req.params.id;
        let group = await GroupModel.findOne({_id : id, company : req.user.company});

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
            name : req.body.name,
            country : req.body.country
        };

        let errors = validationResult(req);
        let group = await GroupModel.findOne({_id : req.params.id, company : req.user.company});

        if(!errors.isEmpty())
        {
            res.render("group/edit",{
                errors : errors.array(),
                form : forms,
                group : group
            });
        }
        else
        {
            let newgroup = {};
            newgroup.name = forms.name;
            newgroup.country = forms.country;
            
            let groupUpdate = await GroupModel.findOneAndUpdate({_id : req.params.id,company : req.user.company},newgroup);

            if(groupUpdate)
            {
                req.flash("success","group Updated Successfully");
                res.redirect("/group");
            }
            else
            {
                req.flash("error","group Deleted Successfully");
                res.redirect("/group");
            }
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
        let groupDelete = await GroupModel.deleteOne({_id : req.params.id,company : req.user.company});

        if(groupDelete)
        {
            req.flash("success","group Deleted Successfully");
            res.redirect("/group");
        }
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/group");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
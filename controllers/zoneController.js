/** Zone Model */

const ZoneModel = require("../models/zoneModel");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Gets All Zones */
exports.getAllZones = async(req,res) => {
    try 
    {
        let zones = await ZoneModel.find({company : req.user.company}); 

        if(zones)
        {
            res.render("zone/index",{
                zones : zones
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
};

/** Gets Registration page for Zone */
exports.getZoneRegistration = async(req,res) => {
    try
    {
        res.render("zone/register");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Saves Zone */

exports.postZoneRegistration = async(req,res) => {
    try
    {
        let forms  = {
            name : req.body.name,
            country : req.body.country,
        };

        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("zone/register",{
                errors : errors.array(),
                form : forms
            });
        }
        else
        {
            /** Saves forms data in zone object */
            let zone = new ZoneModel();
            zone.name = forms.name;
            zone.country = forms.country;
            zone.company = req.user.company;

            let zoneSave = await zone.save(); // Saves zone data

            if(zoneSave)
            {
                req.flash("success","Zone created successfully");
                res.redirect("/zone");
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/zone");
            }
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Get Zone's Info */

exports.getZone = async(req,res) => {
    try
    {
        let id = req.params.id;

        let zone = await ZoneModel.findOne({_id : id, company : req.user.company});

        if(zone)
        {
            res.render("zone/view",{
                zone : zone
            });
        }
        else
        {
            req.flash("danger","Zone Not found");
            res.redirect("/zone/");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Edits Zone Info */

exports.editZone = async(req,res) => {
    try
    {
        let id = req.params.id;
        let zone = await ZoneModel.findOne({_id : id, company : req.user.company});

        if(zone)
        {
            res.render("zone/edit",{
                zone : zone
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Updates Zone */
exports.updateZone = async(req,res) => {
    try
    {
        let forms = {
            name : req.body.name,
            country : req.body.country
        };

        let errors = validationResult(req);
        let zone = await ZoneModel.findOne({_id : req.params.id, company : req.user.company});

        if(!errors.isEmpty())
        {
            res.render("zone/edit",{
                errors : errors.array(),
                form : forms,
                zone : zone
            });
        }
        else
        {
            let newZone = {};
            newZone.name = forms.name;
            newZone.country = forms.country;
            
            let zoneUpdate = await ZoneModel.findOneAndUpdate({_id : req.params.id,company : req.user.company},newZone);

            if(zoneUpdate)
            {
                req.flash("success","Zone Updated Successfully");
                res.redirect("/zone");
            }
            else
            {
                req.flash("error","Zone Deleted Successfully");
                res.redirect("/zone");
            }
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Deletes Zone */
exports.deleteZone = async(req,res) => {
    try
    {   
        let zoneDelete = await ZoneModel.deleteOne({_id : req.params.id,company : req.user.company});

        if(zoneDelete)
        {
            req.flash("success","Zone Deleted Successfully");
            res.redirect("/zone");
        }
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/zone");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
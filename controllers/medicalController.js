/** This is the Medical controller page. Medical related Functions are here .*/

/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** User/PAX Controller */
let PAXModel = require("../models/userModel");

/** User/PAX Controller */
let GroupModel = require("../models/groupModel");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

const moment = require("moment-timezone");

/** Shows Medical Status of the PAX */
exports.getMedicalRegistrationSearch = async(req,res) => {
    try
    {
        res.render("medical/searchPax",{
            pax : null,
            result : null
        });
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Shows Medical Status of the PAX */
exports.getMedicalCenterInfo = async(req,res) => {
    try
    {
       
        res.render("medical/searchPax",{
            pax : null,
            result : null,
            postUrl : "/center"
        });
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Shows PAX Code Information For Group */
exports.postPAXCodeForGroup = async(req,res) => {
    try
    {
        await postPaxCode(req,res,"medical/register/");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Shows PAX Code Information For Medical Center */
exports.postPAXCodeForMedicalCenter = async(req,res) => {
    try
    {
        await postPaxCode(req,res,"/medical/register/center/");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Adds Medical Group */
exports.postMedicalGroup = async(req,res) => {
    try
    {
        let forms = {
            code : req.body.code,
            group : req.body.group
        };

        let paxCode = forms.code;
        let query = {code : paxCode, company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group");
        let medical = await MedicalModel.findOne({company : req.user.company, pax : pax._id});
        
        /**Updates the group */
        if(medical)
        {
            let medical = {};
            medical.group = forms.group;

            let medicalUpdate = await MedicalModel.updateOne({company : req.user.company, pax : pax._id},medical);
            
            if(medicalUpdate)
            {
                req.flash("success","Medical Information has been Updated");
                res.redirect("/medical/register/" + paxCode);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/medical/register/" + paxCode);
            }
        }
        /** Adds new medical group */
        else
        {
            /** Saves Medical Data */
            let medical = new MedicalModel();
            medical.group = forms.group;
            medical.company = req.user.company;
            medical.pax = pax._id;

            let medicalSave = await medical.save();
    
            if(medicalSave)
            {
                req.flash("success","Medical Information has been saved");
                res.redirect("/medical/register/" + paxCode);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/medical/register/" + paxCode);
            }
        }    
           
       
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Posts Medical Registration Data */
exports.postMedicalRegistration = async(req,res) => {
    try
    {
        let forms = {
            center : req.body.center,
            issue : req.body.issue
        };

        let paxCode = req.body.code;
        let errors = validationResult(req);
        let query = {code : paxCode, company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group");
        let medical = await MedicalModel.findOne({company : req.user.company, pax : pax._id}).populate("group");

        if(!errors.isEmpty())
        {
            res.render("medical/information",{
                errors : errors.array(),
                form : forms,
                pax : pax,
                result : null,
                moment : moment,
                medical : medical,
                postUrl : "/center"
            });
        }
        else
        {
             /** Checks uploaded file */
            if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
            {
                if(req.files[0].fieldname == "slip")
                    forms.medical_slip = req.files[0].filename;

                /** Saves Medical Data */
                let newMedical = {};
                newMedical.medical_slip = forms.medical_slip;
                newMedical.issue = forms.issue;
                newMedical.center_name = forms.center;

                let medicalUpdate = await MedicalModel.updateOne({company : req.user.company, pax : pax._id}, newMedical);

                if(medicalUpdate)
                {
                    req.flash("success","Medical Information has been saved");
                    res.redirect("/medical/register/center/" + pax.code);
                }
                else
                {
                    req.flash("danger","Something went wrong");
                    res.redirect("/medical/register/center/" + pax.code);
                }
            }
            else
            {
                res.render("medical/information",{
                    form : forms,
                    pax : pax,
                    fileError : "Medical slip is required",
                    moment : moment,
                    medical : medical
                }); 
            }
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets PAX info for group*/
exports.getMedicalPAXInfo = async(req,res) => {
    try
    {
        let query = {company : req.user.company, code : req.params.id};
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group");

        if(pax)
        {
            let medical = await MedicalModel.findOne({company : req.user.company, pax : pax._id});
            let groups = await GroupModel.find({});
            res.render("medical/register",{
                pax : pax,
                medical : medical,
                groups : groups
            });
        }
        else
        {
            req.flash("danger","PAX Not found");
            res.redirect("/medical");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets PAX info for medical center */
exports.getMedicalPAXInfoForCenter = async(req,res) => {
    try
    {
        let query = {company : req.user.company, code : req.params.id};
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group");

        if(pax)
        {
            let medical = await MedicalModel.findOne({company : req.user.company, pax : pax._id}).populate("group");
            let groups = await GroupModel.find({});

            if(medical && medical.group)
            {
                res.render("medical/information",{
                    pax : pax,
                    medical : medical,
                    groups : groups,
                    postUrl : "/center",
                    moment : moment
                });
            }
            else
            {
                req.flash("danger","Group Registration is required");
                res.redirect("/medical/register/" + pax.code);
            }
        }    
        else
        {
            req.flash("danger","PAX Not found");
            res.redirect("/medical");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** POSTS PAX Code */
const postPaxCode = async(req,res,url) => {
    try 
    {
        let forms = {
            code : req.body.code
        };

        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("medical/searchPax",{
                errors : errors.array(),
                form : forms,
                pax : null,
                result : null
            });
        }
        else
        {
            let query = {code : forms.code, company : req.user.company};
            let pax = await PAXModel.findOne(query).populate("supplier").populate("group");
            if(pax)
            {
                let medical = await GroupModel.findOne({company : req.user.company, pax : pax._id});
    
                res.redirect(url + pax.code);
            }
            else 
            {
                res.render("medical/searchPax",{
                    form : forms,
                    pax : pax,
                    result : "No Data Found"
                });
            }
        }
    }
    catch(err)
    {
       console.log(err);
    }
}
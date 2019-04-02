/** This is the Medical controller page. Medical related Functions are here .*/

/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** User/PAX Controller */
let PAXModel = require("../models/userModel");

/** User/PAX Controller */
let GroupModel = require("../models/groupModel");


/** S3 Delete File */
const s3DeleteFile = require("../util/deleteS3File");

/** S3 Get File */
const s3GetFile = require("../util/getS3File");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");
const fs = require("fs");

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
            if(typeof paxMedicalSlip !== "undefined" && req.fileValidationError == null)
            {
                
                forms.medical_slip = paxMedicalSlip;

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
                let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);

                res.render("medical/information",{
                    pax : pax,
                    medical : medical,
                    groups : groups,
                    postUrl : "/center",
                    moment : moment,
                    medicalSlipUrl : medicalSlipUrl
                });
            }
            else
            {
                var link  = '/medical/register/' + pax.code;
                var message =  'Group Registration is required for PAX Code '+pax.code+'. <a href="'+ link +'"> Click here to save group</a>.'
                req.flash("danger",message);
                res.redirect("/medical/register/center");
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

/** Search PAX Info for Medical Report */
exports.searchPAXForReport = async(req,res) => {
    try
    {
        res.render("medical/searchPax",{
            pax : null,
            result : null,
            postUrl : "/report"
        });
    }   
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Report page for Medical Registration */
exports.getReportRegistration = async(req,res) => {
    try
    {
        await postPaxCode(req,res,"/medical/register/report/");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Medical pax Info for report */
exports.getMedicalPAXInfoForReport = async(req,res) => {
    try
    {
        let query = {company : req.user.company, code : req.params.id};
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group");

        if(pax)
        {
            let medical = await MedicalModel.findOne({company : req.user.company, pax : pax._id}).populate("group");
            let groups = await GroupModel.find({});

            if(medical && medical.group && medical.medical_slip)
            {
                let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);
                let medicalUnfitSlipUrl;

                if(medical.status == "unfit")
                    medicalUnfitSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.unfit_slip);
                else
                  medicalUnfitSlipUrl = null;

                res.render("medical/report",{
                    pax : pax,
                    medical : medical,
                    groups : groups,
                    postUrl : "/report",
                    moment : moment,
                    medicalSlipUrl : medicalSlipUrl,
                    medicalUnfitSlipUrl : medicalUnfitSlipUrl
                });
            }
            else if(medical && medical.group)
            {
                let link  = '/medical/register/center/' + pax.code;
                let message =  'Medical Center Information is required for PAX Code '+pax.code+'. <a href="'+ link +'"> Click here to save medical center information</a>.'
                req.flash("danger",message);
                res.redirect("/medical/report");
            }
            else
            {
                link  = '/medical/register/' + pax.code;
                message =  'Group Registration is required for PAX Code '+pax.code+'. <a href="'+ link +'"> Click here to save group</a>.'
                req.flash("danger",message);
                res.redirect("/medical/report");
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

/** Posts Medical Report Data */
exports.postMedicalReportInfo = async(req,res) => {
    try
    {
        let forms = {
            status : req.body.status,
            expiry : req.body.expiry
        };

        let query = {company : req.user.company, code : req.params.id};
        let pax = await PAXModel.findOne(query);
        let medical = await MedicalModel.findOne({company : req.user.company,pax : pax._id}).populate("group");
        let errors = validationResult(req);

        if(!errors.isEmpty())
        {
            res.render("medical/report",{
                posturl : "/report",
                errors : errors.array(),
                pax : pax,
                medical : medical,
                moment : moment,
                form : forms
            });
        }
        else
        {
            let newMedical = {};

            if(forms.status == "fit")
            {
                newMedical.status = "fit";
            }
            else if(forms.status == "unfit")
            {
                newMedical.status = "unfit";
                 /** Checks uploaded file */
                if(typeof paxMedicalUnfitSlip !== "undefined" && req.fileValidationError == null)
                {
                    
                    forms.unfit_slip = paxMedicalUnfitSlip;
                    
                    newMedical.unfit_slip = forms.unfit_slip;
                }
                else
                {
                    return res.render("medical/report",{
                        posturl : "/report",
                        fileError : "Medical Slip is required",
                        pax : pax,
                        medical : medical,
                        moment : moment,
                        form : forms
                    });
                }
                if(req.body.reason)
                {
                    forms.reason = req.body.reason;
                    newMedical.unfit_reason = req.body.reason;
                }
                else
                {
                    return res.render("medical/report",{
                        posturl : "/report",
                        fileError : "Unfit reason is required",
                        pax : pax,
                        medical : medical,
                        moment : moment,
                        form : forms
                    });
                }
            }  
            else
            {
                newMedical.status = "interview";
                if(req.body.interview)
                {
                    forms.interview = req.body.interview;
                    newMedical.interview_date = req.body.interview;
                }
                else
                {
                    return res.render("medical/report",{
                        posturl : "/report",
                        fileError : "Interview Date is required",
                        pax : pax,
                        medical : medical,
                        moment : moment,
                        form : forms
                    });
                }
            }  
            newMedical.medical_expiry = forms.expiry;
            let medicalUpdate = await MedicalModel.updateOne({company : req.user.company,pax : pax._id},newMedical);

            if(medicalUpdate)
            {
                req.flash("success","Medical information has been updated");
                res.redirect("/medical/register/report/" + pax.code);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/medical/register/report/" + pax.code);
            }
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** All Medicals */
exports.allMedicals = async(req,res) => {
    try
    {
        let medicals = await MedicalModel.find({company : req.user.company}).sort({created_at : -1}).populate("group").populate("pax");

        res.render("medical/index",{
            medicals : medicals,
            moment : moment
        });
    }
    catch(err)
    {
        console.log(err);
    }
}


/** Deletes Medical Info */
exports.deleteMedicalInfo = async(req,res) => {
    try
    {
        let query = {_id : req.params.id, company : req.user.company}; 

        let medical = await MedicalModel.findOne(query).populate("pax","code");

        if(medical)
        {
                /** Removes the slips */
            if(medical.medical_slip)
            {
                s3DeleteFile(req,"/pax/"+medical.pax.code+"/medical/", medical.medical_slip);
            }
            if(medical.unfit_slip)
            {
                s3DeleteFile(req,"/pax/"+medical.pax.code+"/medical/", medical.unfit_slip);
            }

            let medicalDelete = await MedicalModel.deleteOne(query);

            if(medicalDelete)
            {
                req.flash("danger","Medical Information Deleted");
                res.redirect("/medical/all");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/medical/all");
            }  
        }
    }
    catch(err)
    {
        console.log(err);
    }
}


/** Gets Medical Information */
exports.getMedicalInfo = async(req,res) => {
    try
    {
        let query = {company : req.user.company, _id : req.params.id};
        let medical = await MedicalModel.findOne(query).populate("group").populate("pax");

        if(medical)
        {
            let pax = await PAXModel.findOne({company : req.user.company, code : medical.pax.code}).populate("supplier");
            let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);
            let medicalUnfitSlipUrl;

            if(medical.status == "unfit")
                medicalUnfitSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.unfit_slip);
            else
              medicalUnfitSlipUrl = null;


            res.render("medical/view",{
                medical : medical,
                pax : pax,
                moment : moment,
                medicalSlipUrl : medicalSlipUrl,
                medicalUnfitSlipUrl : medicalUnfitSlipUrl
            });
        }
        else
        {
            req.flash("danger","Medical Information not found");
            res.redirect("/medical/all");
        }
    }
    catch(err)
    {
        req.flash("danger","Medical Information not found");
        res.redirect("/medical/all");
        console.log(err);
    }
}

/** Edits Medical Center Info */
exports.editMedicalCenterInfo = async(req,res) => {
    try
    {
        let medical = await MedicalModel.findOne({company : req.user.company,_id : req.params.id}).populate("group").populate("pax");
        let pax = await PAXModel.findOne({company : req.user.company, _id : medical.pax._id}).populate("supplier");

        if(medical)
        {
            let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);

            res.render("medical/information",{
                postUrl : "/center",
                editMedical : true,
                medical : medical,
                pax : pax,
                moment : moment,
                medicalSlipUrl : medicalSlipUrl
            });
        }
    }
    catch(err)
    {
        req.flash("danger","Medical Information Not Found");
        res.redirect("/medical/all");
        console.log(err);
    }
}

/** Updates Medical Center Info */

exports.updateMedicalCenterInfo = async(req,res) => {
    try
    {
        let forms = {
            center : req.body.center,
            issue : req.body.issue
        };

        let medical = await MedicalModel.findOne({company : req.user.company,_id : req.params.id}).populate("group").populate("pax");
        let pax = await PAXModel.findOne({company : req.user.company, _id : medical.pax._id}).populate("supplier");
        let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);

        let errors = validationResult(req);


        if(!errors.isEmpty())
        {
            res.render("medical/information",{
                errors : errors.array(),
                editMedical : true,
                medical : medical,
                pax : pax,
                moment : moment,
                medicalSlipUrl : medicalSlipUrl
            });
        }
        else
        {
            forms.medical_slip = medical.medical_slip;

            /** Checks whetere any file is uploaded */
            if(typeof paxMedicalSlip !== "undefined" && req.fileValidationError == null)
            {
                forms.medical_slip = paxMedicalSlip;
            }

            if(medical.medical_slip !== forms.medical_slip)
            {
                s3DeleteFile(req,"/pax/"+medical.pax.code+"/medical/", medical.medical_slip);

            }
            let newMedical = {};
            newMedical.center_name = forms.center;
            newMedical.medical_slip = forms.medical_slip;
            newMedical.issue = forms.issue;

            let medicalUpdate = await MedicalModel.updateOne({company : req.user.company,_id : medical._id},newMedical);

            if(medicalUpdate)
            {
                req.flash("success","Medical Center Information has been updated");
                res.redirect("/medical/register/center/" + pax.code);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/medical/register/center/" + pax.code);
            }
        }
    }
    catch(err)
    {
        req.flash("danger","Medical Information Not Found");
        res.redirect("/medical/all");
        console.log(err);
    }
}

/** Edits Medical Report Info */
exports.editMedicalReportInfo = async(req,res) => {
    try
    {

        let medical = await MedicalModel.findOne({company : req.user.company,_id : req.params.id}).populate("group").populate("pax");
        let pax = await PAXModel.findOne({company : req.user.company, _id : medical.pax._id}).populate("supplier");

        if(medical)
        {
            let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);

            let medicalUnfitSlipUrl;

            if(medical.status == "unfit")
                medicalUnfitSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.unfit_slip);
            else
              medicalUnfitSlipUrl = null;
        
            res.render("medical/report",{
                postUrl : "/center",
                editReport : true,
                medical : medical,
                pax : pax,
                moment : moment,
                medicalSlipUrl : medicalSlipUrl,
                medicalUnfitSlipUrl : medicalUnfitSlipUrl
            });
        }
    }
    catch(err)
    {
        req.flash("danger","Medical Information Not Found");
        res.redirect("/medical/all");
        console.log(err);
    }
}

/** Updates Medical Report Info */
exports.updateMedicalReportInfo = async(req,res) => {
    try
    {
        let forms = {
            status : req.body.status,
            expiry : req.body.expiry
        };

        let query = {company : req.user.company, _id : req.params.id};
        let medical = await MedicalModel.findOne(query).populate("group");
        let pax = await PAXModel.findOne({_id : medical.pax}).populate("supplier");
        let errors = validationResult(req);
        let medicalSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.medical_slip);
        let medicalUnfitSlipUrl;

        if(medical.status == "unfit")
            medicalUnfitSlipUrl = s3GetFile(req,"/pax/"+pax.code+"/medical/",medical.unfit_slip);
        else
            medicalUnfitSlipUrl = null;

        if(!errors.isEmpty())
        {
            res.render("medical/report",{
                posturl : "/report",
                errors : errors.array(),
                pax : pax,
                medical : medical,
                moment : moment,
                form : forms,
                editReport : true,
                medicalSlipUrl : medicalSlipUrl,
                medicalUnfitSlipUrl : medicalUnfitSlipUrl
            });
        }
        else
        {
            let newMedical = {};

            if(forms.status == "fit")
            {
                newMedical.status = "fit";
                newMedical.interview_date = undefined;
                if(medical.unfit_slip)
                {
                    newMedical.unfit_reason = undefined;
                    newMedical.unfit_slip = undefined;
                    s3DeleteFile(req,"/pax/"+pax.code+"/medical/", medical.unfit_slip);

                }
            }
            else if(forms.status == "unfit")
            {
                newMedical.status = "unfit";
                newMedical.interview_date = undefined;
                 /** Checks uploaded file */
                if(typeof paxMedicalUnfitSlip !== "undefined" && req.fileValidationError == null)
                {
                   
                    forms.unfit_slip = paxMedicalUnfitSlip;
                   
                    if(medical.unfit_slip)
                    {
                       
                        s3DeleteFile(req,"/pax/"+pax.code+"/medical/", medical.unfit_slip);

                    }
                    newMedical.unfit_slip = forms.unfit_slip;
                }
                else
                {
                    if(typeof medical.unfit_slip == "undefined")
                    {
                        return res.render("medical/report",{
                            posturl : "/report",
                            fileError : "Medical Slip is required",
                            pax : pax,
                            medical : medical,
                            moment : moment,
                            form : forms,
                            editReport : true,
                            medicalSlipUrl : medicalSlipUrl,
                            medicalUnfitSlipUrl : medicalUnfitSlipUrl
                        });
                    }    
                }
                if(req.body.reason)
                {
                    forms.reason = req.body.reason;
                    newMedical.unfit_reason = req.body.reason;
                }
                else
                {
                    return res.render("medical/report",{
                        posturl : "/report",
                        fileError : "Unfit reason is required",
                        pax : pax,
                        medical : medical,
                        moment : moment,
                        form : forms,
                        editReport : true,
                        medicalSlipUrl : medicalSlipUrl,
                        medicalUnfitSlipUrl : medicalUnfitSlipUrl
                    });
                }
            }  
            else
            {
                newMedical.status = "interview";
                if(req.body.interview)
                {
                    forms.interview = req.body.interview;
                    newMedical.interview_date = req.body.interview;
                    if(medical.unfit_slip)
                    {
                        newMedical.unfit_reason = undefined;
                        newMedical.unfit_slip = undefined;
                        s3DeleteFile(req,"/pax/"+pax.code+"/medical/", medical.unfit_slip);
    
                    }
                }
                else
                {
                    return res.render("medical/report",{
                        posturl : "/report",
                        fileError : "Interview Date is required",
                        pax : pax,
                        medical : medical,
                        moment : moment,
                        form : forms,
                        editReport : true,
                        medicalSlipUrl : medicalSlipUrl,
                        medicalUnfitSlipUrl : medicalUnfitSlipUrl
                    });
                }
            }  
            newMedical.medical_expiry = forms.expiry;
            let medicalUpdate = await MedicalModel.updateOne({company : req.user.company,_id : req.params.id},newMedical);

            if(medicalUpdate)
            {
                req.flash("success","Medical information has been updated");
                res.redirect("/medical/register/report/" + pax.code);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/medical/register/report/" + pax.code);
            }
        
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Prints Documents  */
exports.printDoc = async(req,res) => {
    try 
    {
        let query = {company : req.user.company, code : req.params.id};
        let pax = await PAXModel.findOne(query).populate("group");
        let medical = await MedicalModel.findOne({company : req.user.company, pax : pax._id});
        if(pax && medical)
        {
            res.render("medical/print",{
                pax : pax,
                medical : medical
            });
        }
        else
        {
            req.flash("danger","PAX or Medical Information not found");
            res.redirect("/medical/register/" + req.params.id);
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Prints Passport Copy */
exports.printPassport = async(req,res) => {
    try
    {
        let query = {company : req.user.company, _id : req.params.id};
        let pax = await PAXModel.findOne(query).populate("company");

        if(pax)
        {
            let passportPdf = require("../util/passportPdf");

            passportPdf(req,res,pax);
        }
        else
        {
            req.flash("danger","PAX Not Found");
            res.redirect("/medical/register/" + req.params.id);
        }
    }   
    catch(err)
    {
        console.log(err);
    }
}

/** Prints Medical Copy */
exports.printApplication = async(req,res) => {
    try
    {
        let query = {company : req.user.company, _id : req.params.id};
        let pax = await PAXModel.findOne(query).populate("company");

        if(pax)
        {
            let medicalApplication = require("../util/medicalApplication");

            medicalApplication(res,pax);
        }
        else
        {
            req.flash("danger","PAX Not Found");
            res.redirect("/medical/register/" + req.params.id);
        }
    }   
    catch(err)
    {
        console.log(err);
    }
}
/** Prints Enjazit Image */
exports.printEnjazit = async(req,res) => {
    try
    {
        let query = {company : req.user.company, _id : req.params.id};
        let group = await GroupModel.findOne(query);

        if(group)
        {
            let enjazitPdf = require("../util/enjazitPdf");

            enjazitPdf(req,res,group);
        }
        else
        {
            req.flash("danger","Enjazit Not Found");
            res.redirect("/medical/register/" + req.params.id);
        }
    }   
    catch(err)
    {
        console.log(err);
    }
}
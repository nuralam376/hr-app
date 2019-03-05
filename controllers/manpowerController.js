/** PAX Model */
const PAXModel = require("../models/userModel");
/** TC Model */
const TCModel = require("../models/tcModel");

/** TC Model */
const ManpowerModel = require("../models/manpowerModel");


/** Validation */
const {validationResult} = require("express-validator/check");

const moment = require("moment-timezone");

const fs = require("fs");

/** Gets All Infos */
exports.getAllInfos = async(req,res) => {
    try
    {
        let manpowers = await ManpowerModel.find({company : req.user.company}).populate("pax").exec();

        res.render("manpower/index",{
            manpowers : manpowers.reverse(),
            moment : moment
        });
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Search Stamping by PAX Code */
exports.getSearch = async(req,res) => {
    try
    {
        res.render("manpower/searchPAX");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets PAX Information */
exports.postSearch = async(req,res) => {
    try
    {
        let form = {
            code : req.body.code
        };

        const errors = validationResult(req);

        /** Displays Errors */
        if(!errors.isEmpty())
        {
            return res.render("manpower/searchPAX",{
                errors : errors.array(),
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query).exec();

        /** Finds PAX Code */
        if(pax)
        {
            let tc = await TCModel.findOne({pax : pax._id,company : req.user.company});
          

            /** Finds MOFA information of the PAX */
            if(tc && tc.tc_received && tc.finger)
            {
                res.redirect("/manpower/search/"+pax._id);
            }
            else
            {
                req.flash("error","TC Information is needed.Go to <a href = '/tc'>TC</a> Section");
                res.redirect("/manpower/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/manpower/search");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Manpower Registration Page */
exports.registerManpower = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        if(pax)
        {
            let tc = await TCModel.findOne({pax : pax._id,company : req.user.company});
            let manpower = await ManpowerModel.findOne({pax : pax._id, company: req.user.company});
           /** Finds TC information of the PAX */
           if(tc && tc.tc_received && tc.finger)
           {
               res.render("manpower/register",{
                   pax : pax,
                   tc : tc,
                   manpower : manpower
               });
           }
           else
           {
            req.flash("error","TC Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
            res.redirect("/manpower/search");
           }
        }
        else
        {
            req.flash("danger","PAX Not Found");
            res.redirect("/manpower/search");
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Manpower Ready Status */
exports.postManpower = async(req,res) => {
    try
    {
        let forms = {
            ready : req.body.ready
        };

        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();
        let manpower = await ManpowerModel.findOne({pax : pax._id,company : req.user.company});
        let tc = await TCModel.findOne({pax : req.params.id,company : req.user.company}).exec();

        if(pax && tc && tc.tc_received && tc.finger)
        {
           
            let manpowerStatus;
            if(manpower)
            {
                let newManpower = {};
                newManpower.ready = forms.ready;
                manpowerStatus = await ManpowerModel.updateOne({_id : manpower._id},newManpower);
            }
            else
            {
                let newManpower = new ManpowerModel();
                newManpower.ready = forms.ready;
                newManpower.pax = req.params.id;
                newManpower.company = req.user.company;
                manpowerStatus = await newManpower.save();
            }

            if(manpowerStatus)
            {
                req.flash("success","Manpower Information saved");
                res.redirect("/manpower/search/"+req.params.id);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/manpower/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/manpower/search");
        }
      
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Status Search Page */
exports.getStatusSearch = async(req,res) => {
    try
    {
        res.render("includes/searchPAX",{
            action : "/manpower/status",
            heading : "Status After Manpower"
        });
    }
    catch(err)
    {
        console.log(err);
    }
}


/** Gets PAX Information */
exports.postStatusSearch = async(req,res) => {
    try
    {
        let form = {
            code : req.body.code
        };

        const errors = validationResult(req);

        /** Displays Errors */
        if(!errors.isEmpty())
        {
            return res.render("includes/searchPAX",{
                action : "/manpower/status",
                heading :  "Status after Manpower",
                errors : errors.array(),
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query);

        /** Finds PAX Code */
        if(pax)
        {
            let manpower = await ManpowerModel.findOne({pax : pax._id,company : req.user.company});
            /** Finds Manpower information of the PAX */
            if(manpower && manpower.ready == 1)
            {
                res.redirect("/manpower/status/"+manpower._id);
            }
            else
            {
                req.flash("error","Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
                res.redirect("/manpower/status");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/manpower/status");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Manpower Status Registration Page */
exports.getRegisterManpowerStatus = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};
       
            let manpower = await ManpowerModel.findById(req.params.id).exec();
           /** Finds TC information of the PAX */
           if(manpower)
           {
               let pax = await PAXModel.findOne({_id : manpower.pax, company : req.user.company}).populate("supplier").populate("group").exec();
               res.render("manpower/status",{
                   manpower : manpower,
                   pax : pax,
                   action : "/manpower/status",
                   heading  : "Status after Manpower",
                   moment : moment
               });
           }
           else
           {
            req.flash("error","Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
            res.redirect("/manpower/status");
           }
    }
    catch(err)
    {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Manpower Status */
exports.postRegisterManpowerStatus = async(req,res) => {
    try
    {
        let forms = {
            clearance : req.body.clearance,
            card_no : req.body.card_no,
        };

        let query = {_id : req.params.id,company : req.user.company};
        let manpower = await ManpowerModel.findOne(query);
        let pax = await PAXModel.findOne({_id : manpower.pax,company : req.user.company}).populate("supplier").populate("group").exec();
        let errors = validationResult(req);
        let fileError;
        /** Checks Whether any file is uploaded */
        if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
        {
            if(req.files[0].fieldname == "card_photo")
                forms.card_photo = req.files[0].filename;
        }

        if(!manpower.card_photo && !forms.card_photo)
        {
           fileError = "Card Photo is required";
        }
        else if(req.fileValidationError)
        {
            fileError = req.fileValidationError;
        }

        if(!errors.isEmpty() || fileError)
        {
            return res.render("manpower/status",{
                manpower : manpower,
                pax : pax,
                action : "/manpower/status",
                heading  : "Status after Manpower",
                errors : errors.array(),
                fileError : fileError,
                form : forms,
                moment : moment
            });
        }
        
        

        let manpowerStatus;

        if(manpower)
        {
           
            let newManpower = {};
            newManpower.clearance_date = forms.clearance;
            newManpower.card_no = forms.card_no;
            newManpower.updated_at = Date.now();
            if(forms.card_photo)
            {
                if(manpower.ready != 1)
                {
                    fs.unlink("./public/uploads/manpower/" + manpower.card_photo, err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                }
                newManpower.card_photo = forms.card_photo;
            }
            manpowerStatus = await ManpowerModel.updateOne({_id : manpower._id},newManpower);
            
        }
        else
        {
            let newManpower = new ManpowerModel();
            newManpower.clearance_date = forms.clearance;
            newManpower.card_no = forms.card_no;
            newManpower.card_photo = forms.card_photo;
            newManpower.updated_at = Date.now();
            manpowerStatus = await newManpower.save();
        }

        if(manpowerStatus)
        {
            req.flash("success","Manpower Information saved");
            res.redirect("/manpower/status/"+req.params.id);
        }
        else
        {
            req.flash("danger","Something went wrong");
            res.redirect("/manpower/status");
        }
      
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Deletes Manpower Info */
exports.deleteManpower = async(req,res) => {
    try
    {   
        let query = {_id : req.params.id, company : req.user.company};

        let manpower = await ManpowerModel.findOne(query);

        if(manpower)
        {
               
            fs.unlink("./public/uploads/manpower/"+manpower.card_photo, (err) => {
                if(err)
                {
                    console.log(err);
                }
            });
           

            let manpowerDelete = await ManpowerModel.deleteOne(query);

            if(manpowerDelete)
            {
                req.flash("danger","Manpower Deleted");
                res.redirect("/manpower");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/manpower");
            }  
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
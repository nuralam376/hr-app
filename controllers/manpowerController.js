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
            manpowers : manpowers,
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
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

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

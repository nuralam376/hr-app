/** PAX Model */
const PAXModel = require("../models/userModel");
/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Mofa Model */
const TCModel = require("../models/tcModel");

/** Validation */
const {validationResult} = require("express-validator/check");

const moment = require("moment-timezone");

const fs = require("fs");

/** Gets All Infos */
exports.getAllInfos = async(req,res) => {
    try
    {
        let tcs = await TCModel.find({company : req.user.company}).populate("pax").exec();

        res.render("tc/index",{
            tcs : tcs.reverse(),
            moment : moment
        });
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Search TC by PAX Code */
exports.getSearch = async(req,res) => {
    try
    {
        res.render("tc/searchPAX");
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
            return res.render("tc/searchPAX",{
                errors : errors.array(),
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        /** Finds PAX Code */
        if(pax)
        {
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}).exec();
          

            /** Finds MOFA information of the PAX */
            if(stamping && stamping.stamping_date)
            {
                res.redirect("/tc/search/"+pax._id);
            }
            else
            {
                req.flash("error","Stamping Information is needed.Go to <a href = '/stamping'>Stamping</a> Section");
                res.redirect("/tc/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/tc/search");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets TC Registration Page */
exports.registerTC = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).exec();

        if(pax)
        {
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company});
           /** Finds MOFA information of the PAX */
           if(stamping && stamping.stamping_date)
           {
               res.render("tc/register",{
                   pax : pax,
               });
           }
           else
           {
            req.flash("error","Stamping Information is needed.Go to <a href = '/mofa'>Stamping</a> Section");
            res.redirect("/tc/search");
           }
        }
        else
        {
            req.flash("danger","PAX Not Found");
            res.redirect("/tc/search");
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}


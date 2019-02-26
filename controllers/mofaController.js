/** PAX Model */
const PAXModel = require("../models/userModel");

/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** Validation Result */
const {validationResult} = require("express-validator/check");

/** Gets all the information of Mofa */
exports.getMofas = async(req,res) => {
    try
    {
        res.render("mofa/index");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Mofa Registration View */
exports.getMofaSearch = async(req,res) => {
    try
    {
        res.render("mofa/searchPAX");
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Search Mofa Information by PAX Code */
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
            return res.render("mofa/searchPAX",{
                errors : errors.array(),
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group").exec();

        /** Finds PAX Code */
        if(pax)
        {
            let medical = await MedicalModel.findOne({pax : pax._id, status : "fit"});

            /** Finds Medical information of the PAX */
            if(medical)
            {
                res.render("mofa/register",{
                    pax : pax
                });
            }
            else
            {
                req.flash("error","Medical Information is needed.Go to <a href = '/medical'>Medical</a> Section");
                res.redirect("/mofa/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/mofa/search");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Posts Mofa Information */
exports.postMofaRegistration = async(req,res) => {
    try
    {

    }
    catch(err)
    {
        console.log(err);
    }
}
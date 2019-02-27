/** PAX Model */
const PAXModel = require("../models/userModel");
/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Mofa Model */
const MofaModel = require("../models/mofaModel");

/** Validation */
const {validationResult} = require("express-validator/check");

/** Search Stamping by PAX Code */
exports.getSearch = async(req,res) => {
    try
    {
        res.render("stamping/searchPAX");
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
            return res.render("stamping/searchPAX",{
                errors : errors.array(),
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        /** Finds PAX Code */
        if(pax)
        {
            let mofa = await MofaModel.findOne({pax : pax._id,company : req.user.company}).populate("group").exec();
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}) || undefined;

            /** Finds MOFA information of the PAX */
            if(mofa && mofa.e_number)
            {
                res.render("stamping/register",{
                    pax : pax,
                    mofa : mofa,
                    stamping
                });
            }
            else
            {
                req.flash("error","MOFA Information is needed.Go to <a href = '/mofa'>MOFA</a> Section");
                res.redirect("/stamping/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/stamping/search");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Posts Stamping Registration */
exports.postStamping = async(req,res) => {
    try
    {
        let forms = {
            status : req.body.status
        };
        /** Checks whetere any file is uploaded */
        if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
        {
            if(req.files[0].fieldname == "pc_image")
                forms.pc_image = req.files[0].filename;
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
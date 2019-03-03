/** PAX Model */
const PAXModel = require("../models/userModel");
/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Mofa Model */
const MofaModel = require("../models/mofaModel");

/** Validation */
const {validationResult} = require("express-validator/check");

const fs = require("fs");

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
          

            /** Finds MOFA information of the PAX */
            if(mofa && mofa.e_number)
            {
                res.redirect("/stamping/search/"+pax._id);
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

/** Gets Stamping Registration Page */
exports.registerStamping = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        if(pax)
        {
            let mofa = await MofaModel.findOne({pax : pax._id,company : req.user.company}).populate("group").exec();
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}) || undefined;
           /** Finds MOFA information of the PAX */
           if(mofa && mofa.e_number)
           {
               res.render("stamping/register",{
                   pax : pax,
                   stamping : stamping,
                   mofa : mofa
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
            req.flash("danger","PAX Not Found");
            res.redirect("/stamping/search");
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Stamping Registration */
exports.postStamping = async(req,res) => {
    try
    {
        let forms = {
            status : req.body.status
        };
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();
        let mofa = await MofaModel.findOne({pax : pax._id,company : req.user.company}).populate("group").exec();
        let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}) || undefined;
        /** Checks whetere any file is uploaded */
        if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
        {
            if(req.files[0].fieldname == "pc_image")
                forms.pc_image = req.files[0].filename;
     

            if(pax)
            {
                let stampingStatus;
                if(stamping)
                {
                    let newStamping = {};
                    newStamping.status = forms.status;
                    newStamping.pc_image = forms.pc_image;
                    /** Removes the old file */
                    fs.unlink("./public/uploads/stamping/" + stamping.pc_image, err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                    stampingStatus = await StampingModel.updateOne({_id : stamping._id},newStamping);
                }
                else
                {
                    let newStamping = new StampingModel();
                    newStamping.status = forms.status;
                    newStamping.pc_image = forms.pc_image;
                    newStamping.company = req.user.company;
                    newStamping.pax = req.params.id;
                    stampingStatus = await newStamping.save();
                }

                if(stampingStatus)
                {
                    req.flash("success","Stamping Information saved");
                    res.redirect("/stamping/search/"+req.params.id);
                }
                else
                {
                    req.flash("danger","Something went wrong");
                    res.redirect("/medical/search");
                }
            }
            else
            {
                req.flash("error","PAX Not Found");
                res.redirect("/stamping/search");
            }
        }
        else
        {
            res.render("stamping/register",{
                pax : pax,
                mofa : mofa,
                stamping : stamping,
                fileError : "Image is required"
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
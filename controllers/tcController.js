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
const path = require("path");

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
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}).exec();
            let tc = await TCModel.findOne({pax : pax._id,company : req.user.company}).exec();
           /** Finds MOFA information of the PAX */
           if(stamping && stamping.stamping_date)
           {
               res.render("tc/register",{
                   pax : pax,
                   tc : tc
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

/** Posts TC Registration */
exports.postTC = async(req,res) => {
    try
    {
        let forms = {
            tc_received : req.body.tc_received || 0,
            finger : req.body.finger || 0
        };
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).populate("supplier").exec();
        let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company});
        let tc = await TCModel.findOne({pax : req.params.id,company : req.user.company}).exec();

        if(req.fileValidationError)
        {
            return res.render("tc/register",{
                pax : pax,
                tc : tc,
                fileError : "File must be in pdf format"
            });   
        }
        /** Checks whether any file is uploaded */
        if(typeof req.files[0] !== "undefined" && req.fileValidationError == null)
        {
            if(req.files[0].fieldname == "tc_pdf")
                forms.tc_pdf = req.files[0].filename;
        }

        if(pax && stamping.stamping_date)
        {
           
            let tcStatus;
            if(tc)
            {
                let newTc = {};
                newTc.tc_received = forms.tc_received;
                newTc.tc_pdf = forms.tc_pdf;
                newTc.finger = forms.finger;
                if(tc.tc_pdf)
                {
                    /** Removes the old file */
                    fs.unlink("./public/uploads/tc/" + tc.tc_pdf, err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                }
                tcStatus = await TCModel.updateOne({_id : tc._id},newTc);
            }
            else
            {
                let newTc = new TCModel();
                newTc.tc_received = forms.tc_received;
                newTc.finger = forms.finger;
                newTc.tc_pdf = forms.tc_pdf;
                newTc.pax = req.params.id;
                newTc.company = req.user.company;
                tcStatus = await newTc.save();
            }

            if(tcStatus)
            {
                req.flash("success","TC Information saved");
                res.redirect("/tc/search/"+req.params.id);
            }
            else
            {
                req.flash("danger","Something went wrong");
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

/** Downloads TC PDF */
exports.downloadTC = async(req,res) => {
    try
    {
        let tc = await TCModel.findById(req.params.id).exec();

        if(tc)
        {
            let file = path.join(__dirname, '../public/uploads/tc/'+tc.tc_pdf);
            res.setHeader('Content-disposition', 'attachment; filename=' + tc.tc_pdf);
            res.setHeader('Content-type', "application/pdf");
            res.download(file); // Set disposition and send it.
        }
        else
        {
            req.flash("danger","TC Not found");
            res.redirect("/tc");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Deletes TC Data */
exports.deleteTc = async(req,res) => {
    try
    {
        let query = {_id : req.params.id, company : req.user.company}; 

        let tc = await TCModel.findOne(query);

        if(tc)
        {
            if(tc.tc_pdf)
            {

                fs.unlink("./public/uploads/tc/"+tc.tc_pdf, (err) => {
                    if(err)
                    {
                        console.log(err);
                    }
                });
            }
            

            let tcDelete = await TCModel.deleteOne(query);

            if(tcDelete)
            {
                req.flash("danger","TC Deleted");
                res.redirect("/tc");
            }
            else
            {
                req.flash("danger","Something Went Wrong");
                res.redirect("/tc");
            }  
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
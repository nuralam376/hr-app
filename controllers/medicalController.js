/** This is the Medical controller page. Medical related Functions are here .*/

/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** User/PAX Controller */
let PAXModel = require("../models/userModel");

/** Validation Configuration */
const {check,validationResult} = require("express-validator/check");
const {sanitizeBody} = require("express-validator/filter");

/** Gets All Medical Information */
exports.getAllMedicals = async(req,res) => {
    try
    {

    }
    catch(err)
    {
        console.log(err);
    }
}

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

exports.postPAXCode = async(req,res) => {
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
                res.render("medical/searchPax",{
                    form : forms,
                    pax : pax,
                }); 
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

    }
}
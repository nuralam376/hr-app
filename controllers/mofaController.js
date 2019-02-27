/** PAX Model */
const PAXModel = require("../models/userModel");

/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** Group Model */
const GroupModel = require("../models/groupModel");

/** Mofa Model */
const MofaModel = require("../models/mofaModel");

/** Validation Result */
const {validationResult} = require("express-validator/check");

/** Gets all the information of Mofa */
exports.getMofas = async(req,res) => {
    try
    {
        let mofas = await MofaModel.find({company : req.user.company}).populate("pax").populate("group").exec();


        res.render("mofa/index",{
            mofas : mofas
        });
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
            let mofa = await MofaModel.findOne({pax : pax._id,company : req.user.company}) || undefined;

            /** Finds Medical information of the PAX */
            if(medical)
            {
                let groups = await GroupModel.find({company : req.user.company}).exec();
                res.render("mofa/register",{
                    pax : pax,
                    groups : groups,
                    mofa : mofa
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
        let form = {
            group : req.body.group,
            occupation : req.body.occupation,
        };

        form.health = req.body.health || 0;
        form.embassy = req.body.embassy || 0;
        form.type = req.body.type || 0;

        const errors = validationResult(req);
        let pax = await PAXModel.findById(req.body.pax).populate("supplier").populate("group").exec();
        let groups = await GroupModel.find({company : req.user.company}).exec();

        if(!errors.isEmpty())
        {
            return res.render("mofa/register",{
                errors : errors.array(),
                form : form,
                pax : pax,
                groups : groups
            });
        }
      
        /** Updates Groups Occupation */
       let newGroup = {};
       newGroup.occupation = form.occupation;
       let groupUpdate = await GroupModel.updateOne({_id : form.group}, newGroup).exec();

       if(groupUpdate)
       {
            let mofaInfo = await MofaModel.findOne({pax : pax._id,company : req.user.company}) || undefined;
            let mofa;
            if(mofaInfo)
            {
                mofa = {};
                let total = mofaInfo.health_payment + mofaInfo.embassy_payment + mofaInfo.type;

                if(total == 2400)
                {
                    if(!req.body.enumber)
                    {
                        return res.render("mofa/register",{
                            fileError : "E Number is required",
                            form : form,
                            pax : pax,
                            groups : groups,
                            mofa : mofaInfo
                        });
                    }
                    else 
                    {
                        mofa.e_number = req.body.enumber;
                    }
            }
            }
            else
            {
                mofa = new MofaModel();
            }
            mofa.health_payment = form.health;
            mofa.embassy_payment = form.embassy;
            mofa.type = form.type;
            mofa.company = req.user.company;
            mofa.pax = req.body.pax;
            mofa.group = form.group;
            

            if(mofaInfo)
            {
                mofa.updated_at = Date.now();
                let mofaUpdate = await MofaModel.updateOne({pax : req.body.pax,company :req.user.company},mofa);
                if(mofaUpdate)
                {
                    req.flash("success","Mofa Updated Successfully");
                    res.redirect("/mofa");
                }
            }
            else
            {
                let mofaSave = await mofa.save();
                if(mofaSave)
                {
                    req.flash("success","Mofa Saved Successfully");
                    res.redirect("/mofa");
                }
            }

         
       }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets All Groups For Mofa */
exports.getAllGroups = async(req,res) => {
    let groups = await GroupModel.find({company : req.user.company});
    res.jsonp(groups);
}

/** Mofa Stikcer Info */
exports.getSticker = async(req,res) => {
    try
    {
        let id = req.params.id;
        let mofa = await MofaModel.findById(id).populate("group").exec();

        /** If Mofa Founds */
        if(mofa && mofa.e_number)
        {
            res.render("mofa/sticker",{
                mofa : mofa
            });
        }
        else
        {
            req.flash("error","Mofa E Number Not Found");
            res.redirect("/mofa");
        }

    }
    catch(err)
    {
        console.log(err);
    }
}

/** Downloads Mofa Sticker */
exports.downloadSticker = async(req,res) => {
    try
    {
        let id = req.params.id;
        let mofa = await MofaModel.findById(id).populate("group").exec();

        if(mofa && mofa.e_number)
        {
            const stickerPdf = require("../util/mofaPdf");

            stickerPdf(res,mofa);
        }
        else
        {
            req.flash("error","Mofa E Number not found");
            res.redirect("/mofa");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Deletes Mofa */
exports.deleteMofa = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};

        let mofaDelete = await MofaModel.deleteOne(query);

        if(mofaDelete)
        {
            req.flash("success","Mofa Deleted Successfully");
            res.redirect("/mofa");
        }
        else
        {
            req.flash("error","Something went wrong");
            res.redirect("/mofa");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
/** PAX Model */
const PAXModel = require("../models/userModel");

/** Medical Model */
const MedicalModel = require("../models/medicalModel");

/** Group Model */
const GroupModel = require("../models/groupModel");

/** Mofa Model */
const MofaModel = require("../models/mofaModel");

/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Created Events Module */
const createdEvents = require("../util/paxStageEvents");

/** Moment */
const moment = require("moment");

/** Validation Result */
const { validationResult } = require("express-validator/check");

/** Gets all the information of Mofa */
exports.getMofas = async (req, res) => {
    try {
        let mofas = await MofaModel.find({ company: req.user.company }).populate("pax").populate("group").exec();


        res.render("mofa/index", {
            mofas: mofas
        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets Mofa Registration View */
exports.getMofaSearch = async (req, res) => {
    try {
        res.render("mofa/searchPAX", {
            searchStage: "MOFA Registration"
        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Search Mofa Information by PAX Code */
exports.postSearch = async (req, res) => {
    try {
        let form = {
            code: req.body.code
        };

        const errors = validationResult(req);

        /** Displays Errors */
        if (!errors.isEmpty()) {
            return res.render("mofa/searchPAX", {
                errors: errors.array(),
                form: form,
                searchStage: "MOFA Registration"

            });
        }
        let query = { company: req.user.company, code: req.body.code };
        let pax = await PAXModel.findOne(query).populate("supplier").populate("group").exec();

        /** Finds PAX Code */
        if (pax) {
            let medical = await MedicalModel.findOne({ pax: pax._id, status: "fit" });
            let mofa = await MofaModel.findOne({ company: req.user.company, pax: pax._id }) || undefined;

            /** Finds Medical information of the PAX */
            if (medical) {
                let groups = await GroupModel.find({ company: req.user.company }).exec();
                res.render("mofa/register", {
                    pax: pax,
                    groups: groups,
                    mofa: mofa,
                    searchStage: "MOFA Registration"

                });
            }
            else {
                req.flash("error", "Medical Information is needed.Go to <a href = '/medical'>Medical</a> Section");
                res.redirect("/mofa/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/mofa/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Posts Mofa Information */
exports.postMofaRegistration = async (req, res) => {
    try {
        let form = {
            group: req.body.group,
            occupation: req.body.occupation,
        };

        form.health = req.body.health || 0;
        form.embassy = req.body.embassy || 0;
        form.type = req.body.type || 0;

        const errors = validationResult(req);
        let pax = await PAXModel.findById(req.body.pax).populate("supplier").populate("group").exec();
        let groups = await GroupModel.find({ company: req.user.company }).exec();

        if (!errors.isEmpty()) {
            return res.render("mofa/register", {
                errors: errors.array(),
                form: form,
                pax: pax,
                groups: groups,
                searchStage: "MOFA Registration"
            });
        }

        /** Updates Groups Occupation */
        let newGroup = {};
        newGroup.occupation = form.occupation;
        let groupUpdate = await GroupModel.updateOne({ _id: form.group }, newGroup).exec();

        if (groupUpdate) {
            let mofaInfo = await MofaModel.findOne({ company: req.user.company, pax: pax._id, }) || undefined;
            let mofa;
            if (mofaInfo) {
                mofa = {};
                let total = mofaInfo.health_payment + mofaInfo.embassy_payment + mofaInfo.type;

                if (total == 2400) {
                    if (!req.body.enumber) {
                        return res.render("mofa/register", {
                            fileError: "E Number is required",
                            form: form,
                            pax: pax,
                            groups: groups,
                            mofa: mofaInfo,
                            searchStage: "MOFA Registration"
                        });
                    }
                    else {
                        mofa.e_number = req.body.enumber;
                    }
                }
            }
            else {
                mofa = new MofaModel();
            }
            mofa.health_payment = form.health;
            mofa.embassy_payment = form.embassy;
            mofa.type = form.type;
            mofa.group = form.group;


            if (mofaInfo) {
                await createdEvents(req, mofaInfo, mofa, "mofa");
                mofa.updated_at = Date.now();
                let mofaUpdate = await MofaModel.updateOne({ company: req.user.company, pax: req.body.pax }, mofa);
                if (mofaUpdate) {
                    req.flash("success", "Mofa Updated Successfully");
                    res.redirect("/mofa");
                }
            }
            else {
                mofa.pax = req.body.pax;
                mofa.company = req.user.company;
                /** Mofa Status */
                let mofaStatus = {
                    type: "mofa_information_saved",
                    display_name: "MOFA Information Saved",
                    description: `${req.user.name} saved MOFA of ${pax.name}`,
                    time: Date.now()
                };

                mofa.events.push(mofaStatus);
                let mofaSave = await mofa.save();
                if (mofaSave) {
                    req.flash("success", "Mofa Saved Successfully");
                    res.redirect("/mofa");
                }
            }


        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets All Groups For Mofa */
exports.getAllGroups = async (req, res) => {
    let groups = await GroupModel.find({ company: req.user.company });
    res.jsonp(groups);
}

/** Mofa Stikcer Info */
exports.getSticker = async (req, res) => {
    try {
        let id = req.params.id;
        let mofa = await MofaModel.findById(id).populate("group").exec();

        /** If Mofa Founds */
        if (mofa && mofa.e_number) {
            res.render("mofa/sticker", {
                mofa: mofa
            });
        }
        else {
            req.flash("error", "Mofa E Number Not Found");
            res.redirect("/mofa");
        }

    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Downloads Mofa Sticker */
exports.downloadSticker = async (req, res) => {
    try {
        let id = req.params.id;
        let mofa = await MofaModel.findById(id).populate("group").exec();

        if (mofa && mofa.e_number) {
            const stickerPdf = require("../util/mofaPdf");

            stickerPdf(res, mofa);
        }
        else {
            req.flash("error", "Mofa E Number not found");
            res.redirect("/mofa");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Deletes Mofa */
exports.deleteMofa = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let mofa = await MofaModel.findOne(query);

        let stamping = await StampingModel.findOne({ company: req.user.company, pax: mofa.pax });
        if (!stamping) {
            let mofaDelete = await MofaModel.deleteOne(query);

            if (mofaDelete) {
                req.flash("success", "Mofa Deleted Successfully");
                res.redirect("/mofa");
            }
            else {
                req.flash("error", "Something went wrong");
                res.redirect("/mofa");
            }
        } else {
            req.flash("danger", "Stamping information needs to be deleted first");
            res.redirect("/mofa");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/**
 * Shows Timeline of MOFA
 */

exports.mofaTimeline = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let mofa = await MofaModel.findOne(query).populate("pax", "code").exec();
        res.render("includes/timeline", {
            paxStage: mofa,
            stageName: "MOFA",
            moment: moment
        });
    } catch (error) {
        console.log(error);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
};
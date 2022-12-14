/** PAX Model */
const PAXModel = require("../models/userModel");
/** TC Model */
const TCModel = require("../models/tcModel");

/** Manpower Model */
const ManpowerModel = require("../models/manpowerModel");

/** Flight Model */
const FlightModel = require("../models/flightModel");

/** S3 Delete File */
const s3DeleteFile = require("../util/deleteS3File");

/** S3 Get File */
const s3GetFile = require("../util/getS3File");

/** Created Events Module */
const createdEvents = require("../util/paxStageEvents");

/** Validation */
const { validationResult } = require("express-validator/check");

const moment = require("moment-timezone");

const fs = require("fs");

/** Gets All Infos */
exports.getAllInfos = async (req, res) => {
    try {
        let manpowers = await ManpowerModel.find({ company: req.user.company }).sort({ created_at: -1 }).populate("pax").exec();

        let newManpowers = manpowers.map(manpower => {

            let url = s3GetFile(req, "/pax/" + manpower.pax.code + "/manpower/", manpower.card_photo);

            manpower["imageUrl"] = url;

            return manpower;
        });

        res.render("manpower/index", {
            manpowers: newManpowers,
            moment: moment
        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Search Stamping by PAX Code */
exports.getSearch = async (req, res) => {
    try {
        res.render("manpower/searchPAX", {
            searchStage: "Ready for Manpower"

        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets PAX Information */
exports.postSearch = async (req, res) => {
    try {
        let form = {
            code: req.body.code
        };

        const errors = validationResult(req);

        /** Displays Errors */
        if (!errors.isEmpty()) {
            return res.render("manpower/searchPAX", {
                errors: errors.array(),
                form: form,
                searchStage: "Ready for Manpower"

            });
        }
        let query = { company: req.user.company, code: req.body.code };
        let pax = await PAXModel.findOne(query).exec();

        /** Finds PAX Code */
        if (pax) {
            let tc = await TCModel.findOne({ company: req.user.company, pax: pax._id });


            /** Finds MOFA information of the PAX */
            if (tc && tc.tc_received && tc.finger) {
                res.redirect("/manpower/search/" + pax._id);
            }
            else {
                req.flash("error", "TC Information is needed.Go to <a href = '/tc'>TC</a> Section");
                res.redirect("/manpower/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/manpower/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets Manpower Registration Page */
exports.registerManpower = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        if (pax) {
            let tc = await TCModel.findOne({ company: req.user.company, pax: pax._id });
            let manpower = await ManpowerModel.findOne({ company: req.user.company, pax: pax._id });
            /** Finds TC information of the PAX */
            if (tc && tc.tc_received && tc.finger) {
                res.render("manpower/register", {
                    pax: pax,
                    tc: tc,
                    manpower: manpower,
                    searchStage: "Ready for Manpower"
                });
            }
            else {
                req.flash("error", "TC Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
                res.redirect("/manpower/search");
            }
        }
        else {
            req.flash("danger", "PAX Not Found");
            res.redirect("/manpower/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Manpower Ready Status */
exports.postManpower = async (req, res) => {
    try {
        let forms = {
            ready: req.body.ready
        };

        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();
        let manpower = await ManpowerModel.findOne({ company: req.user.company, pax: pax._id });
        let tc = await TCModel.findOne({ company: req.user.company, pax: req.params.id }).exec();

        if (pax && tc && tc.tc_received && tc.finger) {

            let manpowerStatus;
            if (manpower) {
                let newManpower = {};
                newManpower.ready = forms.ready;
                await createdEvents(req, manpower, newManpower, "manpower");
                newManpower.updated_at = Date.now();
                manpowerStatus = await ManpowerModel.updateOne({ _id: manpower._id }, newManpower);
            }
            else {
                let newManpower = new ManpowerModel();
                newManpower.ready = forms.ready;
                newManpower.pax = req.params.id;
                newManpower.company = req.user.company;
                /** Manpower Status */
                let manpowerEventStatus = {
                    type: "manpower_information_saved",
                    display_name: "Manpower Information Saved",
                    description: `${req.user.name} saved Manpower of ${pax.name}`,
                    time: Date.now()
                };
                newManpower.events.push(manpowerEventStatus);
                newManpower.created_at = Date.now();
                manpowerStatus = await newManpower.save();
            }

            if (manpowerStatus) {
                req.flash("success", "Manpower Information saved");
                res.redirect("/manpower/search/" + req.params.id);
            }
            else {
                req.flash("danger", "Something went wrong");
                res.redirect("/manpower/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/manpower/search");
        }

    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Status Search Page */
exports.getStatusSearch = async (req, res) => {
    try {
        res.render("includes/searchPAX", {
            action: "/manpower/status",
            heading: "Status After Manpower"
        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}


/** Gets PAX Information */
exports.postStatusSearch = async (req, res) => {
    try {
        let form = {
            code: req.body.code
        };

        const errors = validationResult(req);

        /** Displays Errors */
        if (!errors.isEmpty()) {
            return res.render("includes/searchPAX", {
                action: "/manpower/status",
                heading: "Status after Manpower",
                errors: errors.array(),
                form: form
            });
        }
        let query = { company: req.user.company, code: req.body.code };
        let pax = await PAXModel.findOne(query);

        /** Finds PAX Code */
        if (pax) {
            let manpower = await ManpowerModel.findOne({ company: req.user.company, pax: pax._id });
            /** Finds Manpower information of the PAX */
            if (manpower && manpower.ready == 1) {
                res.redirect("/manpower/status/" + manpower._id);
            }
            else {
                req.flash("error", "Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
                res.redirect("/manpower/status");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/manpower/status");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets Manpower Status Registration Page */
exports.getRegisterManpowerStatus = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let manpower = await ManpowerModel.findById(req.params.id).exec();
        /** Finds TC information of the PAX */
        if (manpower) {
            let pax = await PAXModel.findOne({ _id: manpower.pax, company: req.user.company }).populate("supplier").populate("group").exec();
            let url = s3GetFile(req, "/pax/" + pax.code + "/manpower/", manpower.card_photo);

            res.render("manpower/status", {
                manpower: manpower,
                pax: pax,
                action: "/manpower/status",
                heading: "Status after Manpower",
                moment: moment,
                imageUrl: url
            });
        }
        else {
            req.flash("error", "Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
            res.redirect("/manpower/status");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Manpower Status */
exports.postRegisterManpowerStatus = async (req, res) => {
    try {
        let forms = {
            clearance: req.body.clearance,
            card_no: req.body.card_no,
        };

        let query = { _id: req.params.id, company: req.user.company };
        let manpower = await ManpowerModel.findOne(query).lean();
        let pax = await PAXModel.findOne({ _id: manpower.pax, company: req.user.company }).populate("supplier").populate("group").exec();
        let url = s3GetFile(req, "/pax/" + pax.code + "/manpower/", manpower.card_photo);

        let errors = validationResult(req);
        let fileError;
        /** Checks Whether any file is uploaded */
        if (typeof paxManpower !== "undefined" && req.fileValidationError == null) {
            forms.card_photo = paxManpower;
        }

        if (!manpower.card_photo && !forms.card_photo) {
            fileError = "Card Photo is required";
        }
        else if (req.fileValidationError) {
            fileError = req.fileValidationError;
        }

        if (!errors.isEmpty() || fileError) {
            return res.render("manpower/status", {
                manpower: manpower,
                pax: pax,
                action: "/manpower/status",
                heading: "Status after Manpower",
                errors: errors.array(),
                fileError: fileError,
                form: forms,
                moment: moment,
                imageUrl: url
            });
        }



        let manpowerStatus;

        if (manpower) {

            let newManpower = {};
            newManpower.clearance_date = forms.clearance;
            newManpower.card_no = forms.card_no;

            if (forms.card_photo) {

                if (forms.card_photo != manpower.card_photo)
                    s3DeleteFile(req, "/pax/" + pax.code + "/manpower/", manpower.card_photo);

                newManpower.card_photo = forms.card_photo;
            }
            await createdEvents(req, manpower, newManpower, "manpower");
            newManpower.updated_at = Date.now();
            manpowerStatus = await ManpowerModel.updateOne({ _id: manpower._id }, newManpower);

        }


        if (manpowerStatus) {
            req.flash("success", "Manpower Information saved");
            res.redirect("/manpower/status/" + req.params.id);
        }
        else {
            req.flash("danger", "Something went wrong");
            res.redirect("/manpower/status");
        }

    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Deletes Manpower Info */
exports.deleteManpower = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let manpower = await ManpowerModel.findOne(query).populate("pax", "code").exec();

        let flight = await FlightModel.findOne({ company: req.user.company, pax: manpower.pax });

        if (!flight && manpower) {

            s3DeleteFile(req, "/pax/" + manpower.pax.code + "/manpower/", manpower.card_photo);


            let manpowerDelete = await ManpowerModel.deleteOne(query);

            if (manpowerDelete) {
                req.flash("danger", "Manpower Deleted");
                res.redirect("/manpower");
            }
            else {
                req.flash("danger", "Something Went Wrong");
                res.redirect("/manpower");
            }
        } else {
            req.flash("danger", "Flight information needs to be deleted first");
            res.redirect("/manpower");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/**
 * Shows Timeline of Manpower
 */

exports.manpowerTimeline = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let manpower = await ManpowerModel.findOne(query).populate("pax", "code").exec();
        if (manpower) {
            res.render("includes/timeline", {
                paxStage: manpower,
                stageName: "Manpower",
                moment: moment
            });
        }
        else {
            req.flash("danger", "No Data Found");
            return res.redirect("/manpower");
        }
    } catch (error) {
        console.log(error);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
};
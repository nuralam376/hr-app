/** PAX Model */
const PAXModel = require("../models/userModel");
/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** TC Model */
const TCModel = require("../models/tcModel");

/** Manpower Model */
const ManpowerModel = require("../models/manpowerModel");

/** Validation */
const { validationResult } = require("express-validator/check");

/** S3 Delete File */
const s3DeleteFile = require("../util/deleteS3File");

/** Created Events Module */
const createdEvents = require("../util/paxStageEvents");

const moment = require("moment-timezone");

const config = require("../config/s3");

const aws = require("aws-sdk");
/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region: "ap-south-1"
});

/** Initialize Multer storage Variable for file upload */

const s3 = new aws.S3();

const fs = require("fs");
const path = require("path");

/** Gets All Infos */
exports.getAllInfos = async (req, res) => {
    try {
        let tcs = await TCModel.find({ company: req.user.company }).sort({ created_at: -1 }).populate("pax").exec();

        res.render("tc/index", {
            tcs: tcs,
            moment: moment
        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Search TC by PAX Code */
exports.getSearch = async (req, res) => {
    try {
        res.render("tc/searchPAX", {
            searchStage: "TC Registration"
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
            return res.render("tc/searchPAX", {
                errors: errors.array(),
                form: form,
                searchStage: "TC Registration"
            });
        }
        let query = { company: req.user.company, code: req.body.code };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        /** Finds PAX Code */
        if (pax) {
            let stamping = await StampingModel.findOne({ company: req.user.company, pax: pax._id }).exec();


            /** Finds MOFA information of the PAX */
            if (stamping && stamping.stamping_date) {
                res.redirect("/tc/search/" + pax._id);
            }
            else {
                req.flash("error", "Stamping Information is needed.Go to <a href = '/stamping'>Stamping</a> Section");
                res.redirect("/tc/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/tc/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets TC Registration Page */
exports.registerTC = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).exec();

        if (pax) {
            let stamping = await StampingModel.findOne({ company: req.user.company, pax: pax._id }).exec();
            let tc = await TCModel.findOne({ company: req.user.company, pax: pax._id }).exec();
            /** Finds MOFA information of the PAX */
            if (stamping && stamping.stamping_date) {
                res.render("tc/register", {
                    pax: pax,
                    tc: tc,
                    searchStage: "TC Registration"

                });
            }
            else {
                req.flash("error", "Stamping Information is needed.Go to <a href = '/mofa'>Stamping</a> Section");
                res.redirect("/tc/search");
            }
        }
        else {
            req.flash("danger", "PAX Not Found");
            res.redirect("/tc/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts TC Registration */
exports.postTC = async (req, res) => {
    try {
        let forms = {
            tc_received: req.body.tc_received || 0,
            finger: req.body.finger || 0
        };
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();
        let stamping = await StampingModel.findOne({ company: req.user.company, pax: pax._id });
        let tc = await TCModel.findOne({ company: req.user.company, pax: req.params.id }).exec();

        if (req.fileValidationError) {
            return res.render("tc/register", {
                pax: pax,
                tc: tc,
                fileError: "File must be in pdf format",
                searchStage: "TC Registration"
            });
        }
        /** Checks whether any file is uploaded */
        if (typeof paxTcPdf !== "undefined" && req.fileValidationError == null) {
            forms.tc_pdf = paxTcPdf;
        }

        if (pax && stamping.stamping_date) {

            let tcStatus;
            if (tc) {
                let newTc = {};
                newTc.tc_received = forms.tc_received;
                newTc.tc_pdf = forms.tc_pdf;
                newTc.finger = forms.finger;
                if (tc.tc_pdf != forms.tc_pdf) {
                    /** Removes the old file */
                    s3DeleteFile(req, "/pax/" + pax.code + "/tc/", tc.tc_pdf);
                }
                await createdEvents(req, tc, newTc, "tc");
                newTc.updated_at = Date.now();
                tcStatus = await TCModel.updateOne({ _id: tc._id }, newTc);
            }
            else {
                let newTc = new TCModel();
                newTc.tc_received = forms.tc_received;
                newTc.finger = forms.finger;
                newTc.tc_pdf = forms.tc_pdf;
                newTc.pax = req.params.id;
                newTc.company = req.user.company;
                /** TC Status */
                let tcEventStatus = {
                    type: "tc_information_saved",
                    display_name: "TC Information Saved",
                    description: `${req.user.name} saved TC of ${pax.name}`,
                    time: Date.now()
                };

                newTc.events.push(tcEventStatus);
                newTc.created_at = Date.now();
                tcStatus = await newTc.save();
            }

            if (tcStatus) {
                req.flash("success", "TC Information saved");
                res.redirect("/tc/search/" + req.params.id);
            }
            else {
                req.flash("danger", "Something went wrong");
                res.redirect("/tc/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/tc/search");
        }

    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Downloads TC PDF */
exports.downloadTC = async (req, res) => {
    try {
        let tc = await TCModel.findById(req.params.id).populate("pax", "code").exec();

        if (tc) {
            let params = {
                Bucket: "hr-app-test",
                Key: tc.company + "/pax/" + tc.pax.code + "/tc/" + tc.tc_pdf
            };
            var fileStream = s3.getObject(params).createReadStream();
            fileStream.pipe(res);
        }
        else {
            req.flash("danger", "TC Not found");
            res.redirect("/tc");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Deletes TC Data */
exports.deleteTc = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let tc = await TCModel.findOne(query).populate("pax", "code");

        let manpower = await ManpowerModel.findOne({ company: req.user.company, pax: tc.pax });

        if (!manpower && tc) {
            if (tc.tc_pdf) {

                s3DeleteFile(req, "/pax/" + tc.pax.code + "/tc/", tc.tc_pdf);
            }


            let tcDelete = await TCModel.deleteOne(query);

            if (tcDelete) {
                req.flash("danger", "TC Deleted");
                res.redirect("/tc");
            }
            else {
                req.flash("danger", "Something Went Wrong");
                res.redirect("/tc");
            }
        } else {
            req.flash("danger", "Manpower information needs to be deleted first");
            res.redirect("/tc");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/**
 * Shows Timeline of TC
 */

exports.tcTimeline = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let tc = await TCModel.findOne(query).populate("pax", "code").exec();
        if (tc) {
            res.render("includes/timeline", {
                paxStage: tc,
                stageName: "TC",
                moment: moment
            });
        }
        else {
            req.flash("danger", "No Data Found");
            return res.redirect("/tc");
        }
    } catch (error) {
        console.log(error);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
};
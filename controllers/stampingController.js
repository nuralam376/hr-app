/** PAX Model */
const PAXModel = require("../models/userModel");
/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Mofa Model */
const MofaModel = require("../models/mofaModel");


/** TC Model */
const TCModel = require("../models/tcModel");

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
        let stampings = await StampingModel.find({ company: req.user.company }).sort({ created_at: -1 }).populate("pax").exec();

        let newStampings = stampings.map(stamping => {

            let url = s3GetFile(req, "/pax/" + stamping.pax.code + "/stamping/", stamping.pc_image);

            stamping["imageUrl"] = url;

            return stamping;
        });

        res.render("stamping/index", {
            stampings: newStampings,
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
        res.render("stamping/searchPAX", {
            searchStage: "Stamping Registration"
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
            return res.render("stamping/searchPAX", {
                errors: errors.array(),
                form: form,
                searchStage: "Stamping Registration"

            });
        }
        let query = { company: req.user.company, code: req.body.code };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        /** Finds PAX Code */
        if (pax) {
            let mofa = await MofaModel.findOne({ company: req.user.company, pax: pax._id, }).populate("group").exec();


            /** Finds MOFA information of the PAX */
            if (mofa && mofa.e_number) {
                res.redirect("/stamping/search/" + pax._id);
            }
            else {
                req.flash("error", "MOFA Information is needed.Go to <a href = '/mofa'>MOFA</a> Section");
                res.redirect("/stamping/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/stamping/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets Stamping Registration Page */
exports.registerStamping = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();

        if (pax) {
            let mofa = await MofaModel.findOne({ company: req.user.company, pax: pax._id }).populate("group").exec();
            let stamping = await StampingModel.findOne({ company: req.user.company, pax: pax._id, }) || undefined;
            /** Finds MOFA information of the PAX */
            if (mofa && mofa.e_number) {
                let url;
                if (stamping && stamping.pc_image)
                    url = s3GetFile(req, "/pax/" + pax.code + "/stamping/", stamping.pc_image);
                else
                    url = null;


                res.render("stamping/register", {
                    pax: pax,
                    stamping: stamping,
                    mofa: mofa,
                    imageUrl: url,
                    searchStage: "Stamping Registration"

                });
            }
            else {
                req.flash("error", "MOFA Information is needed.Go to <a href = '/mofa'>MOFA</a> Section");
                res.redirect("/stamping/search");
            }
        }
        else {
            req.flash("danger", "PAX Not Found");
            res.redirect("/stamping/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Stamping Registration */
exports.postStamping = async (req, res) => {
    try {
        let forms = {
            status: req.body.status
        };
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).populate("supplier").exec();
        let mofa = await MofaModel.findOne({ company: req.user.company, pax: pax._id }).populate("group").exec();
        let stamping = await StampingModel.findOne({ company: req.user.company, pax: pax._id }).lean() || undefined;
        /** Checks whetere any file is uploaded */
        if (typeof paxPcImage !== "undefined" && req.fileValidationError == null) {

            forms.pc_image = paxPcImage;


            if (pax) {
                let stampingStatus;
                if (stamping) {
                    let newStamping = {};
                    newStamping.status = forms.status;
                    newStamping.pc_image = forms.pc_image;
                    /** Removes the old file */
                    if (stamping.pc_image != forms.pc_image)
                        s3DeleteFile(req, "/pax/" + pax.code + "/stamping/", stamping.pc_image);
                    await createdEvents(req, stamping, newStamping, "stamping");
                    stampingStatus = await StampingModel.updateOne({ _id: stamping._id }, newStamping);
                }
                else {
                    let newStamping = new StampingModel();
                    newStamping.status = forms.status;
                    newStamping.pc_image = forms.pc_image;
                    newStamping.company = req.user.company;
                    newStamping.pax = req.params.id;
                    /** Stamping Status */
                    let stampingEventStatus = {
                        type: "stamping_information_saved",
                        display_name: "Stamping Information Saved",
                        description: `${req.user.name} saved Stamping of ${pax.name}`,
                        time: Date.now()
                    };

                    newStamping.events.push(stampingEventStatus);
                    stampingStatus = await newStamping.save();
                }

                if (stampingStatus) {
                    req.flash("success", "Stamping Information saved");
                    res.redirect("/stamping/search/" + req.params.id);
                }
                else {
                    req.flash("danger", "Something went wrong");
                    res.redirect("/medical/search");
                }
            }
            else {
                req.flash("error", "PAX Not Found");
                res.redirect("/stamping/search");
            }
        }
        else {
            res.render("stamping/register", {
                pax: pax,
                mofa: mofa,
                stamping: stamping,
                fileError: "Image is required"
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets Stamping Complete Page */
exports.getCompleteStampingSearch = async (req, res) => {
    try {
        res.render("stamping/afterStampingSearch", {
            searchStage: "After Stamping Registration"
        });
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Posts Complete Stamping Search */
exports.postStampingCompleteSearch = async (req, res) => {
    try {
        let form = {
            code: req.body.code
        };
        let query = { company: req.user.company, code: req.body.code };
        let pax = await PAXModel.findOne(query).exec();
        if (pax) {
            let stamping = await StampingModel.findOne({ pax: pax._id }).exec();

            if (stamping) {
                res.redirect("/stamping/completeregistration/" + stamping._id);
            }
            else {
                req.flash("danger", "Stamping Information is needed. Go to <a href = '/stamping/search'>Stamping</a> section");
                res.redirect("/stamping/completesearch");
            }
        }
        else {
            req.flash("danger", "PAX Not Found");
            res.redirect("/stamping/completesearch");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Gets Stamping Complete Registration Page */
exports.getCompleteRegistration = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let stamping = await StampingModel.findById(query).populate("pax").exec();
        let mofa = await MofaModel.findOne({ company: req.user.company, pax: stamping.pax._id }).populate("pax").populate("group").exec();
        if (stamping) {
            res.render("stamping/afterStampingRegistration", {
                stamping: stamping,
                mofa: mofa,
                moment: moment,
                searchStage: "After Stamping Registration"
            });
        }
        else {
            req.flash("danger", "Stamping Not Found");
            res.redirect("/stamping/completesearch");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Posts Complete Stamping Registrtation */
exports.postCompleteStampingRegistration = async (req, res) => {
    try {
        let form = {
            visa_no: req.body.visa_no,
            stamping_date: req.body.stamping_date
        };

        let errors = validationResult(req);

        let query = { _id: req.params.id, company: req.user.company };
        let stamping = await StampingModel.findOne(query).populate("pax").exec();
        let mofa = await MofaModel.findOne({ company: req.user.company, pax: stamping.pax._id }).populate("group").exec();
        if (!errors.isEmpty()) {
            res.render("stamping/afterStampingRegistration", {
                stamping: stamping,
                mofa: mofa,
                errors: errors.array(),
                form: form,
                moment: moment,
                searchStage: "After Stamping Registration"
            });
        }
        else {
            let stampingStatus;

            // Updates Stamping Information
            let newStamping = {};
            newStamping.visa_no = form.visa_no;
            newStamping.stamping_date = form.stamping_date;
            await createdEvents(req, stamping, newStamping, "stamping");
            newStamping.updated_at = Date.now();
            stampingStatus = await StampingModel.updateOne({ _id: stamping._id }, newStamping);


            if (stampingStatus) {
                req.flash("success", "Stamping information has been updated");
                res.redirect("/stamping/completeregistration/" + stamping._id);
            }
            else {
                req.flash("danger", "Something went wrong");
                res.redirect("/stamping/completesearch");
            }
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/** Deletes Stamping Data */
exports.deleteStamping = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let stamping = await StampingModel.findOne(query).populate("pax", "code");

        let tc = await TCModel.findOne({ company: req.user.company, pax: stamping.pax });

        if (!tc && stamping) {

            s3DeleteFile(req, "/pax/" + stamping.pax.code + "/stamping/", stamping.pc_image);

            let stampingDelete = await StampingModel.deleteOne(query);

            if (stampingDelete) {
                req.flash("danger", "Stamping Deleted");
                res.redirect("/stamping");
            }
            else {
                req.flash("danger", "Something Went Wrong");
                res.redirect("/stamping");
            }
        } else {
            req.flash("danger", "TC information needs to be deleted first");
            res.redirect("/stamping");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
}

/**
 * Shows Timeline of Stamping
 */

exports.stampingTimeline = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let stamping = await StampingModel.findOne(query).populate("pax", "code").exec();
        if (stamping) {
            res.render("includes/timeline", {
                paxStage: stamping,
                stageName: "Stamping",
                moment: moment
            });
        }
        else {
            req.flash("danger", "No Data Found");
            return res.redirect("/stamping");
        }
    } catch (error) {
        console.log(error);
        res.status(422).send("<h1>500,Internal Server Error</h1>");

    }
};
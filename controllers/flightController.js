/** PAX Model */
const PAXModel = require("../models/userModel");
/** Flight Model */
const FlightModel = require("../models/flightModel");

/** Manpower Model */
const ManpowerModel = require("../models/manpowerModel");

/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Zone Model */
const ZoneModel = require("../models/zoneModel");

/** Group Model */
const GroupModel = require("../models/groupModel");

/** Created Events Module */
const createdEvents = require("../util/paxStageEvents");

/** Validation */
const { validationResult } = require("express-validator/check");

const moment = require("moment-timezone");

const fs = require("fs");

/** Gets All Infos */
exports.getAllInfos = async (req, res) => {
    try {
        let flights = await FlightModel.find({ company: req.user.company }).populate("pax").exec();

        res.render("flight/index", {
            flights: flights.reverse(),
            moment: moment
        });
    }
    catch (err) {
        console.log(err);
    }
}

/** Search Stamping by PAX Code */
exports.getSearch = async (req, res) => {
    try {
        res.render("includes/searchPAX", {
            action: "/flight/search",
            heading: "Flight Requisition"
        });
    }
    catch (err) {
        console.log(err);
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
            return res.render("includes/searchPAX", {
                errors: errors.array(),
                action: "/flight/search",
                heading: "Flight Requisition",
                form: form
            });
        }
        let query = { code: req.body.code, company: req.user.company };
        let pax = await PAXModel.findOne(query).exec();

        /** Finds PAX Code */
        if (pax) {
            let manpower = await ManpowerModel.findOne({ pax: pax._id, company: req.user.company });


            /** Finds MOFA information of the PAX */
            if (manpower && manpower.card_no) {
                res.redirect("/flight/requisition/" + pax._id);
            }
            else {
                req.flash("error", "Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
                res.redirect("/flight/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/flight/search");
        }
    }
    catch (err) {
        console.log(err);
    }
}

/** Gets Flight Registration Page */
exports.registerRequisition = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier", "_id name").populate("group", "_id group_seq group_sl zone").exec();
        let zones = await ZoneModel.find({ company: req.user.company });

        if (pax) {

            let manpower = await ManpowerModel.findOne({ pax: pax._id, company: req.user.company }).select("clearance_date card_no").exec();
            let stamping = await StampingModel.findOne({ pax: pax._id, company: req.user.company }).select(" stamping_date").exec();
            /** Finds Manpower information of the PAX */
            if (manpower && manpower.card_no) {
                let flight = await FlightModel.findOne({ pax: pax._id });
                res.render("flight/register", {
                    pax: pax,
                    manpower: manpower,
                    stamping: stamping,
                    action: "/flight/search",
                    heading: "Flight Requisition",
                    moment: moment,
                    zones: zones,
                    flight: flight
                });
            }
            else {
                req.flash("error", "Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
                res.redirect("/flight/search");
            }
        }
        else {
            req.flash("danger", "PAX Not Found");
            res.redirect("/flight/search");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Flight Requisition Information */
exports.postRequisition = async (req, res) => {
    try {
        let forms = {
            zone: req.body.zone,
            probable_date: req.body.probable_date,
            probable_airlines: req.body.probable_airlines
        };

        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier", "_id name").populate("group", "_id group_seq group_sl zone").exec();

        let manpower = await ManpowerModel.findOne({ pax: pax._id, company: req.user.company }).select("clearance_date card_no").exec();
        let errors = validationResult(req);

        if (manpower && manpower.card_no) {
            let flight = await FlightModel.findOne({ pax: pax._id }).lean();
            let zones = await ZoneModel.find({ company: req.user.company });
            let stamping = await StampingModel.findOne({ pax: pax._id, company: req.user.company }).select(" stamping_date").exec();
            let flightStatus;
            if (!errors.isEmpty()) {
                return res.render("flight/register", {
                    pax: pax,
                    manpower: manpower,
                    stamping: stamping,
                    action: "/flight/search",
                    heading: "Flight Requisition",
                    moment: moment,
                    zones: zones,
                    flight: flight,
                    errors: errors.array(),
                    form: forms
                });
            }
            if (flight) {
                let newFlight = {};
                newFlight.probable_date = forms.probable_date;
                newFlight.probable_airlines = forms.probable_airlines;
                newFlight.zone = forms.zone;
                await createdEvents(req, flight, newFlight, "flight");
                newFlight.updated_at = Date.now();
                flightStatus = await FlightModel.updateOne({ _id: flight._id }, newFlight);
            }
            else {
                let newFlight = new FlightModel();
                newFlight.probable_date = forms.probable_date;
                newFlight.probable_airlines = forms.probable_airlines;
                newFlight.zone = forms.zone;
                newFlight.pax = req.params.id;
                newFlight.company = req.user.company;
                /** Flight Status */
                let flightEventStatus = {
                    type: "flight_information_saved",
                    display_name: "Flight Information Saved",
                    description: `${req.user.name} saved Flight of ${pax.name}`,
                    time: Date.now()
                };
                newFlight.events.push(flightEventStatus);
                newFlight.created_at = Date.now();
                flightStatus = await newFlight.save();
            }

            if (!pax.group.zone.equals(forms.zone)) {

                let newZone = {};
                newZone.zone = forms.zone;
                await GroupModel.updateOne({ _id: pax.group._id }, newZone);
            }

            if (flightStatus) {
                req.flash("success", "Flight Information saved");
                res.redirect("/flight/requisition/" + req.params.id);
            }
            else {
                req.flash("danger", "Something went wrong");
                res.redirect("/flight/search");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/flight/search");
        }

    }
    catch (err) {
        console.log(err);
    }
}

/** Search Flight by PAX Code */
exports.getReportSearch = async (req, res) => {
    try {
        res.render("includes/searchPAX", {
            action: "/flight/report",
            heading: "Flight Report"
        });
    }
    catch (err) {
        console.log(err);
    }
}

/** Gets PAX Information */
exports.postReportSearch = async (req, res) => {
    try {
        let form = {
            code: req.body.code
        };

        const errors = validationResult(req);

        /** Displays Errors */
        if (!errors.isEmpty()) {
            return res.render("includes/searchPAX", {
                errors: errors.array(),
                action: "/flight/report",
                heading: "Flight Report",
                form: form
            });
        }
        let query = { code: req.body.code, company: req.user.company };
        let pax = await PAXModel.findOne(query).exec();

        /** Finds PAX Code */
        if (pax) {
            let flight = await FlightModel.findOne({ pax: pax._id, company: req.user.company });


            /** Finds Flight information of the PAX */
            if (flight && flight.probable_date) {
                res.redirect("/flight/report/" + pax._id);
            }
            else {
                req.flash("error", "Flight Information is needed.Go to <a href = '/flight'>Flight</a> Section");
                res.redirect("/flight/report");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/flight/report");
        }
    }
    catch (err) {
        console.log(err);
    }
}

/** Gets Flight Registration Page */
exports.registerReport = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier", "_id name").populate("group", "_id group_seq group_sl zone").exec();

        if (pax) {

            let manpower = await ManpowerModel.findOne({ pax: pax._id, company: req.user.company }).select("clearance_date card_no").exec();
            let stamping = await StampingModel.findOne({ pax: pax._id, company: req.user.company }).select(" stamping_date").exec();
            let flight = await FlightModel.findOne({ pax: pax._id, company: req.user.company }).populate("zone").exec();
            /** Finds flight information of the PAX */
            if (flight && flight.probable_date) {
                res.render("flight/report", {
                    pax: pax,
                    manpower: manpower,
                    stamping: stamping,
                    flight: flight,
                    action: "/flight/report",
                    heading: "Flight Report",
                    moment: moment,
                });
            }
            else {
                req.flash("error", "Flight Information is needed.Go to <a href = '/flight'>Flight</a> Section");
                res.redirect("/flight/report");
            }
        }
        else {
            req.flash("danger", "PAX Not Found");
            res.redirect("/flight/report");
        }
    }
    catch (err) {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Flight Ready Status */
exports.postReport = async (req, res) => {
    try {
        let forms = {
            flight_date: req.body.flight_date,
            flight_airlines: req.body.flight_airlines,
            price: req.body.price
        };

        let query = { _id: req.params.id, company: req.user.company };
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier", "_id name").populate("group", "_id group_seq group_sl zone").exec();

        let manpower = await ManpowerModel.findOne({ pax: pax._id, company: req.user.company }).select("clearance_date card_no").exec();
        let flight = await FlightModel.findOne({ pax: pax._id }).populate("zone").lean();
        let errors = validationResult(req);

        if (flight && flight.probable_date) {
            let stamping = await StampingModel.findOne({ pax: pax._id, company: req.user.company }).select(" stamping_date").exec();
            let flightStatus;
            if (!errors.isEmpty()) {
                return res.render("flight/report", {
                    pax: pax,
                    manpower: manpower,
                    stamping: stamping,
                    action: "/flight/report",
                    heading: "Flight Report",
                    moment: moment,
                    flight: flight,
                    errors: errors.array(),
                    form: forms
                });
            }
            if (flight) {
                let newFlight = {};
                newFlight.flight_date = forms.flight_date;
                newFlight.flight_airlines = forms.flight_airlines;
                newFlight.price = forms.price;
                await createdEvents(req, flight, newFlight, "flight");
                newFlight.updated_at = Date.now();
                flightStatus = await FlightModel.updateOne({ _id: flight._id }, newFlight);
            }


            if (flightStatus) {
                req.flash("success", "Flight Information saved");
                res.redirect("/flight/report/" + req.params.id);
            }
            else {
                req.flash("danger", "Something went wrong");
                res.redirect("/flight/report");
            }
        }
        else {
            req.flash("error", "PAX Not Found");
            res.redirect("/flight/report");
        }

    }
    catch (err) {
        console.log(err);
    }
}

/** Deletes Flight Info */
exports.deleteFlight = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let flight = await FlightModel.findOne(query);

        if (flight) {
            let flightDelete = await FlightModel.deleteOne(query);

            if (flightDelete) {
                req.flash("danger", "Flight Deleted");
                res.redirect("/flight");
            }
            else {
                req.flash("danger", "Something Went Wrong");
                res.redirect("/flight");
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

/**
 * Shows Timeline of Flight
 */

exports.flightTimeline = async (req, res) => {
    try {
        let query = { _id: req.params.id, company: req.user.company };

        let flight = await FlightModel.findOne(query).populate("pax", "code").exec();
        if (flight) {
            res.render("includes/timeline", {
                paxStage: flight,
                stageName: "Flight",
                moment: moment
            });
        }
        else {
            req.flash("danger", "No Data Found");
            return res.redirect("/flight");
        }
    } catch (error) {
        console.log(error);
    }
};
/** PAX Model */
const PAXModel = require("../models/userModel");

/** Flight Model */
const DeliveryModel = require("../models/deliveryModel");

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

/** Validation */
const {validationResult} = require("express-validator/check");

const moment = require("moment-timezone");

const fs = require("fs");

/** Gets All Infos */
exports.getAllInfos = async(req,res) => {
    try
    {
        let deliveries = await DeliveryModel.find({company : req.user.company}).populate("pax").exec();
       
        res.render("delivery/index",{
            deliveries : deliveries.reverse(),
            moment : moment
        });
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Search Stamping by PAX Code */
exports.getSearch = async(req,res) => {
    try
    {
        res.render("includes/searchPAX",{
            action : "/delivery/search",
            heading : "Delivery Report"
        });
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
            return res.render("includes/searchPAX",{
                errors : errors.array(),
                action : "/delivery/search",
                heading : "Delivery Report",
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query).exec();

        /** Finds PAX Code */
        if(pax)
        {
            let flight = await FlightModel.findOne({pax : pax._id,company : req.user.company});
          

            /** Finds Flight information of the PAX */
            if(flight && flight.flight_date)
            {
                res.redirect("/delivery/report/"+pax._id);
            }
            else
            {
                req.flash("error","Flight Information is needed.Go to <a href = '/flight'>Flight</a> Section");
                res.redirect("/delivery/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/delivery/report");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Delivery Registration Page */
exports.registerReport = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier","_id name").populate("group","_id group_seq group_sl zone").exec();
    
        if(pax)
        {
            let delivery = await DeliveryModel.findOne({pax : pax._id, company: req.user.company}).exec();
            let flight = await FlightModel.findOne({pax : pax._id, company: req.user.company}).exec();
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}).select("stamping_date").exec();
            let manpower = await ManpowerModel.findOne({pax : pax._id,company : req.user.company}).select("clearance_date").exec();
           /** Finds Flight information of the PAX */
           if(flight && flight.flight_date)
           {
               let flight = await FlightModel.findOne({pax : pax._id});
               res.render("delivery/report",{
                   pax : pax,
                   manpower : manpower,
                   stamping : stamping,
                   action : "/flight/search",
                   heading : "Flight Requisition",
                   moment : moment,
                   flight : flight,
                   delivery : delivery,
               });
           }
           else
           {
            req.flash("error","Flight Information is needed.Go to <a href = '/flight'>Flight</a> Section");
            res.redirect("/delivery/report");
           }
        }
        else
        {
            req.flash("danger","PAX Not Found");
            res.redirect("/delivery/report");
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Delivery Report Information */
exports.postReport = async(req,res) => {
    try
    {
        let forms = {
            received_by : req.body.received_by,
        };

        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier","_id name").populate("group","_id group_seq group_sl zone").exec();
        let flight = await FlightModel.findOne({pax : pax._id});
        let errors = validationResult(req);
        
        if(flight && flight.flight_date)
        {
            let manpower = await ManpowerModel.findOne({pax : pax._id, company: req.user.company}).select("clearance_date card_no").exec();
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}).select(" stamping_date").exec();
            let delivery = await DeliveryModel.findOne({pax : pax._id,company : req.user.company}).exec();
            let deliveryStatus;
            if(!errors.isEmpty())
            {
                return res.render("delivery/report",{
                    pax : pax,
                    manpower : manpower,
                    stamping : stamping,
                    action : "/delivery/report",
                    heading : "Delivery Report",
                    moment : moment,
                    flight : flight,
                    errors : errors.array(),
                    form : forms
                });
            }
            if(delivery)
            {
                let newDelivery = {};
                newDelivery.received_by = forms.received_by;
                newDelivery.updated_at = Date.now();
                deliveryStatus = await DeliveryModel.updateOne({_id : delivery._id},newDelivery);
            }
            else
            {
                let newDelivery = new DeliveryModel();
                newDelivery.received_by = forms.received_by;
                newDelivery.pax = req.params.id;
                newDelivery.company = req.user.company;
                deliveryStatus = await newDelivery.save();
            }

            if(deliveryStatus)
            {
                req.flash("success","Delivery Information saved");
                res.redirect("/delivery/report/"+req.params.id);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/delivery/report");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/delivery/report");
        }
      
    }
    catch(err)
    {
        console.log(err);
    }
}
/** PAX Model */
const PAXModel = require("../models/userModel");
/** Flight Model */
const FlightModel = require("../models/flightModel");

/** Manpower Model */
const ManpowerModel = require("../models/manpowerModel");

/** Stamping Model */
const StampingModel = require("../models/stampingModel");

/** Stamping Model */
const ZoneModel = require("../models/zoneModel");

/** Stamping Model */
const GroupModel = require("../models/groupModel");

/** Validation */
const {validationResult} = require("express-validator/check");

const moment = require("moment-timezone");

const fs = require("fs");

/** Gets All Infos */
exports.getAllInfos = async(req,res) => {
    try
    {
        let flights = await FlightModel.find({company : req.user.company}).populate("pax").exec();
       
        res.render("flight/index",{
            flights : flights.reverse(),
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
            action : "/flight/search",
            heading : "Flight Requisition"
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
                action : "/flight/search",
                heading : "Flight Requisition",
                form : form
            });
        }
        let query = {code : req.body.code,company : req.user.company};
        let pax = await PAXModel.findOne(query).exec();

        /** Finds PAX Code */
        if(pax)
        {
            let manpower = await ManpowerModel.findOne({pax : pax._id,company : req.user.company});
          

            /** Finds MOFA information of the PAX */
            if(manpower && manpower.card_no)
            {
                res.redirect("/flight/requisition/"+pax._id);
            }
            else
            {
                req.flash("error","Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
                res.redirect("/flight/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/flight/search");
        }
    }
    catch(err)
    {
        console.log(err);
    }
}

/** Gets Manpower Registration Page */
exports.registerRequisition = async(req,res) => {
    try
    {
        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier","_id name").populate("group","_id group_seq group_sl zone").exec();
        let zones = await ZoneModel.find({});
    
        if(pax)
        {
            
            let manpower = await ManpowerModel.findOne({pax : pax._id, company: req.user.company}).select("clearance_date card_no").exec();
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}).select(" stamping_date").exec();
           /** Finds Manpower information of the PAX */
           if(manpower && manpower.card_no)
           {
               let flight = await FlightModel.findOne({pax : pax._id});
               res.render("flight/register",{
                   pax : pax,
                   manpower : manpower,
                   stamping : stamping,
                   action : "/flight/search",
                   heading : "Flight Requisition",
                   moment : moment,
                   zones : zones,
                   flight : flight
               });
           }
           else
           {
            req.flash("error","Manpower Information is needed.Go to <a href = '/manpower'>Manpower</a> Section");
            res.redirect("/flight/search");
           }
        }
        else
        {
            req.flash("danger","PAX Not Found");
            res.redirect("/flight/search");
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(422).send("500,Internal Server Error");
    }
}

/** Posts Manpower Ready Status */
exports.postRequisition = async(req,res) => {
    try
    {
        let forms = {
            zone : req.body.zone,
            probable_date : req.body.probable_date,
            probable_airlines : req.body.probable_airlines
        };

        let query = {_id : req.params.id,company : req.user.company};
        let pax = await PAXModel.findOne(query).select("_id name passport supplier group").populate("supplier","_id name").populate("group","_id group_seq group_sl zone").exec();
      
        let manpower = await ManpowerModel.findOne({pax : pax._id, company: req.user.company}).select("clearance_date card_no").exec();
        let errors = validationResult(req);

        if(manpower && manpower.card_no)
        {
            let flight = await FlightModel.findOne({pax : pax._id});
            let zones = await ZoneModel.find({});
            let stamping = await StampingModel.findOne({pax : pax._id,company : req.user.company}).select(" stamping_date").exec();
            let flightStatus;
            if(!errors.isEmpty())
            {
                return res.render("flight/register",{
                    pax : pax,
                    manpower : manpower,
                    stamping : stamping,
                    action : "/flight/search",
                    heading : "Flight Requisition",
                    moment : moment,
                    zones : zones,
                    flight : flight,
                    errors : errors.array(),
                    form : forms
                });
            }
            if(flight)
            {
                let newFlight = {};
                newFlight.probable_date = forms.probable_date;
                newFlight.probable_airlines = forms.probable_airlines;
                newFlight.updated_at = Date.now();
                flightStatus = await FlightModel.updateOne({_id : flight._id},newFlight);
            }
            else
            {
                let newFlight = new FlightModel();
                newFlight.probable_date = forms.probable_date;
                newFlight.probable_airlines = forms.probable_airlines;
                newFlight.pax = req.params.id;
                newFlight.company = req.user.company;
                flightStatus = await newFlight.save();
            }
            
            if(! pax.group.zone.equals(forms.zone))
            {

                let newZone = {};
                newZone.zone = forms.zone;
                await GroupModel.updateOne({_id : pax.group._id},newZone);
            }

            if(flightStatus)
            {
                req.flash("success","Flight Information saved");
                res.redirect("/flight/requisition/"+req.params.id);
            }
            else
            {
                req.flash("danger","Something went wrong");
                res.redirect("/flight/search");
            }
        }
        else
        {
            req.flash("error","PAX Not Found");
            res.redirect("/flight/search");
        }
      
    }
    catch(err)
    {
        console.log(err);
    }
}
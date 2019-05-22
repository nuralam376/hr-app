/** Supplier Model Schema */
const SupplierModel = require("../models/supplierModel");

/** PAX Model Schema */
const UserModel = require("../models/userModel");

/** Group Model Schema */
const GroupModel = require("../models/groupModel");

/** Medical Model Schema */
const MedicalModel = require("../models/medicalModel");

/** MOFA Model Schema */
const MofaModel = require("../models/mofaModel");

/** Stamping Model Schema */
const StampingModel = require("../models/stampingModel");

/** TC Model Schema */
const TCModel = require("../models/tcModel");

/** Manpower Model Schema */
const ManpowerModel = require("../models/manpowerModel");

/** Flight Model Schema */
const FlightModel = require("../models/flightModel");

/** Delivery Model Schema */
const DeliveryModel = require("../models/deliveryModel");

/** Gets S3 File */
const s3GetFile = require("../util/getS3File");

exports.getDashboard = async (req, res) => {
  try {
    let totalSupplier = await SupplierModel.find({ company: req.user.company }).countDocuments();
    let totalUser = await UserModel.find({ company: req.user.company }).countDocuments();
    let totalGroup = await GroupModel.find({ company: req.user.company }).countDocuments();

    res.render("dashboard", {
      totaluser: totalUser,
      totalSupplier: totalSupplier,
      totalGroup: totalGroup
    });
  } catch (err) {
    console.log(err);
    res.status(422).send("<h1>500,Internal Server Error</h1>");

  }
};

exports.getChartAjaxData = async (req, res) => {
  try {
    let totalPAX = await getChartTotalResult(req, UserModel);
    let totalSupplier = await getChartTotalResult(req, SupplierModel);
    let totalGroup = await getChartTotalResult(req, GroupModel);

    let totals = {
      totalPAX: totalPAX,
      totalSupplier: totalSupplier,
      totalGroup: totalGroup
    };

    return res.jsonp(totals);
  } catch (err) {
    console.log(err);
    res.status(422).send("<h1>500,Internal Server Error</h1>");

  }
};

const getChartTotalResult = async (req, Model) => {
  try {
    let total = await Model.aggregate([
      {
        $match: {
          company: req.user.company
        }
      },
      {
        $project: {
          year: {
            $year: "$created_at"
          },
          month: {
            $month: "$created_at"
          }
        }
      },
      {
        $match: {
          year: new Date().getFullYear()
        }
      },
      {
        $group: {
          _id: {
            create: "$month"
          },
          total: {
            $sum: 1
          }
        }
      }
    ]);
    return total;
  } catch (err) {
    console.log(err);
    res.status(422).send("<h1>500,Internal Server Error</h1>");

  }
};


/** Gets PAX Data */
exports.getChartPaxData = async (req, res) => {
  try {
    let totalMedical = 0;
    let totalMOFA = 0;
    let totalStamping = 0;
    let totalTC = 0;
    let totalManpower = 0;
    let totalFlight = 0;
    let totalDelivery = 0;
    let paxs = await UserModel.find({ company: req.user.company });

    for (let pax of paxs) {

      query = { company: req.user.company, pax: pax._id };
      let delivery = await DeliveryModel.findOne(query);

      if (delivery && delivery.received_by) {
        totalDelivery++;

      } else {
        let flight = await FlightModel.findOne(query);

        if (flight && flight.flight_date) {
          totalFlight++;
        } else {
          let manpower = await ManpowerModel.findOne(query);

          if (manpower && manpower.card_no) {
            totalManpower++;
          } else {
            let tc = await TCModel.findOne(query);

            if (tc && tc.tc_received) {
              totalTC++;
            } else {
              let stamping = await StampingModel.findOne(query);

              if (stamping && stamping.stamping_date) {
                totalStamping++;
              } else {
                let mofa = await MofaModel.findOne(query);

                if (mofa && mofa.e_number) {
                  totalMOFA++;
                } else {
                  let medical = await MedicalModel.findOne(query);

                  if (medical && medical.status == "fit") {
                    totalMedical++;
                  }
                }
              }
            }
          }
        }
      }
    };
    let totals = [totalMedical, totalMOFA, totalStamping, totalTC, totalManpower, totalFlight, totalDelivery];

    return res.jsonp(totals);

  }
  catch (err) {
    console.log(err);
    res.status(422).send("<h1>500,Internal Server Error</h1>");

  }
}
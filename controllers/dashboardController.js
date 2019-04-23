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
    let totalSupplier = await SupplierModel.find({company:req.user.company}).countDocuments();
    let totalUser = await UserModel.find({company:req.user.company}).countDocuments();
    let totalGroup = await GroupModel.find({company:req.user.company}).countDocuments();

    res.render("dashboard", {
      totaluser: totalUser,
      totalSupplier: totalSupplier,
      totalGroup : totalGroup
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getChartAjaxData = async (req, res) => {
  try {
    let totalPAX = await getChartTotalResult(req,UserModel);
    let totalSupplier = await getChartTotalResult(req,SupplierModel);
    let totalGroup = await getChartTotalResult(req,GroupModel);

    let totals = {
      totalPAX: totalPAX,
      totalSupplier: totalSupplier,
      totalGroup: totalGroup
    };

    return res.jsonp(totals);
  } catch (err) {
    console.log(err);
  }
};

const getChartTotalResult = async (req,Model) => {
  try {
    let total = await Model.aggregate([
      {
        $match : {
          company : req.user.company
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
  }
};


/** Gets PAX Data */
exports.getChartPaxData = async(req,res) => {
  try
  {
    let totalMedical = await MedicalModel.find({company : req.user.company}).countDocuments();
    let totalMOFA = await MofaModel.find({company : req.user.company}).countDocuments();
    let totalStamping = await StampingModel.find({company : req.user.company}).countDocuments();
    let totalTC = await TCModel.find({company : req.user.company}).countDocuments();
    let totalManpower = await ManpowerModel.find({company : req.user.company}).countDocuments();
    let totalFlight = await FlightModel.find({company : req.user.company}).countDocuments();
    let totalDelivery = await DeliveryModel.find({company : req.user.company}).countDocuments();

    let totals = [totalMedical, totalMOFA, totalStamping, totalTC, totalManpower, totalFlight, totalDelivery];

    return res.jsonp(totals);
    
  }
  catch(err)
  {
    console.log(err);
  }
}
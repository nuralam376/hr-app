/** Supplier Model Schema */
const SupplierModel = require("../models/supplierModel");

/** PAX Model Schema */
const UserModel = require("../models/userModel");

/** Group Model Schema */
const GroupModel = require("../models/groupModel");

/** Gets S3 File */
const s3GetFile = require("../util/getS3File");

exports.getDashboard = async (req, res) => {
  try {
    let totalSupplier = await SupplierModel.countDocuments();
    let totalUser = await UserModel.countDocuments();

    res.render("dashboard", {
      totaluser: totalUser,
      totalSupplier: totalSupplier
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getChartData = async (req, res) => {
  try {
    let totalPAX = await getChartResult(UserModel);
    let totalSupplier = await getChartResult(SupplierModel);
    let totalGroup = await getChartResult(GroupModel);

    let totals = {
      totalPAX,
      totalSupplier,
      totalGroup
    };

    return res.jsonp(totals);
  } catch (err) {
    console.log(err);
  }
};

const getChartResult = async Model => {
  try {
    let total = await Model.aggregate([
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

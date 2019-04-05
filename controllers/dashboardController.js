
/** Supplier Model Schema */
const SupplierModel = require("../models/supplierModel");

/** Supplier Model Schema */
const UserModel = require("../models/userModel");

/** Gets S3 File */
const s3GetFile = require("../util/getS3File");

exports.getDashboard = async(req,res) => {
    try{
        let totalSupplier = await SupplierModel.countDocuments();
        let totalUser = await UserModel.countDocuments();

        

    
        res.render("dashboard",{
            totaluser : totalUser,
            totalSupplier : totalSupplier
        });
    }
    catch(err){
        console.log(err);
    }
    
}


exports.getChartData = async(req,res) => {
    try
    {
        let totalPAX = await UserModel.aggregate([
            {
                $project : {
                    _id : 0,
                    created_at : 1,
                    code : 1
                }
            },
            {
                $group : {
                    _id : {
                        create : {
                            $month : "$created_at"
                        },
                    },
                    total : {
                        $sum : 1
                    }
                }
            },
            {
                $sort : {
                    "_id.create" : 1
                }
            }
        ]);

        return res.jsonp(totalPAX);
    }
    catch(err)
    {
        console.log(err);
    }
}


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
            totalSupplier : totalSupplier,
        });
    }
    catch(err){
        console.log(err);
    }
    
}


const config = require("../config/s3");

const aws = require("aws-sdk");
/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region : "ap-south-1"
});

const s3 = new aws.S3();

/** Deletes Saved Images */
function deleteS3Object(req,path,filename)
{
    /** Removes the previous file */
    let params = {
        Bucket: "hr-app-test", 
        Key: req.user.company + path + filename
    };
    s3.deleteObject(params,(err,data) => {
        if(err)
        {
            console.log(err);
        }
    });
}

module.exports = deleteS3Object;
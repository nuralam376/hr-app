const config = require("../config/s3");

const aws = require("aws-sdk");
/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region : "ap-south-1"
});

const s3 = new aws.S3();

/** Gets Saved Images */
function getS3File(req,path,filename)
{
    let params = {
        Bucket: 'hr-app-test', 
        Key: req.user.company + path +filename,
        Expires: 60,
        ResponseCacheControl: 'no-cache',
    }
    
    let url = s3.getSignedUrl('getObject', params); 

    return url;
}

module.exports = getS3File;
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require("path");
const config = require("../config/s3");

/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region : "ap-south-1"
});

/** Initialize Multer storage Variable for file upload */

const s3 = new aws.S3();

/** Implements File upload validation */
const upload =
        multer({
        storage : multerS3({
            s3 : s3,
            bucket : "hr-app-test",
            acl: 'public-read',
            expires : Date.now() + 100,
            ServerSideEncryption : "AES256",
            metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname + "-" + Date.now() + path.extname(file.originalname)});
            },
            key: function (req, file, cb) {
                let paxCode = req.body.code;
              
                if(file.fieldname == "profile_photo")
                {
                    paxProfilePhoto = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
                    cb(null,req.user.company + "/pax/" + paxCode +"/"+ paxProfilePhoto)
                }
                if(file.fieldname == "passport_photo")
                {
                    paxPassportPhoto = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
                    cb(null,req.user.company + "/pax/" + paxCode + "/"+ paxPassportPhoto)
                }
                if(file.fieldname == "experience_image")
                {
                    paxExperienceImage = file.fieldname + "-" + Date.now() + path.extname(file.originalname);
                    cb(null,req.user.company + "/pax/" + paxCode +"/"+ paxExperienceImage)
                }
                 
            }
        }),
        fileFilter : function(req,file,cb){
            checkFileType(req,file,cb)
        }
    });



/**
 * Checks Whether the file is an image or not
 * 
 */
function checkFileType(req,file,cb)
{
    let ext = path.extname(file.originalname);
    let size = file.size;
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
         req.fileValidationError = "Forbidden extension";
         return cb(null, false, req.fileValidationError);
   }
   cb(null, true);
}

module.exports = upload;
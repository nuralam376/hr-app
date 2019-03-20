const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const config = require("../config/s3");

const aws = require("aws-sdk");
/** AWS */
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region : "ap-south-1"
});

/** Initialize Multer storage Variable for file upload */

const s3 = new aws.S3();

const pdf = (req,res,group) => {
    let fullUrl = req.protocol + '://' + req.get('host');

    var fs = require('fs');

    "https://s3.ap-south-1.amazonaws.com/hr-app-test/"+group.company+"/groups/"  + group.enjazit_image

    let params = {
        Bucket: "hr-app-test", 
        Key: group.company+"/groups/"  + group.enjazit_image
    };
    s3.getObject(params,(err,data) => {
        if(err)
        {
            console.log(err);
        }
     
        // console.log(data.Body.toString());
        let image = new Buffer.from(data.Body).toString('base64');

        let dd = {
            content: [
                {
                    image: 'passport',
                    width : 300,
                    height : 300
                },
            ],
            images: {
                passport: "data:image/jpeg;base64,"+image
            }
            
        
        };
       
        const pdfDoc = pdfMake.createPdf(dd);
        let filename = group.company + "_" + group.group_seq + "/" + group.group_sl + ".pdf";
    
        pdfDoc.getBase64((data)=>{
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', "application/pdf");
            const download = Buffer.from(data, 'base64');
            res.end(download);
        });
    });
}

module.exports = pdf;
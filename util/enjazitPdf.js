const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const pdf = (req,res,group) => {
    let fullUrl = req.protocol + '://' + req.get('host');

    var fs = require('fs');

    // function to encode file data to base64 encoded string
    function base64_encode(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return new Buffer.from(bitmap).toString('base64');
    }
    let image = base64_encode("./public/uploads/enjazit/" + group.enjazit_image);
    let dd = {
        content: [
            {
                image: 'enjazit',
            },
        ],
        images: {
            enjazit: "data:image/jpeg;base64,"+image
        }
        
    
    };

    const pdfDoc = pdfMake.createPdf(dd);
    let filename = group.seq + "_" + group.sl + ".pdf";

    pdfDoc.getBase64((data)=>{
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', "application/pdf");
        const download = Buffer.from(data, 'base64');
        res.end(download);
    });
}

module.exports = pdf;
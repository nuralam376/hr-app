const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;


const pdf = (req,res,pax) => {
    let fullUrl = req.protocol + '://' + req.get('host');
    let dd = {
        content: 
            {
                image: "data:image/png;base64,"+fullUrl + '/uploads/user/' + pax.passport_photo,
                width: 150,
                height: 150,
            },     
    
    };

    const pdfDoc = pdfMake.createPdf(dd);

    let filename = pax.code + "_" + pax.company.name + ".pdf";

     pdfDoc.getBase64((data)=>{
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', "application/pdf");
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
}

module.exports = pdf;
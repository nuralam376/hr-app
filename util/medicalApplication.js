const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');
const moment = require("moment-timezone");

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const pdf = (res,pax,zone) => {
   
    var documentDefinition = {
        content: [
            "DATE: " + moment().format('LL'),
            "TO, ",
            "THE PRESIDENT",
            "GCC APPROVED MEDICAL",
            "CENTER ASSOCIATION (GAMCA)",
            "HOUSE NO. 4/A, ROAD NO. 94",
            "GULSHAN-2",
            {
               text: [
                        {text: 'DHAKA.\n\n', bold: true, fontSize: 13},
                        {text: 'SUB: ', bold: true, fontSize: 13},
                        {text: 'MEDICAL SLIP ISSUE . \n\n', bold: true, fontSize: 15, decoration: 'underline',},
    
                    ]
            },
            "DEAR SIR,\n\n",
            "PLEASE ISSUE THE FOLLOWING PASSENGER MEDICAL SLIP FOR MEDICAL CHECK-UP FOR KINGDOM OF SAUDI ARABIA. PASSENGERS NAME AND PASSPORT NO. ARE GIVEN BELOW FOR YOUR KIND INFORMATION:\n\n",
            
            {
                alignment: 'justify',
                columns: [
                    {
                        text: 'NAME OF THE PASSENGER\n\n',decoration : "underline",
                        
                    },
                    {
                        text: 'PASSPORT NO.\n\n',decoration : "underline",
                    },
                ],
            },
            {
                alignment: 'justify',
                columns: [
                    {
                        text: pax.name,
                        
                    },
                    {
                        text: pax.passport,
                    },
                ],
            },
            "\n\nTHEREFORE, WE REQUEST YOU TO ISSUE THE MEDICAL SLIP AND THUS OBLIGE THEREBY.\n\n",
            "THANK YOU FOR YOUR KIND CO-OPERATION.\n\n\n",
            "M/S. RIFA INTERNATIONAL\n\n\n\n",
            {text : "MANAGING DIRECTOR", decoration : "overline"}        
        ],
        defaultStyle: {
            alignment : "justify"
        }
        
    }
  
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    let filename = pax.code + "_" + pax.name + ".pdf";

    pdfDoc.getBase64((data)=>{
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', "application/pdf");
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
};

module.exports = pdf;
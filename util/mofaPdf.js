const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const pdf = (res,mofa) => {

    var documentDefinition = {
        content: [
           {
              style: 'tableExample',
              table: {
                 headerRows: 1,
                 widths: [ 200, 200, 200, 200],
                 padding : [20,10,10,10],
                 body: [
                    ['Group/SL: ', mofa.group.group_seq + " / " + mofa.group.group_sl],
                    ['Occupation', mofa.group.occupation],
                    ['E Number', mofa.e_number]
                 ]
              },
              layout: 'noBorders'
           },
        ],
        styles: {
           header: {
             fontSize: 22,
             bold: true,
             alignment:'justify'
           },
           subheader: {
             italics: true,
             alignment: 'justify'
           },
           tableExample: {
              italics: true,
              alignment: 'justify',
              padding: [10,10,10,10],
              margin: [10,10,10,10]
            },
           table1 : {
              alignment:'center'
           }
         }        
    };
  
    const pdfDoc = pdfMake.createPdf(documentDefinition);
    let filename = mofa._id + "_" + mofa.e_number + ".pdf";

    pdfDoc.getBase64((data)=>{
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', "application/pdf");
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
}

module.exports = pdf;
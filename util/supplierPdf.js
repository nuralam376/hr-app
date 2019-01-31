const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const pdf = (res,supplier) => {

    var documentDefinition = {
        content: [
           {
              style: 'tableExample',
              table: {
                 headerRows: 1,
                 widths: [ 200, 200, 200, 200],
                 padding : [20,10,10,10],
                 body: [
                    ['Code Number: ', supplier.code],
                    ['Supplier Name', supplier.name]
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
    let filename = supplier.code + "_" + supplier.name + ".pdf";

    pdfDoc.getBase64((data)=>{
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', "application/pdf");
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
}

module.exports = pdf;
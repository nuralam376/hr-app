const pdfMake = require('../public/bower_components/pdfmake/build/pdfmake');
const vfsFonts = require('../public/bower_components/pdfmake/build/vfs_fonts');

pdfMake.vfs = vfsFonts.pdfMake.vfs;

const pdf = (res,user) => {

    let supplier = {};
    
    if(typeof user.supplier !== "undefined")
    {
        supplier.seq_id = user.supplier.seq_id;    
        supplier.name = user.supplier.name;    
    }
    else
    {
        supplier.seq_id = "N/A";    
        supplier.name = "N/A";    
    }
    var documentDefinition = {
        content: [
           {
              style: 'tableExample',
              table: {
                 headerRows: 1,
                 widths: [ 200, 200, 200, 200],
                 padding : [20,10,10,10],
                 body: [
                    ['Company Name: ', user.company.name],
                    ['Worker ID: ', user.seq_id],
                    ['Name', user.name],
                    ['National ID: ', user.nid],
                    ['Passport ID: ', user.passport],
                    ['Supplier ID: ', supplier.seq_id],
                    ['Supplier Name: ', supplier.name],
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
    let filename = user.seq_id + "_" + supplier.seq_id + ".pdf";

    pdfDoc.getBase64((data)=>{
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', "application/pdf");
        const download = Buffer.from(data.toString('utf-8'), 'base64');
        res.end(download);
    });
}

module.exports = pdf;
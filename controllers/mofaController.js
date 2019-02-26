/** Gets all the information of Mofa */
exports.getMofas = async(req,res) => {
    try
    {
        res.render("mofa/index");
    }
    catch(err)
    {
        console.log(err);
    }
}
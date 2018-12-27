/** Checks Whether the user is logged in or not*/
function ensureAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }
}

module.exports = ensureAuthenticated;
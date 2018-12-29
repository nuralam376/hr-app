/** Checks Whether the Admin is logged in or not*/
function ensureAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        if(req.user.company)    // Checks Whether the superadmin has any company
        {
            next();   
        }
        else
        {
            res.redirect("/register/" + req.user._id + "/company");
        }
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }
}

module.exports = ensureAuthenticated;
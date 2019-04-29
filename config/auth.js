/** Checks Whether the Admin is logged in or not*/
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.company)    // Checks Whether the superadmin has any company
        {
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            next();
        }
        else {
            req.flash("info", "Please fill up the company details first");
            res.redirect("/register/" + req.user._id + "/company");
        }
    }
    else {
        res.redirect("/login");
    }
}

module.exports = ensureAuthenticated;
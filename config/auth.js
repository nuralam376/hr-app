/** Checks Whether the Admin is logged in or not*/
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.company)    // Checks Whether the superadmin has any company
        {
            if (req.user.isEmailVerified) {

                res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                if (req.session.returnTo) {
                    let url = req.session.returnTo;
                    delete req.session.returnTo;
                    return res.redirect(url);
                }
                next();
            }
            else {
                req.flash("info", "Please verify your email");
                res.redirect("/login/logout");
            }
        }
        else {
            req.flash("info", "Please fill up the company details first");
            res.redirect("/register/" + req.user._id + "/company");
        }
    }
    else {
        req.session.returnTo = req.originalUrl;
        res.redirect("/login");
    }
}

module.exports = ensureAuthenticated;
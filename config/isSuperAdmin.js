/** Cheks Whether the logged in admin is Super Admin */
function isSuperAdmin(req, res, next) {
    if (req.user.isSuperAdmin) {
        next(); // If the Admin is SuperAdmin, then proceed
    } else {
        req.flash("danger", "Unauthorized Access");
        res.redirect("/dashboard");
    }
}

module.exports = isSuperAdmin;
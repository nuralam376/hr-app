/** Cheks Roles of the Admin */
function hasRole(role) {
    return function (req, res, next) {
        var flag = false;
        req.user.roles.forEach(roleName => {
            if (roleName == role) {
                flag = true;
            }
        });

        if (flag == true) {
            next();
        }
        else {
            req.flash("danger", "Unauthorized Access");
            return res.redirect("/dashboard");
        }
    }
}

module.exports = hasRole;
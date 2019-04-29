/** Supplier Model Schema */
const AdminModel = require("../models/adminModel");

/** Role Model Schema */
const RoleModel = require("../models/roleModel");


/** Gets Admin Roles */
exports.getAdminRoles = async (req, res) => {
    try {

        res.render("admin/Allroles", {

        });
    } catch (err) {
        console.log(err);
    }
};

/** Creates Admin Roles */
exports.createAdminRoles = async (req, res) => {
    try {

        let roles = await RoleModel.find({ company: req.user.company }).exec();

        let admins = await AdminModel.find({ company: req.user.company });

        if (roles.length == 0) {
            let newRoles = ["Dashboard", "Company", "Admin", "Zone", "Group", "Supplier", "Pax", "Medical", "Mofa", "Stamping", "Training Certificate", "Manpower", "Flight", "Delivery"];
            let newSlugs = ["dashboard", "company", "admin", "zone", "group", "supplier", "pax", "medical", "mofa", "stamping", "tc", "manpower", "flight", "delivery"];

            for (let i = 0; i < newRoles.length; i++) {
                let newRole = new RoleModel();
                newRole.name = newRoles[i];
                newRole.slug = newSlugs[i];
                newRole.company = req.user.company;
                newRole.created_at = Date.now();
                newRole.updated_at = Date.now();
                let roleSave = await newRole.save();
            }
            let roles = await RoleModel.find({ company: req.user.company });

            return res.render("admins/assignRole", {
                roles: roles,
                admins: admins
            });
        }
        else {
            res.render("admins/assignRole", {
                roles: roles,
                admins: admins
            });
        }

    } catch (err) {
        console.log(err);
    }
};
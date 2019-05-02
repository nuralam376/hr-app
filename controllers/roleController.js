/** Supplier Model Schema */
const AdminModel = require("../models/adminModel");

/** Role Model Schema */
const RoleModel = require("../models/roleModel");

const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

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

/** Saves Admin Roles */
exports.postAdminRoles = async (req, res) => {
    try {

        let roles = await RoleModel.find({ company: req.user.company }).exec();

        let admins = await AdminModel.find({ company: req.user.company });

        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("admins/assignRole", {
                roles: roles,
                admins: admins,
                errors: errors.array()
            });
        }

        let newAdmin = {};
        newAdmin.roles = req.body.roles;

        let admin = await AdminModel.findByIdAndUpdate(req.body.admin, newAdmin);

        if (admin) {
            req.flash("success", "Admin Roles saved");
            res.redirect("/role/admin");
        }

    }
    catch (err) {
        console.log(err);
    }
}

/** Gets Admin Role */
exports.getAdminRole = async (req, res) => {
    try {
        let adminId = req.params.id;

        let admin = await AdminModel.findById(adminId);
        let roles = await RoleModel.find({ company: req.user.company });

        let result = {
            admin: admin,
            roles: roles
        };

        return res.jsonp(result);
    }
    catch (err) {
        console.log(err);
    }
}
/** This is the login controller page. Login related functions are here. */

/** Required modules */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check, validationResult} = require("express-validator/check");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

/** Admin Model Schema */
let AdminModel = require("../models/adminModel");

/**
 * Shows Login Page
 * 
 */

router.get("/",function(req,res){
    if(req.isAuthenticated())
    {
        res.redirect("/dashboard");
    }
    else
        res.render("login");
});


/** Implements Passport  */
passport.use(new LocalStrategy(
	function (username, password, done) {
        let query = {email : username};
		AdminModel.findOne(query, function (err, admin) {
			if (err) throw err;
			if (!admin) {
				return done(null, false, { message: 'No User Found' });
            }
            
			bcrypt.compare(password, admin.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, admin);
				} else {
					return done(null, false, { message: 'Wrong password' });
				}
			});
		});
	}));

passport.serializeUser(function (admin, done) {
	done(null, admin.id);
});

passport.deserializeUser(function (id, done) {
	AdminModel.findById(id, function (err, admin) {
		done(err, admin);
	});
});


/**
 * Receives Admin's email and passport and authenticate
 * 
 */

router.post("/",[
    check("username").not().isEmpty().withMessage("Email is required"),
    check("password").not().isEmpty().withMessage("Password is required")
],function(req,res,next){
   
    let errors = validationResult(req);

    if(!errors.isEmpty())
    {
        res.render("login",{
            errors : errors.array()
        });
    }    
    else
    {
        passport.authenticate("local",{
            successRedirect : "/dashboard",
            failureRedirect : "/login",
            failureFlash : true
        })(req,res,next);
    }
});


/**  Logout logged in user */
router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","You are now logged out");
    res.redirect("/login");
})

module.exports = router;
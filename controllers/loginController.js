const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const {check, validationResult} = require("express-validator/check");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;


let UserModel = require("../models/userModel");

router.get("/",function(req,res){
    if(req.isAuthenticated())
    {
        res.redirect("/user");
    }
    else
        res.render("login");
});

passport.use(new LocalStrategy(
	function (username, password, done) {
        let query = {email : username};
		UserModel.findOne(query, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'No User Found' });
			}

			bcrypt.compare(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Wrong password' });
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	UserModel.findById(id, function (err, user) {
		done(err, user);
	});
});

router.post("/data",[
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
            successRedirect : "/user",
            failureRedirect : "/login",
            failureFlash : true
        })(req,res,next);
    }
});

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","You are now logged out");
    res.redirect("/login");
})

module.exports = router;
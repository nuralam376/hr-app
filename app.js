/** This is the main application page */

/** Required Modules */
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const app = express();
const port = 3000;

/** Mongodb Database Connection Setup for local Server*/
mongoose.connect("mongodb://localhost/hr-app", {useNewUrlParser : true});

/** Mongodb Database Connection Setup for Heroku */
/*
const port = process.env.PORT || 8000;
mongoose.connect("mongodb://hr-app:hr123456@ds117509.mlab.com:17509/hr-app", {useNewUrlParser : true});
*/

let db = mongoose.connection;

db.once("open",function(){
    console.log("Connected to MongoDB");
});

db.on("error",function(err){
    console.log("error");
});

/** Required middleware */
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret : "keyboard cat",
    resave : true,
    saveUninitialized : true
}));

/** Passport and Session Middleware */
app.use(passport.initialize());
app.use(passport.session());
app.use(require('connect-flash')());

/** Required Global Variables */
app.use(function(req,res,next){
    res.locals.errors = null;
    res.locals.msg = null;
    res.locals.messages = require('express-messages')(req, res);
    res.locals.user = req.user || null;
    res.locals.fileError = null;
    next();
});

/** EJS view engine */
app.set("view engine","ejs");

/** Home Route */
app.get("/",function(req,res){
    res.render("home");
});

/** Required Controllers */
let register = require("./controllers/registerController");
let login = require("./controllers/loginController");
let user = require("./controllers/userController");

/** Other Routes */
app.use("/register",register);
app.use("/login",login);
app.use("/user",user);

// Start the server
app.listen(port,function(){
    console.log("Server started on port " + port);
});



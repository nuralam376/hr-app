/** This is the main application page */

/** Required Modules */
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const app = express();
const port = process.env.PORT || 8000;

/** Database Configuration File */
const config = require("./config/database");

/** Database Configuration Settings */
mongoose.connect(config.database, {useNewUrlParser : true});

const db = mongoose.connection;

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
    res.locals.admin = req.user || null;
    res.locals.fileError = null;
    next();
});

/** EJS view engine */
app.set("view engine","ejs");

/** Home Route */
app.get("/",async(req,res) => {
    try{
        res.render("home");
    }
    catch(error)
    {
        console.log(error);
    }
    
});

/** Required Controllers */
const register = require("./controllers/registerController");
const login = require("./controllers/loginController");
const user = require("./controllers/userController");
const supplier = require("./controllers/supplierController");


/** Other Routes */
app.use("/register",register);
app.use("/login",login);
app.use("/user",user);
app.use("/supplier",supplier);


// Start the server
app.listen(port,function(){
    console.log("Server started on port " + port);
});



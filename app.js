const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const port = 3000;

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret : "keyboard cat",
    resave : true,
    saveUninitialized : true
}));
app.use(require('connect-flash')());
//View Engine
app.set("view engine","ejs");

// Mongodb database connection
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/hr-app", {useNewUrlParser : true});

let db = mongoose.connection;

db.once("open",function(){
    console.log("Connected to MongoDB");
});

db.on("error",function(err){
    console.log("error");
});

// Global Variables

app.use(function(req,res,next){
    res.locals.errors = null;
    res.locals.msg = null;
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Home Route
app.get("/",function(req,res){
    res.render("login");
});

//Other Routes
let register = require("./controllers/registerController");
let login = require("./controllers/loginController");

app.use("/register",register);
app.use("/login",login);
// Start the server
app.listen(port,function(){
    console.log("Server started on port " + port);
});



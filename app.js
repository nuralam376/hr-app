const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, "public")));

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

// Home Route
app.get("/",function(req,res){
    res.render("login");
});


// Start the server
app.listen(port,function(){
    console.log("Server started on port " + port);
});

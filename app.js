const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine","ejs");

app.get("/",function(req,res){
    res.render("login");
});


app.listen(port,function(){
    console.log("Server started on port " + port);
});

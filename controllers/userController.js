const express = require("express");

const router = express.Router();

router.get("/",function(req,res){
    if(req.isAuthenticated())
    {
        res.render("users/index");
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }    
});

module.exports = router;
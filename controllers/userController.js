const express = require("express");

const router = express.Router();

let UserModel = require("../models/userModel");

router.get("/",function(req,res){
    if(req.isAuthenticated())
    {
        UserModel.find({},function(err,users){
            if(err)
            {
                console.log(err);
            }
            else
            {
                res.render("users/index",{
                    users : users
                });
            }
        });
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }    
});

router.get("/:id",function(req,res){
    let query = {_id : req.params.id};

    UserModel.findOne(query,function(err,user){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("users/view",{
                user : user
            });
        }
    });
});

module.exports = router;
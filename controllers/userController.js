const express = require("express");

const router = express.Router();

let UserModel = require("../models/userModel");

router.get("/",ensureAuthenticated,function(req,res){
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
});



router.get("/edit/:id",ensureAuthenticated,function(req,res){
  if(req.user.isAdmin)
  {
    let query = {_id : req.params.id};

    UserModel.findOne(query,function(err,user){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("users/edit",{
                newUser : user
            });
        }
    });
  }
  else
  {
      req.flash("danger","Unauthorize Access");
      res.redirect("/user");
  }

});

router.get("/delete/:id",ensureAuthenticated,function(req,res){
    if(req.user.isAdmin)
    {
        res.redirect("/");
    }
    else
    {
        req.flash("danger","Unauthorize Access");
        res.redirect("/user");
    }
  
});

router.get("/:id",ensureAuthenticated,function(req,res){
    let query = {_id : req.params.id};

    UserModel.findOne(query,function(err,user){
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render("users/view",{
                newUser : user
            });
        }
    });
});  

function ensureAuthenticated(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        req.flash("danger","Please login first");
        res.redirect("/login");
    }
}

module.exports = router;
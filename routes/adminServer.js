/**
 * Created by Lazarus of Bethany on 28/11/2017.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var secrets= require("secrets.js");

var User = require('../models/users');
var Secret = require('../models/secrets');
var Admin= require('../models/admins');

router.post('/signup',function (req,res) {


    /*var newUser=new User({name:req.body.name,password:req.body.password});
    newUser.save().then(function(err,user){
        if(err){
            res.status(500).send("Internal Databse Error")
        }

    Admin.find(function (err,admins) {
        if(err){
            res.status(500).send("Internal Databse Error")
        }
        var selected=[];
        var i=0;
        while (selected.length!=3) {
            var admin = Math.floor((Math.random() * admins.length) + 1);
            if(!selected.includes(admin)){
                selected.push(admin);
                var data={userid:user._id,part:req.body.parts[i]};
                Admin.findOneAndUpdate({name:admins[admin].name},{$push: {userParts: data}}).then(function (err) {
                 if (err){
                     res.status(500).send("Internal Databse Error When sending parts")
                 }   else{
                     i++;
                 }
                });
            }
        }

    })

  })*/

});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});

module.exports = router;
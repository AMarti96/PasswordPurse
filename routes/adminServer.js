/**
 * Created by Lazarus of Bethany on 28/11/2017.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var secrets= require("secrets.js");
var HashJS= require('crypto-js/sha1');
var User = require('../models/users');
var Secret = require('../models/secrets');
var Admin= require('../models/admins');

router.post('/signup',function (req,res) {


    var newUser=new User({name:req.body.name,password:req.body.password});
    newUser.save().then(function(user){
        if(!user){
            res.status(500).send("Internal Databse Error: User not created")
        }

    Admin.find(function (err,admins) {
        if(err){
            res.status(500).send("Internal Databse Error: Admins not found")
        }
        var selected=[];
        var info=[]
        while (selected.length!=3) {

            var admin = Math.floor((Math.random() * admins.length));
            if(!selected.includes(admin)){
                var data={id:admin,userid:user._id,part:req.body.parts[selected.length]};
                info.push(data)
                selected.push(admin);
            }
        }
        info.forEach(function (element) {
            var data={userid:element.userid,part:element.part};
            Admin.update({name:admins[element.id].name},{$push: {userParts: JSON.stringify(data)}}).then(function (err,upd) {
                if(!err){
                    res.status(500).send("Internal Databse Error while sharing parts")
                }
            })
        });

        var token=HashJS([user._id,req.body.password,Date.now()].toString()).toString();
        User.findOneAndUpdate({name:req.body.name,password:req.body.password},{token:token}).then(function (err) {
            if(!err){
                res.status(500).send("Internal Database Error: Token not updated")
            }
            else{
                res.send(token)
            }
        })

    })

  })

});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});

module.exports = router;
var express = require('express');
var router = express.Router();
var HashJS= require('crypto-js/sha1');
var path = require('path');
var User = require('../models/users');
var Secret = require('../models/secrets');

router.get('/categories/:client',function (req,res) {

    var categoryList=['All'];
    User.findOne({token:req.params.client},function(err,user){

        if(user){

            Secret.find({user:user._id},'category').then(function (response) {

                if(!response){
                    res.status(500).send("Internal Database Error: Secrets not found")
                }
                else{
                    response.forEach(function (element) {
                        categoryList.push(element.category)
                    });
                    categoryList.push("Other");
                    res.send(categoryList)
                }
            })
        }
        else{
            res.status(401).send("Token Error, Wrong Credentials")
        }
    });

});
router.post('/login',function (req,res) {


    // res.send(HashJS(["user._id",req.body.password,Date.now()].toString()).toString());

    User.findOne({name:req.body.name,password:req.body.password},function(err,user){

        if(user){

            var token=HashJS([user._id,req.body.password,Date.now()].toString()).toString();
            User.findOneAndUpdate({name:req.body.name,password:req.body.password},{token:token}).then(function (err) {
                if(!err){
                    res.status(500).send("Internal Database Error: Token not updated")
                }
                else{
                    res.send(token)
                }
            })

        }
        else{
            res.status(400).send("Wrong Credentials")
        }
    });

});

router.post('/newsecret',function (req,res) {

    // res.send(req.body.secret);

    User.findOne({token:req.body.token},function(err,user){

     if(user){

     Secret.findOneAndUpdate({user:user._id,category:req.body.category},{$push: {secrets: req.body.secret}}).then(function (err) {

     if(!err){
         var newSecret=new Secret({user:user._id,category:req.body.category,secrets: req.body.secret});
         newSecret.save().then(function(user){
             if(!user){
                 res.status(500).send("Internal Databse Error: Secret not created")
             }
             else{
                 res.send("Secret Created Correctly")
             }
        })
     }
     else{
     res.send("Secret Created Correctly")
     }
     })
     }
     else{
     res.status(401).send("Token Error, Wrong Credentials")
     }
     });

});

router.post('/getsecrets',function (req,res) {

    // res.send(req.body.token);

    var secretList=[];
    User.findOne({token:req.body.token},function(err,user){

     if(user) {

         if (req.body.category != "All") {


         Secret.find({user: user._id, category: req.body.category}).then(function (response) {


             if (!response) {
                 res.status(500).send("Internal Database Error: Secrets not found")
             }
             else {
                 response.forEach(function (element) {
                     element.secrets.forEach(function (entry) {
                         secretList.push(entry)
                     })

                 });
                 res.send(secretList)
             }
         })
     }else
         {
             Secret.find({user: user._id}).then(function (response) {

                 if (!response) {
                     res.status(500).send("Internal Database Error: Secrets not found")
                 }
                 else {
                     response.forEach(function (element) {
                         element.secrets.forEach(function (entry) {
                             secretList.push(entry)
                         })

                     });
                     res.send(secretList)
                 }
             })
         }
     }
     else{
     res.status(401).send("Token Error, Wrong Credentials")
     }
     });

});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
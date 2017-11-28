/**
 * Created by Lazarus of Bethany on 28/11/2017.
 */
var express = require('express');
var router = express.Router();
var path = require('path');
var secrets= require("secrets.js");

var User = require('../models/users');
var Secret = require('../models/secrets');

router.post('/signup',function (req,res) {

    var password=req.body.password;
    var passHex=secrets.str2hex(password);
    var shares=secrets.share(passHex,3,3,512);
    res.send(shares);

    /*var newUser=new User({name:req.body.name,password:req.body.password});
    newUser.save().then(function(err){
        if(err){
            res.status(500).send("Internal Databse Error")
        }else {
            var password=req.body.password;
            var passHex=secrets.str2hex(password);
            var shares=secrets.share(passHex,3,3,512);

            res.status(201).send("Inserted Correctly")
        }
    })*/

});
router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});

module.exports = router;
var express = require('express');
var router = express.Router();
var path = require('path');
var secrets= require("secrets.js");
var HashJS= require('crypto-js/sha1');
var User = require('../models/users');
var Secret = require('../models/secrets');
var Admin= require('../models/admins');
var bigInt = require("big-integer");
var nonRep = require('../../PasswordPurse/routes/nonRepudiation');
var p=bigInt.zero;
var q=bigInt.zero;
var n=bigInt.zero;
var d=bigInt.zero;
var e= bigInt(65537);

function genNRSA(){

    var base=bigInt(2);
    var prime=false;

    while (!prime) {
        p = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(p).isPrime()

    }
    prime = false;
    while (!prime) {
        q = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
        prime = bigInt(q).isPrime()
    }
    var phi = p.subtract(1).multiply(q.subtract(1));
    n = p.multiply(q);
    d = e.modInv(phi);

};


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
        var info=[];
        while (selected.length!=3) {

            var admin = Math.floor((Math.random() * admins.length));
            if(!selected.includes(admin)){
                var data={id:admin,userid:user._id,part:req.body.parts[selected.length]};
                info.push(data);
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

router.post('/getusers',function (req,res) {
    var users = [];
    Admin.findOne({name:req.body.name},'userParts',function(err,admin){

        if(admin) {

            admin.userParts.forEach(function (element) {
                var value = JSON.parse(element);
                User.findById(value.userid, function (err, user) {

                    if(user){
                        users.push(user.name);
                    }
                    if(users.length===admin.userParts.length){
                        res.send(users);
                    }

                });

            });

        }
        else{
            res.status(400).send("Wrong Credentials")
        }
    });

});

router.post('/login',function (req,res) {

    Admin.findOne({name:req.body.name,password:req.body.password},function(err,admin){

        if(admin){

            var token=HashJS([admin._id,req.body.password,Date.now()].toString()).toString();
            Admin.findOneAndUpdate({name:req.body.name,password:req.body.password},{token:token}).then(function (err) {
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

router.post('/repudiationSigned',function (req,res) {


    if(n==bigInt.zero){
        genNRSA(function () {})
    }
    else{
        console.log("Message from "+ req.body.origin)

        nonRep.checkPayload(req.body.origin,req.body.destination,req.body.message,req.body.modulus,req.body.publicE,req.body.signature,function (buff) {

            if(buff === 1){

                nonRep.returnMessagefromServer(req.body.origin,req.body.destination,req.body.message,d,n,function (data) {

                    res.send(data)
                });
            }
            else {
                console.log("Algo paso");
                res.send("ERROR")
            }
        });
    }
});


router.get('/getServer', function (req,res) {
    if(n==bigInt.zero){
        genNRSA()
        console.log("RSA Admin Generated Correctly");
    }
    var data={
        modulus:n,
        serverE:e
    };
    res.send(data)

});
router.get('/getadmins/:user', function (req,res) {
    var adminlist=[];

    User.findOne({name:req.params.user},function (err, user) {
        if(user){
            Admin.find().then(function (admins) {
                admins.forEach(function (element) {
                    var value = JSON.parse(element.userParts);
                        if(value.userid==user._id){
                            adminlist.push(element.name);
                        }
                });
                res.send(adminlist);
            })

        }
        else{
            res.status(500).send("User not found")
        }
    })
});
router.post('/loginadmins',function (req, res) {
   var parts=[];
    Admin.findOne({name:req.body.admin1,password:req.body.passadmin1},function (err, admin) {
        if(admin){
            parts.push(JSON.parse(admin.userParts).part);
            Admin.findOne({name:req.body.admin2,password:req.body.passadmin2},function (err, admin) {
                if(admin){
                    parts.push(JSON.parse(admin.userParts).part);
                    Admin.findOne({name:req.body.admin3,password:req.body.passadmin3},function (err, admin) {
                        if(admin){
                            parts.push(JSON.parse(admin.userParts).part);

                            res.send(parts);
                        }
                        else{
                            res.status(500).send("Admin not found")
                        }
                    });
                }
                else{
                    res.status(500).send("Admin not found")
                }
            });
        }
        else{
            res.status(500).send("Admin not found")
        }
    });
});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});

module.exports = router;
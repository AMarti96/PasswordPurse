var express = require('express');
var router = express.Router();
var path = require('path');
var request=require('request');
var secrets= require("secrets.js");
var HashJS= require('crypto-js/sha1');
var User = require('../models/users');
var Secret = require('../models/secrets');
var Admin= require('../models/admins');
var bigInt = require("big-integer");
var CryptoJS = require("crypto-js");
var nonRep = require('../../PasswordPurse/routes/nonRepudiation');
var p=bigInt.zero;
var q=bigInt.zero;
var n=bigInt.zero;
var d=bigInt.zero;
var serverN=bigInt.zero;
var serverE=bigInt.zero;
var e= bigInt(65537);
var cryptograms=[];

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

router.get('/getusers',function (req,res) {
    var users = [];
    User.find().then(function (user) {
        user.forEach(function (element) {
                users.push(element.name);

        });
        res.send(users);
    });

});

router.post('/keyReady',function (req,res) {

    console.log("Admin Server: key ready?");

 nonRep.consultTTP(req.body,function (buff) {

     if(buff!=0){

         console.log("Admin Server: The shared key is: " + buff);
         var message;
         cryptograms.forEach(function (element) {

             if(element.origin === req.body.AdminName){
                 cryptograms = cryptograms.filter(function(el) {
                     return el.origin !== req.body.AdminName;
                 });
                 message = CryptoJS.AES.decrypt(element.cryptogram, buff).toString(CryptoJS.enc.Utf8);
                 console.log("Admin Server: The message is: " + message);
             }
         });

         var parts = message.split(".");
         var user = parts[0];
         var category = parts[1];
         var admin1 = parts[2].split("-")[0];
         var parts1 = parts[2].split("-")[1];
         var admin2 = parts[3].split("-")[0];
         var parts2 = parts[3].split("-")[1];
         var admin3 = parts[4].split("-")[0];
         var parts3 = parts[4].split("-")[1];

         var newmessage = user+"."+category;
         var origin="AdminServer";
         var destination="Server";
         var thirdpart = "TTP";
         var sharedKey = "IAmYourFather";
         var url = 'http://localhost:3501/server/usersecrets';

         nonRep.sendMessageToSever(origin,destination,url,sharedKey,d,n,e,newmessage,function (resp) {

             if (resp === undefined) {
                 console.log("Error when sending message to admin server")
             }
             else {
                 nonRep.checkPayload(resp.origin, resp.destination, resp.message, serverN, serverE, resp.signature, function (re) {
                     if (re === 1) {

                         var ttp = 'http://localhost:3501/ttp/repudiationThirdPart';
                         console.log("Sharing key with ttp");

                         nonRep.sendMessageToThirdPart(origin, destination, sharedKey, thirdpart, d, n, e, ttp, function (buff2) {

                             nonRep.checkPayloadTTP(buff2.origin, buff2.destination, buff2.key, buff2.TTPE, buff2.modulusTTP, buff2.thirdpart, buff2.signature, function (res2) {

                                 if (res2 === 1) {

                                     var notif = 'http://localhost:3501/server/keyReady';

                                     var data = {
                                         AdminName:origin,
                                         url2:'http://localhost:3501/ttp/getAdminKey'
                                     };
                                     var dat = {
                                         url:notif,
                                         data:data
                                     };

                                     adminSRV.notifyAdminServer(dat,function (callback) {

                                         console.log(callback);


                                     },function (error) {
                                         alert(error);
                                     });
                                 }

                                 else {
                                     $scope.results = "Error when checking payload"
                                 }

                             });

                         });
                     }
                     else {
                         $scope.results = "Something went wrong..."
                     }
                 });
             }


         });





         res.send("1");
     }
     else{
         res.send(buff);
     }




 })



});

router.post('/repudiationSigned',function (req,res) {


    if(n==bigInt.zero){
        genNRSA(function () {})
    }
    else{
        console.log("Admin Server: Message from "+ req.body.origin);

        nonRep.checkPayload(req.body.origin,req.body.destination,req.body.message,req.body.modulus,req.body.publicE,req.body.signature,function (buff) {

            if(buff === 1){

                nonRep.returnMessagefromServer(req.body.origin,req.body.destination,req.body.message,d,n,function (data) {

                    var dat = {
                        origin:req.body.origin,
                        cryptogram:req.body.message
                    };
                    cryptograms.push(dat);

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
    if(n===bigInt.zero){
        genNRSA();
        console.log("RSA Admin Generated Correctly");
        request('http://localhost:3501/server/getServer', function (error, response, body) {
            var dat = JSON.parse(response.body);
            serverN = dat.Smodulus;
            serverE = dat.ServerE;
        });
    }
    var data={
        modulus:n,
        serverE:e
    };
    res.send(data);

});

router.get('/getadmins/:user', function (req,res) {
    var adminlist=[];
    User.findOne({name:req.params.user},function (err, user) {
        if(user){
            Admin.find().then(function (admins) {
                admins.forEach(function (element) {
                    if(element.userParts[0] === undefined){

                    }
                    else{
                        var value = JSON.parse(element.userParts);
                        if(value.userid==user._id){
                            adminlist.push(element.name);
                        }
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
    Admin.findOne({name:req.body.admin1,password:req.body.passadmin1},function (err, admin1) {
        if(admin1){
            parts.push(JSON.parse(admin1.userParts).part);
            Admin.findOne({name:req.body.admin2,password:req.body.passadmin2},function (err, admin2) {
                if(admin2){
                    parts.push(JSON.parse(admin2.userParts).part);
                    Admin.findOne({name:req.body.admin3,password:req.body.passadmin3},function (err, admin3) {
                        if(admin3){
                            parts.push(JSON.parse(admin3.userParts).part);
                            res.send(parts);
                        }
                        else{
                            res.status(500).send("Admin3 not found")
                        }
                    });
                }
                else{
                    res.status(500).send("Admin2 not found")
                }
            });
        }
        else{
            res.status(500).send("Admin1 not found")
        }
    });
});

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});

module.exports = router;
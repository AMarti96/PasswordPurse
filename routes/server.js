var express = require('express');
var router = express.Router();
var HashJS= require('crypto-js/sha1');
var request=require('request');
var path = require('path');
var User = require('../models/users');
var Secret = require('../models/secrets');
var bigInt = require("big-integer");
var CryptoJS = require("crypto-js");
var Admin= require('../models/admins');
var nonRep = require('../../PasswordPurse/routes/nonRepudiation');
var log4js = require('log4js');
log4js.configure({
    appenders: {
        out : { type: 'console'},
        ttp: {type: 'file', filename: 'logs/ttp.log', "maxLogSize": 10485760, "numBackups": 3},
        admin :{ type: 'file', filename: 'logs/adminServer.log', "maxLogSize": 10485760, "numBackups": 3},
        server :{ type: 'file', filename: 'logs/server.log', "maxLogSize": 10485760, "numBackups": 3}
    },
    categories: {
        default: { appenders: ['out'], level: 'info' },
        ttp : { appenders: ['ttp'], level:'info'},
        admin : { appenders: ['admin'], level:'info'},
        server : { appenders: ['server'], level:'info'}
    }
});
var logger3 = log4js.getLogger('server');
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

router.post('/usersecrets',function (req,res) {


    if(n==bigInt.zero){
        genNRSA(function () {})
    }
    else{
        //console.log("Server: Message from "+ req.body.origin);
        logger3.info('Server: Message from '+ req.body.origin);
       //console.log(req.body.origin);
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
                console.log("Something was wrong");
                logger3.error('Something was wrong');
                res.send("ERROR")
            }
        });
    }
});

router.post('/keyReady',function (req,res) {

    nonRep.consultTTP(req.body,function (buff) {

        if(buff!=0) {

           // console.log("Server: The shared key is: " + buff);
            logger3.info('Server: The shared key is: ' + buff);
            var message;
            cryptograms.forEach(function (element) {

                if (element.origin === req.body.AdminName) {
                    cryptograms = cryptograms.filter(function (el) {
                        return el.origin !== req.body.AdminName;
                    });
                    message = CryptoJS.AES.decrypt(element.cryptogram, buff).toString(CryptoJS.enc.Utf8);
                  //  console.log("Server: The message is: " + message);
                    logger3.info('Server: The message is: ' + message);
                }

            });

            var parts = message.split(".");
            var us = parts[0];
            var category = parts[1];

            User.findOne({name:us},function(err,user) {

                if(user){

                    Secret.find({user:user._id,category:category},function (err,secret) {

                        var newmessage;
                        var j = 0;
                        secret.forEach(function (sec) {
                            sec.secrets.forEach(function (element) {
                                if (j===0){
                                    j++;
                                    newmessage = element+".";
                                }
                                else {
                                    newmessage = newmessage + element + ".";
                                }
                            });
                            j=0;
                        });

                        var origin="Server-UserSecrets";
                        var destination="AdminServer-UserSecrets";
                        var thirdpart = "TTP";
                        var sharedKey = "WhySoSerious";
                        var url = 'http://localhost:3501/Adminserver/repudiationSigned';


                        nonRep.sendMessageToSever(origin,destination,url,sharedKey,d,n,e,newmessage,function (resp) {

                            if (resp === undefined) {
                                console.log("Error when sending message to admin server");
                                logger3.error('Error when sending message to admin server');
                            }
                            else {
                                nonRep.checkPayload(resp.origin, resp.destination, resp.message, serverN, serverE, resp.signature, function (re) {
                                    if (re === 1) {

                                        var ttp = 'http://localhost:3501/ttp/repudiationThirdPart';
                                        console.log("Server: Sharing key with ttp");
                                        logger3.info('Server: Sharing key with ttp');

                                        nonRep.sendMessageToThirdPart(origin, destination, sharedKey, thirdpart, d, n, e, ttp, function (buff2) {

                                            nonRep.checkPayloadFromTTP(buff2.origin, buff2.destination,buff2.thirdpart,buff2.key,buff2.modulusTTP, buff2.TTPE, buff2.signature, function (res2) {

                                                if (res2 === 1) {

                                                    var data = {
                                                        AdminName:origin,
                                                        DestinationName:destination,
                                                        url2:'http://localhost:3501/ttp/getAdminKey'
                                                    };
                                                    res.send(data);
                                                }

                                                else {
                                                    console.log("Server: Error when checking payload from TTP");
                                                    logger3.error('Server: Error when checking payload from TTP');
                                                    res.send("0");
                                                }

                                            });

                                        });
                                    }
                                    else {
                                        console.log("Server: Something went wrong...");
                                        logger3.error('Server: Something went wrong...');
                                        res.send("0");
                                    }
                                });
                            }


                        });

                    });

                }
                else{
                    res.send("0");
                }

            });
        }
        else{
            res.send("0");
        }
    })
});

router.post('/genServer', function (req,res) {
    if(n===bigInt.zero){
        genNRSA();
        console.log("RSA Server Generated Correctly");
        serverN = req.body.Amodulus;
        serverE = req.body.AdminE;
    }
    var data={
        Smodulus:n,
        ServerE:e
    };
    res.send(data)

});
router.get('/admincategory/:client', function (req,res) {

    var categoryList = [];


    User.findOne({name:req.params.client},function(err,user){

        if(user){

            Secret.find({user:user._id},'category').then(function (response) {

                if(!response){
                    res.status(500).send("Internal Database Error: Secrets not found")
                }
                else{
                    response.forEach(function (element) {
                        categoryList.push(element.category)
                    });
                    res.send(categoryList)
                }
            })
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
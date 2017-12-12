var HashJS= require('crypto-js/sha256');
var bigInt = require("big-integer");
var request=require('request');
var CryptoJS = require("crypto-js");

module.exports = {

    checkPayload: function (origin,destination,message,modulus,publicE,signature, callback) {

        var buffS;
        /////////
        var modulus2= bigInt(modulus);
        /////////
        var sigmessage=bigInt(signature);
        var signature2=sigmessage.modPow(publicE,modulus2);
        if(signature2) {
            buffS = Buffer.from(signature2.toString(16), 'hex').toString();
            //////////
            var string = origin + "." + destination + "." + message;
            var hash = HashJS(string);

            if (hash == buffS) {
                callback(1);
            }
            else {
                callback(0);
            }
        }
        else{
            callback(0);
        }
    },
    checkPayloadTTP: function (origin,destination,thirdpart,sharedkey,modulus,publicE,signature,callback) {

        var buffS;
        /////////
        var modulus2= bigInt(modulus);
        /////////
        var sigmessage=bigInt(signature);
        var signature2=sigmessage.modPow(publicE,modulus2);
        buffS=Buffer.from(signature2.toString(16),'hex').toString();
        //////////
        var string=origin+"."+thirdpart+"."+destination+"."+sharedkey;
        var hash=HashJS(string);
        if(hash==buffS) {
            callback(1);
        }
        else{
            callback(0);
        }
    },
    checkPayloadFromTTP: function (origin,destination,thirdpart,sharedkey,modulus,publicE,signature,callback) {

        var buffS;
        /////////
        var modulus2= bigInt(modulus);
        /////////
        var sigmessage=bigInt(signature);
        var signature2=sigmessage.modPow(publicE,modulus2);
        buffS=Buffer.from(signature2.toString(16),'hex').toString();
        //////////
        var string=thirdpart+"."+origin+"."+destination+"."+sharedkey;
        var hash=HashJS(string);
        if(hash==buffS) {
            callback(1);
        }
        else{
            callback(0);
        }
    },
    shareKey: function (origin,destination,thirdpart,d,n,e,sharedkey,callback) {

        var string=thirdpart+"."+origin+"."+destination+"."+sharedkey;
        var hash=HashJS(string);
        var buff=Buffer.from(hash.toString(),'utf8');
        var message=bigInt(buff.toString('hex'),16);
        var enmessage=message.modPow(d,n);
        var data = {
            thirdpart:thirdpart,
            origin:origin,
            destination:destination,
            key:sharedkey,
            signature: enmessage,
            modulusTTP:n,
            TTPE:e
        };
        callback(data);

    },
    returnMessagefromServer: function (origin, destination, message,d,n,callback) {

        var string=destination+"."+origin+"."+message;
        var hash=HashJS(string);
        var buff=Buffer.from(hash.toString(),'utf8');
        var message2=bigInt(buff.toString('hex'),16);
        var enmessage=message2.modPow(d,n);
        var data = {
            origin:destination,
            destination:origin,
            signature: enmessage,
            message: message

        };
        callback(data);
    },
    consultTTP: function (data,callback) {

        var url = data.url2+'/'+data.AdminName+'/'+data.DestinationName;

        request(url, function (error, response, body) {

            if(body!=0) {

                var dat = JSON.parse(response.body);
                var datos = dat.data;
                var buffS;
                /////////
                var thirdpart = datos.thirdpart;
                var origin = datos.origin;
                var destination = datos.destination;
                var sharedKey = datos.key;
                var modulus = bigInt(datos.modulusTTP);
                var publicE = datos.TTPE;
                /////////
                var sigmessage = bigInt(datos.signature);
                var signature = sigmessage.modPow(publicE, modulus);
                buffS = Buffer.from(signature.toString(16), 'hex').toString();
                //////////
                var string = thirdpart + "." + origin + "." + destination + "." + sharedKey;
                var hash = HashJS(string);

                if (hash == buffS) {

                    callback(sharedKey)

                }
                else {
                    console.log("error");
                    callback("0");
                }
            }
            else{
                console.log("error2");
                callback("0");
            }
        });
    },
    sendMessageToSever:function (origin, destination, server, sharedKey,d,n,e, message, callback) {

        var cypher = CryptoJS.AES.encrypt(message, sharedKey).toString();
        var string = origin + "." + destination + "." + cypher;
        var hash = CryptoJS.SHA256(string).toString();
        var signature = convertToHex(hash);
        var messageS = bigInt(signature, 16);
        var sigmessage = messageS.modPow(d, n);
        var data = {
            origin: origin,
            destination: destination,
            message: cypher,
            signature: sigmessage,
            modulus: n,
            publicE: e
        };

        var req = {
            url: server,
            method: 'POST',
            json:true,
            body: data

        };
        request(req, function (error, response, body){
            callback(response.body);
        });

    },
    sendMessageToThirdPart : function (origin, destination, sharedKey, thirdpart, d, n, e, ttp, callback) {

        var string = origin + "." + thirdpart + "." + destination + "." + sharedKey;
        var hash = CryptoJS.SHA256(string).toString();
        var signature = convertToHex(hash);
        var messageS = bigInt(signature, 16);
        var sigmessage = messageS.modPow(d, n);

        var data = {
            origin: origin,
            thirdpart: thirdpart,
            destination: destination,
            key: sharedKey,
            signature: sigmessage,
            modulus: n,
            publicE: e
        };

        var req = {
            url: ttp,
            method: 'POST',
            json:true,
            body: data

        };
        request(req, function (error, response,body){
            callback(response.body);
        });
    }
};

var noExpuesta = function () {

    /*
    HERE YOU CAN DO WHAT YOU WANT THAT ONLY THE FUNCTIONS INSIDE THE JS CAN ACCESS THEM
     */
};

function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex; }

function convertFromHex(hex) {
    var hex2 = hex.toString();
    var str = '';
    for (var i = 0; i < hex2.length; i += 2){
        str += String.fromCharCode(parseInt(hex2.substr(i, 2), 16))
    }
    return str; }
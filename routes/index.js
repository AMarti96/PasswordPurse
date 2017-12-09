var express = require('express');
var bodyParser = require( 'body-parser' );
var app = express();
var HashJS= require('crypto-js/sha256');
var CryptoJS = require("crypto-js");
var secrets= require("secrets.js");
var cors = require('cors');
var session = require('express-session');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin",  "*");
    res.header('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', "Content-Type, Authorization, Content-Length, X-Requested-With,X-Custom-Header,Origin");
    res.header('Access-Control-Allow-Credentials',"true");
    next();
});
var https = require('https');
var fs = require('fs');
var options = {
    key: fs.readFileSync('./certs/localhost.key'),
    cert: fs.readFileSync('./certs/localhost.cert'),
    requestCert: false,
    rejectUnauthorized: false
};
var router = express.Router();
var path = require('path');


app.use( bodyParser.urlencoded({ extended: true }) );

var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/purse", function (err) {
    if (!err) {
        console.log("We are connected")
    }
});

var Client=require("./client");
var Server = require("./server");
var AdminServer = require("./adminServer");
var TTPServer = require("./ttpServer");

app.use("/client",Client);
app.use("/server",Server);
app.use("/adminServer",AdminServer);
app.use("/ttp",TTPServer);

module.exports=app;

app.listen(3501, function () {
    console.log('App listening on port 3501!!')
});
var server = https.createServer(options, app).listen(3500, function(){
    console.log("Secure server started at port 3500!!");
});


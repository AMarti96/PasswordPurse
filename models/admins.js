/**
 * Created by Lazarus of Bethany on 30/11/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var admins = mongoose.Schema({

    name: String,
    password: String,
    userParts:[String]

});

var Admin = mongoose.model('admins', admins);
module.exports = Admin;
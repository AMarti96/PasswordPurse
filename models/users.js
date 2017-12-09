var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var users = mongoose.Schema({
    name: String,
    password: String,
    token:String
});
var User = mongoose.model('users', users);
module.exports = User;
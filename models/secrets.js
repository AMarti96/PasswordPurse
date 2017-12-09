var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var secrets = mongoose.Schema({

    category: String,
    user: String,
    secrets: [String]

});

var Secret = mongoose.model('secrets', secrets);
module.exports = Secret;
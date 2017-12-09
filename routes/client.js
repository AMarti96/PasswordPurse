var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/users');
var Secret = require('../models/secrets');

router.get('*', function(req, res){
    res.sendFile(path.join(__dirname, '../public/tpls/', 'error.html'));
});
module.exports = router;
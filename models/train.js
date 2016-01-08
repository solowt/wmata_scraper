require('../db/schema');
var mongoose = require('mongoose');

var Train = mongoose.model('Train');
module.exports = Train;

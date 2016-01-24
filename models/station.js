// station model exported from here

require('../db/schema');
var mongoose = require('mongoose');

var Station = mongoose.model('Station');
module.exports = Station;

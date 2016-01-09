var request = require('request');
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Line = require('../models/line.js');


// start the ball rolling
var initLines = function() {

}

// function to continually update lines (an array of lines?)
// setInterval or something else
var loopUpdate = function() {

}

// take all lines as an array, update every station's (nested on line)
// trains array.  do an api call for All trains.
var getAllTrains = function(lineArray) {

}

module.exports = {
  getAllTrains: getAllTrains
}

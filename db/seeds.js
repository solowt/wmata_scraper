// note: this file was used to generate static data and for testing functions
// it's not up to date and shouldn't be run

var mongoose = require('mongoose');
var Line = require('../models/line.js');
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Metro = require('../models/metro.js');
var functionLib = require('../function_lib/functions.js');
var util = require('util');

// we're not currently connected to a DB. but we were at one point, and the
// seeds scripts below do use .save()
// var conn = mongoose.connect('mongodb://localhost/wmata-scraper')

// clear the DB
Line.remove({}, function(err){
  Metro.remove({}, function(err){
  console.log("Error: "+err); // log errors
    console.log("Error: "+err);
    // enter static data
    var lines = ['RD', 'YL', 'GR', 'BL', 'OR', 'SV'];
    var firstStations = {
      RD: {name: 'Glenmont', code: 'B11'},
      YL: {name: 'Fort Totten', code: 'E06'},
      GR: {name: 'Greenbelt', code: 'E10'},
      BL: {name: 'Largo Town Center', code: 'G05'},
      OR: {name: 'New Carrollton', code: 'D13'},
      SV: {name: 'Largo Town Center', code: 'G05'}
    };
    var lastStations = {
      RD: {name: 'Shady Grove', code: 'A15'},
      YL: {name: 'Huntington', code: 'C15'},
      GR: {name: 'Branch Ave', code: 'F11'},
      BL: {name: 'Franconia-Springfield', code: 'J03'},
      OR: {name: 'Vienna/Fairfax-GMU', code: 'K08'},
      SV: {name: 'Wiehle-Reston East', code: 'N06'}
    };
    var metroData = {
                    lines: lines,
                    firstStations: firstStations,
                    lastStations: lastStations
                    };
    var wMetro = new Metro(metroData);

    // save static metro data, then
    wMetro.save().then(function(metro, err){
      var lineObj = {};
      for (var i=0; i<metro.lines.length; i++){ // get the stations on each line
        new Line({name: metro.lines[i]}).getStations(metro).then(function(line){
          var code = line.name; // code name for the line e.g. "RD," "YL," etc
          lineObj[code] = line;
          return new Promise(function(resolve, reject){
            if (Object.keys(lineObj).length == 6){ // if we have all stations for all six lines, then resolve promise
              console.log("Got station list.")
              resolve(lineObj);
            }
          });
        }).then(function(linesObj){
          functionLib.getDistances(linesObj).then(function(lo){
            functionLib.getAllTrains(lo).then(function(loi){ // get all trains on each line
              console.log(loi); // log the result
            })
          })
        })
      }
    })
  })
});

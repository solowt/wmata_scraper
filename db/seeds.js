var mongoose = require('mongoose');
var Line = require('../models/line.js');
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Metro = require('../models/metro.js');

var conn = mongoose.connect('mongodb://localhost/wmata-scraper')

Line.remove({}, function(err){
  console.log("Error: "+err);
  Metro.remove({}, function(err){
    console.log("Error: "+err);
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
    wMetro.save().then(function(metro, err){
      for (var i=0; i<metro.lines.length; i++){
        new Line({name: metro.lines[i], createdAt: Date()}).getStations(metro).then(function(line){
          line.save().then(function(line){
            console.log("Line Saved")
            line.update().then(function(theLine){
              theLine.save().then(function(thisLine){
                console.log("Trains Saved for "+thisLine.name+" line.")
                console.log("Num trains: "+thisLine.trains.length)
              })
            })
          })
        })
      }
    })
  })
});

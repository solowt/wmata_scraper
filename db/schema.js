var mongoose = require('mongoose');
var env = require('../env.js');
var request = require('request');


// mongoose.connect('mongodb://localhost/wmata-scraper');

var Schema = mongoose.Schema;

var MetroSchema = new Schema({
  lines: [String],
  firstStations: Object,
  lastStations: Object

});

var TrainSchema = new Schema({
  createdAt: Date,
  status: String,
  dest: String,
  destCode: String,
  location: String,
  locationCode: String,
  numCars: Number,
  line: String
});

var StationSchema = new Schema({
  createdAt: Date,
  name: String,
  code: String,
  line: String,
  sequence: Number,
  distPrev: Number,
  timePrev: Number

});

var LineSchema = new Schema({
  name: String,
  createdAt: Date,
  stations: [StationSchema],
  totalTime: Number,
  totalDist: Number,
  numStations: Number,
  trains: [TrainSchema]

});



// edit to use get path between
// run in seeds to get stations+some data
LineSchema.methods.getStations = function(metro) {
  var self = this;
  return new Promise(function(resolve, reject){
    var url = "https://api.wmata.com/Rail.svc/json/jPath?FromStationCode="+metro.firstStations[self.name].code+"&ToStationCode="+metro.lastStations[self.name].code+"&api_key="+env.apiKey;
    request(url, function(err, res){
      if (!err){
        var resJSON = JSON.parse(res.body);
        self.numStations = resJSON.Path.length;
        var distanceCounter = 0;
        for (var i=0; i<self.numStations; i++) {
          distanceCounter+= resJSON.Path[i].DistanceToPrev;
          var data = {
            createdAt: Date(),
            line: self.name,
            name: resJSON.Path[i].StationName,
            code: resJSON.Path[i].StationCode,
            sequence: resJSON.Path[i].SeqNum,
            distPrev: resJSON.Path[i].DistanceToPrev
          }
          var station = new Station(data);
          self.stations.push(station);
        }
        self.totalDist = distanceCounter;
        resolve(self);
      }
    })
  })
};

// may use this method to add more information to the line.
// maybe not though.  possibly get lat/long here using
// https://developer.wmata.com/docs/services/5476364f031f590f38092507/operations/5476364f031f5909e4fe3311
LineSchema.methods.build = function() {

};

// update all trains on a line here, maybe also check for delays
// call this to get an update on a line
LineSchema.methods.update = function() {
  var self = this;
  var queryStr = "";
  for (var i=0; i<this.stations.length; i++){
    queryStr+=this.stations[i].code;
    queryStr+=",";
  }
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/"+queryStr+"?api_key="+env.apiKey
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      if (!err){
        resJSON = JSON.parse(res.body);
        for (var i=0;i<resJSON.Trains.length;i++){
          if (resJSON.Trains[i].DestinationName && resJSON.Trains[i].Min && resJSON.Trains[i].Min.length > 0){
            var data = {
              createdAt: Date(),
              status: resJSON.Trains[i].Min,
              dest: resJSON.Trains[i].DestinationName,
              destCode: resJSON.Trains[i].DestinationCode,
              location: resJSON.Trains[i].LocationName,
              locationCode: resJSON.Trains[i].LocationCode,
              numCars: resJSON.Trains[i].Car,
              line: resJSON.Trains[i].Line
            }
            var train = new Train(data);
            self.trains.push(train);
          }
        }
        resolve(self);
      }
    })
  })
};

// function to eliminate "ghost trains," ie train duplicates
// call this after .update is called, also exlcude trains not
// on that line
LineSchema.methods.killGhosts = function() {
  for (var i=0; i<this.trains.length;i++){

  }
};

// function to get the position of a train on a line
TrainSchema.methods.getPos = function() {

};

// use this to get direction of a train based on its position
// and destination
TrainSchema.methods.getDirection = function() {

};

mongoose.model('Line', LineSchema);
mongoose.model('Train', TrainSchema);
mongoose.model('Station', StationSchema);
mongoose.model('Metro', MetroSchema);
var Station = require('../models/station.js')
var Train = require('../models/train.js')

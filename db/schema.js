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
  line: String,
  position: Number, //this is the position on a line, use to kill ghosts
  direction: String //2 possible directions, inbound and outbound
});

// function to get the position of a train on a line
TrainSchema.methods.getPos = function() {


};

// use this to get direction of a train based on its position
// and destination.  maybe don't need this
TrainSchema.methods.getDirection = function() {

};

var StationSchema = new Schema({
  createdAt: Date,
  averageWait: Object, // average distance between all incoming trains
  name: String,
  code: String,
  line: String,
  sequence: Number,
  distPrev: Number,
  timePrev: Number,
  trains: [TrainSchema]

});

// get the inbound trains on one station only
// probably delete this
StationSchema.methods.getTrains = function() {
  var self = this;
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/"+this.code+"?api_key="+env.apiKey;
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      if (!err){
        resJSON = JSON.parse(res.body);
        if (resJSON.Trains) {
          for (var i=0;i<resJSON.Trains.length;i++){
            if (functionLib.validTrain(resJSON.Trains[i])){
              var train = new Train(functionLib.constructTrainData(resJSON.Trains[i]));
              self.trains.push(train);
            }
          }
        }
        resolve(self);
      }
    })
  })
}

var LineSchema = new Schema({
  name: String,
  createdAt: Date,
  stations: [StationSchema],
  totalTime: Number,
  totalDist: Number,
  numStations: Number,
  trains: [TrainSchema]

});

//sort trains maybe don't need
LineSchema.methods.sortTrains = function() {

}

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

// function to get the average wait time for each station on a
// line.  need to get a separate avg for each direction, save as
// object with 2 keys. simply avg of every inbound train in min.
// don't need api call for this method...do this after getAllTrains
LineSchema.methods.getAvgWait = function() {
  for (var i=0;i<this.stations.length;i++){
    var diffsIn = [];
    var diffsOut = [];
    for (var j=0;j<this.stations[i].trains.length;j++){
      if (this.stations[i].trains[j].direction == "1"){
        var time1 = functionLib.getNumber(this.stations[i].trains[j].status);
        for (var k=j+1; k< this.stations[i].trains.length; k++){
          if (this.stations[i].trains[k].direction == "1"){
            var time2 = functionLib.getNumber(this.stations[i].trains[k].status);
            diffsIn.push(time2-time1);
            break;
          }
        }
        if (!time2){
          diffsIn.push(time1);
        }
      }else if (this.stations[i].trains[j].direction == "2"){
        var time1 = functionLib.getNumber(this.stations[i].trains[j].status);
      }
    }
    var waitObj = {
                  in: averageIn/numIn,
                  out: averageOut/numOut
                  };
    console.log(waitObj)
    }
};

// function to eliminate "ghost trains," ie train duplicates
// call this after .update is called, also exlcude trains not
// on that line
LineSchema.methods.killGhosts = function() {
  for (var i=0; i<this.trains.length;i++){

  }
};

mongoose.model('Line', LineSchema);
mongoose.model('Train', TrainSchema);
mongoose.model('Station', StationSchema);
mongoose.model('Metro', MetroSchema);
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Line = require('../models/line.js');
var functionLib = require('../function_lib/functions.js');

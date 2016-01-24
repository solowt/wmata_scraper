var mongoose = require('mongoose');
var fs = require("fs");
// api keys set here depending on what is set
var env = fs.existsSync("./env.js") ? require("../env") : process.env;
var request = require('request');

var Schema = mongoose.Schema;

// this model is used only for the purpose of generating static data
// in the seeds.js file.  it holds some basic information about the DC
// metro and its lines and stations.  this data is hardcoded in seeds.js
var MetroSchema = new Schema({
  lines: [String],
  firstStations: Object,
  lastStations: Object
});

mongoose.model('Metro', MetroSchema);

// this schema will represent each train.  will be stored on arrays on each station
// as well as arrays on each line
var TrainSchema = new Schema({
  createdAt: Date, // not currently used
  status: String, // minutes ETA or ARR or BRD
  dest: String, // final destination
  destCode: String, // code of destination e.g. "A01"
  location: String, // station the train is arriving at
  locationCode: String, // code of the station the train is arriving at
  numCars: Number, // number of cars on the train, we do set this but don't currently use it
  line: String, // line this train belongs to
  position: Number, // not used, currently, may store this train's "sequence" in a line
  direction: String // the rail this train is on, can be 1 or 2. corresponds to "group" field returned by wmata
});

mongoose.model('Train', TrainSchema);

// this schema represents stations.  each line will have an array of stations, in order
var StationSchema = new Schema({
  averageWait: Object, // average distance between all incoming trains, not currently used
  name: String, // name of station
  code: String, // code of station
  line: String, // line of station
  sequence: Number, // sequence on the line, starts at 1
  distPrev: Number, // distance to previous station (in feet)
  timePrev: Number, // time to previous station (in minutes)
  timeNext: Number, // time to next station (minutes)
  trainsIn: [TrainSchema], // array of trains moving in one direction
  trainsOut: [TrainSchema] // array of trains moving in the other direction
});

// get the inbound trains on one station only
// not currently used
StationSchema.methods.getTrains = function() {
  var self = this;
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/"+this.code+"?api_key="+env.KEY;
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      if (!err){
        resJSON = JSON.parse(res.body);
        if (resJSON.Trains) {
          for (var i=0;i<resJSON.Trains.length;i++){
            if (functionLib.validTrain(resJSON.Trains[i])){
              var train = new Train(functionLib.constructTrainData(resJSON.Trains[i]));
              console.log(train.direction)
              if (train.direction = "2"){
                self.trainsOut.push(train);
              } else if (train.direction = "1"){
                self.trainsOut.push(train);
              }
            }
          }
        }
        resolve(self);
      }
    })
  })
}

mongoose.model('Station', StationSchema);

// schema for lines, a line will hold trains that we esimate are on that line
// as well as various information about that line + an array of ordered stations
var LineSchema = new Schema({
  name: String, // name
  numTrains: Number, // number of trains on that line, not used currently
  stations: [StationSchema], // station lsit in order
  totalTime: Number, // total minutes travel time
  totalDist: Number, // total feet
  numStations: Number, // number of stations
  trainsIn: [], // trains going in one direction, this will be an array of arrays, which will hold trains
  trainsOut: [] // same as above, opposte direction

});

// gets total number of trains on a line.  simple for loop
LineSchema.methods.getTrainNum = function() {
  var trains = 0;
  for (var i=0; i<this.stations.length; i++){
    trains+=this.stations[i].trainsIn.length;
    trains+=this.stations[i].trainsOut.length;
  }
  console.log(this.name+": "+trains)
  this.numTrains = trains;
}

// used to get static data: stations on each line in order
LineSchema.methods.getStations = function(metro) {
  var self = this;
  return new Promise(function(resolve, reject){
    var url = "https://api.wmata.com/Rail.svc/json/jPath?FromStationCode="+metro.firstStations[self.name].code+"&ToStationCode="+metro.lastStations[self.name].code+"&api_key="+env.KEY;
    request(url, function(err, res){
      if (!err){
        var resJSON = JSON.parse(res.body);
        self.numStations = resJSON.Path.length;
        var distanceCounter = 0;
        for (var i=0; i<self.numStations; i++) {
          distanceCounter+= resJSON.Path[i].DistanceToPrev;
          var data = {
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
// line.  not currently used/functional
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

// function to elminate duplicate trains ona  line
// this version is not used, instead we use filterTrains in
// function library
LineSchema.methods.killGhosts = function() {
  for (var i=0; i<this.stations.length;i++){
    for (var j=0; j<this.stations[i].trains.length; j++) {
      var eta = functionLib.getNumber(this.stations[i].trains[j].status)
      if (eta < this.stations[i].trains[j].timePrev){
        this.trains.push(this.stations[i].trains[j]);
      }
    }
  }
};

// clear all trains on a given line, used in between updates
LineSchema.methods.clearTrains = function() {
  for (var i=0; i<this.stations.length; i++){
    this.stations[i].trainsIn = [];
    this.stations[i].trainsOut = [];
  }
}

// get all trains on one line, not currently used, but functional
// the issue here is that we'd rather get all the train data will one
// api call
LineSchema.methods.getTrains = function(){
  this.clearTrains();
  var self = this;
  var queryStr = '';
  for (var i=0; i<this.stations.length; i++){
    queryStr += this.stations[i].code;
    queryStr +=',';
  }
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/"+queryStr+"?api_key="+env.KEY;
  // console.log(this.name+": "+queryStr)
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      if (!err) {
        resJSON = JSON.parse(res.body);
        if (resJSON.Trains){
          for (var i=0;i < resJSON.Trains.length; i++){
            if (functionLib.validTrain(resJSON.Trains[i])) {
              var locationCode = resJSON.Trains[i].LocationCode;
              var newTrain = new Train(functionLib.constructTrainData(resJSON.Trains[i]));
              if (newTrain.direction == "2"){
                self.stations.find(functionLib.findStations.bind({loc:locationCode})).trainsOut.push(newTrain);
              } else if (newTrain.direction == "1"){
                self.stations.find(functionLib.findStations.bind({loc:locationCode})).trainsIn.push(newTrain);
              }
            }
          }
          self.getTrainNum();
          resolve(self);
        }
      } else {
        console.log("Error: "+err);
      }
    });
  });
}
mongoose.model('Line', LineSchema);

// requires model so they can be used in the above schcema methods
var Train = require('../models/train.js');
var Station = require('../models/station.js');
var Line = require('../models/line.js');
var functionLib = require('../function_lib/functions.js');

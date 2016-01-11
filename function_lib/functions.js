var request = require('request');
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Line = require('../models/line.js');
var env = require('../env.js');

// take all lines as an array, update every station's (nested on line)
// trains array.  do an api call for All trains. lineObj = {code=>Line}
var getAllTrains = function(lineObj) {
  var self = this;
  lineObj = clearTrains(lineObj);
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/All?api_key="+env.apiKey;
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      resJSON = JSON.parse(res.body);
      if (resJSON.Trains) {
        for (var i=0;i < resJSON.Trains.length; i++){
          if (validTrain(resJSON.Trains[i])) {
            var locationCode = resJSON.Trains[i].LocationCode;
            var lineCode = resJSON.Trains[i].Line;
            var newTrain = new Train(constructTrainData(resJSON.Trains[i]));
            lineObj[lineCode].stations.find(findStations.bind({loc:locationCode})).trains.push(newTrain);
          }
        }
      resolve(lineObj);
      }
    });
  });
}

// clear all the trains from the stations on a line object
// (lineObj = {code=>Line})
var clearTrains = function(lineObj) {
  for (var key in lineObj){
    for (var i=0; i<lineObj[key].stations.length; i++){
      lineObj[key].stations[i].trains = [];
    }
  }
  return lineObj;
}

// check to make sure a train is valid ie it has all necessary data
// attached. some trains will be missing this info and should not be
// considered.
var validTrain = function(train) {
  if (train.DestinationName && train.Min && train.Min.length > 0 && train.DestinationName != "No Passenger" && train.Line != "--"){
    return true;
  }else{
    return false;
  }
}

// finds and returns a given station based on a code, used to search
// an array and return one element (a station) within that array
var findStations = function(element, index, array){
  if (element.code == this.loc){
    return true;
  } else {
    return false;
  }
}

// take a single element on a wmata train array and construct a
// train model data object from that data
var constructTrainData = function(data){
  var trainData = {
    createdAt: Date(),
    status: data.Min,
    dest: data.DestinationName,
    destCode: data.DestinationCode,
    location: data.LocationName,
    locationCode: data.LocationCode,
    numCars: data.Car,
    line: data.Line,
    direction: data.Group
  }
  // console.log(data.Group)
  return trainData;
}

// currently hard coded - this not in use.  will have to make object later.
var makeLineObj = function(line){
  var code = line.name;
  console.log(this.lineObj)
  console.log(lineObj)
  this.lineObj[code] = line;
  console.log(Object.keys(this.lineObj).length)
  return new Promise(function(resolve, reject){
    if (Object.keys(this.lineObj).length == 6){
      resolve(this.lineObj);
    }
  });
}

// takes an input of a string and parses it as an int. unless it is equal
// to "BRD" or "ARR" and then returns 0
var getNumber = function(str){
  if (str=="BRD" || str=="ARR"){
    return 0;
  }else{
    return parseInt(str);
  }
}

// function to get the distance between a station and previous in minutes
// loops through a station array and adds this information to the station
var getDistances = function(linesObj) {
  var apiKey = env.apiKey;
  return new Promise(function(resolve, reject){
    request("https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo?FromStationCode=&ToStationCode=&api_key="+apiKey, function(err, res){
      var resJSON = JSON.parse(res.body);
      for (var i=0; i<resJSON.StationToStationInfos; i++){
        var targetCode = resJSON.StationToStationInfos[i].DesinationCode;
        for (key in linesObj){
          var aStation = linesObj[key].stations.find(findStations.bind({loc:targetCode}))
          if (aStation){
            if (!aStation.timePrev || aStation.timePrev>resJSON.StationToStationInfos[i].RailTime){
              aStation.timePrev = resJSON.StationToStationInfos[i].RailTime;
            }
          }
        }
      }
    })
  });
};

module.exports = {
  getAllTrains: getAllTrains,
  validTrain: validTrain,
  constructTrainData: constructTrainData,
  makeLineObj: makeLineObj,
  clearTrains: clearTrains
}

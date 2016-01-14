var mongoose = require('mongoose');
var request = require('request');
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Line = require('../models/line.js');
var fs = require("fs");
var env = fs.existsSync("./env.js") ? require("../env") : process.env;

// take all lines as an array, update every station's (nested on line)
// trains array.  do an api call for All trains. lineObj = {code=>Line}
// this has a bug, not currently in use.
var getAllTrains = function(lineObj) {
  lineObj = clearTrains(lineObj);
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/All?api_key="+env.KEY;
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      resJSON = JSON.parse(res.body);
      if (resJSON.Trains) {
        for (var i=0;i < resJSON.Trains.length; i++){
          if (validTrain(resJSON.Trains[i])) {
            var locationCode = resJSON.Trains[i].LocationCode;
            var lineCode = resJSON.Trains[i].Line;
            var newTrain = new Train(constructTrainData(resJSON.Trains[i]));
            for (var j=0; j<lineObj[lineCode].stations.length; j++){
              if (lineObj[lineCode].stations[j].code == locationCode){
                if (newTrain.direction == "2"){
                  lineObj[lineCode].stations[j].trainsOut.push(newTrain);
                } else if (newTrain.direction == "1"){
                  lineObj[lineCode].stations[j].trainsIn.push(newTrain);
                } else{
                  console.log("else")
                }
              }
            }
          }
        }
        getTrainNumWrapper(lineObj);
        resolve(lineObj);
      }
    });
  });
}

var getTrainsWrapper = function (linesObj){
  var counter = 0;
  var numKeys = Object.keys(linesObj).length;
  return new Promise(function(resolve, reject){
    for (var key in linesObj){
      linesObj[key].getTrains().then(function(){
        // console.log(counter)
        if (++counter == numKeys){
          resolve(linesObj);
        }
      });
    }
  });
}

var getTrainNumWrapper = function(lineObj) {
  for (var key in lineObj){
    lineObj[key].getTrainNum();
  }
}

// clear all the trains from the stations on a line object
// (lineObj = {code=>Line}) not currently used!
var clearTrains = function(lineObj) {
  for (var key in lineObj){
    for (var i=0; i<lineObj[key].stations.length; i++){
      lineObj[key].stations[i].trainsIn = [];
      lineObj[key].stations[i].trainsOut = [];
    }
  }
  return lineObj;
}

// check to make sure a train is valid ie it has all necessary data
// attached. some trains will be missing this info and should not be
// considered.
var validTrain = function(train) {
  if (train.DestinationName && train.Min && train.Min.length > 0 && train.DestinationName != "No Passenger" && train.Line != "--" && train.Car != null && train.Car != '-'){
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
  var KEY = env.KEY;
  return new Promise(function(resolve, reject){
    request("https://api.wmata.com/Rail.svc/json/jSrcStationToDstStationInfo?FromStationCode=&ToStationCode=&api_key="+KEY, function(err, res){
      var resJSON = JSON.parse(res.body);
      for (var i=0; i<resJSON.StationToStationInfos.length; i++){
        var targetCode = resJSON.StationToStationInfos[i].DestinationStation;
        var sourceCode = resJSON.StationToStationInfos[i].SourceStation;
        for (var key in linesObj){
          for (var j=1;j<linesObj[key].stations.length; j++){
            if (linesObj[key].stations[j].code == targetCode && linesObj[key].stations[j-1].code == sourceCode){
              linesObj[key].stations[j].timePrev = resJSON.StationToStationInfos[i].RailTime;
              console.log(linesObj[key].stations[j-1].name+" to "+linesObj[key].stations[j].name+": "+resJSON.StationToStationInfos[i].RailTime);
            } else if (j<linesObj[key].stations.length-1 && linesObj[key].stations[j].code == sourceCode && linesObj[key].stations[j+1].code == targetCode){
              linesObj[key].stations[j].timeNext = resJSON.StationToStationInfos[i].RailTime;
              console.log(linesObj[key].stations[j].name+" to "+linesObj[key].stations[j+1].name+": "+resJSON.StationToStationInfos[i].RailTime);
            }
          }
        }
      }
      for (var aKey in linesObj){
        linesObj[aKey].stations[0].timeNext = linesObj[aKey].stations[1].timePrev;
      }
      console.log("Got rail estimated time diffs (minutes).")
      resolve(linesObj)
    });
  });
};

var killGhostsWrapper = function(linesObj){
  for (var key in linesObj){
    linesObj[key].killGhosts();
  }
  return linesObj;
}

var getIncidents = function(){
  var url="https://api.wmata.com/Incidents.svc/json/Incidents?api_key="+env.KEY;
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      if (!err){
        resJSON = JSON.parse(res.body);
        if (resJSON.Incidents){
          var resp = [];
          for (var i=0; i<resJSON.Incidents.length; i++){
            var resObj = {
                        lines: resJSON.Incidents[i].LinesAffected.split(/;[\s]?/).filter(function(fn) { return fn !== ''; }),
                        message: resJSON.Incidents[i].Description,
                        type: resJSON.Incidents[i].IncidentType,
                        date: resJSON.Incidents[i].DateUpdated
                        }
            resp.push(resObj);
          }
        }
        resolve(resp)
      }
    });
  });
}

module.exports = {
  getAllTrains: getAllTrains,
  validTrain: validTrain,
  constructTrainData: constructTrainData,
  makeLineObj: makeLineObj,
  clearTrains: clearTrains,
  getDistances: getDistances,
  killGhostsWrapper: killGhostsWrapper,
  getNumber: getNumber,
  findStations: findStations,
  getTrainsWrapper: getTrainsWrapper,
  getIncidents: getIncidents
};

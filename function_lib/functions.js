var mongoose = require('mongoose');
var request = require('request');
var Station = require('../models/station.js');
var Train = require('../models/train.js');
var Line = require('../models/line.js');
var fs = require("fs");
var env = fs.existsSync("./env.js") ? require("../env") : process.env;


// this is currently how we get all the trains for each line.  takes a 'line object'
// i.e. keys are line codes and values are lines (defined by schema file).  this uses the wmata
// api to get a list of all trains.  this list (~400 trains) is parsed through and
// each train is pushed onto the station to which is arriving.  the same train may exist on
// multiple stations when two different lines share a rail.
var getAllTrains = function(lineObj) {
  clearTrains(lineObj);
  var url = "https://api.wmata.com/StationPrediction.svc/json/GetPrediction/All?api_key="+env.KEY;
  return new Promise(function(resolve, reject){
    request(url, function(err, res){
      if (!err){
        resJSON = JSON.parse(res.body);
        if (resJSON.Trains) {
          for (var i=0;i < resJSON.Trains.length; i++){
            if (validTrain(resJSON.Trains[i])) {
              var locationCode = resJSON.Trains[i].LocationCode;
              var lineCode = resJSON.Trains[i].Line;
              var newTrain = new Train(constructTrainData(resJSON.Trains[i]));
              for (var line in lineObj){
                for (var j=0; j<lineObj[line].stations.length; j++){
                  if (lineObj[line].stations[j].code == locationCode){
                    if (newTrain.direction == "2"){
                      lineObj[line].stations[j].trainsOut.push(newTrain);
                    } else if (newTrain.direction == "1"){
                      lineObj[line].stations[j].trainsIn.push(newTrain);
                    } else{
                      console.log("Train didn't match.")
                    }
                  }
                }
              }
            }
          }
          resolve(lineObj);
        }
      } else{
        console.log(err);
      }
    });
  });
}

// not currently used, simply a wrapper around a schema method to get
// all trains on a line
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

// a wrapper to get the number of trains on each line
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
// an array and return one element (a station) within that array.  this is
// used with the array.find(callback) js function
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

// not used. function to construct an object from a list of lines
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
// to "BRD" or "ARR" and then returns 0. not currently used
var getNumber = function(str){
  if (str=="BRD" || str=="ARR"){
    return 0;
  }else{
    return parseInt(str);
  }
}

// function to get the distance between a station and previous in minutes
// loops through a station array and adds this information to the station
// used to generate static data only
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

// simple function to empty trains attached to each line
var emptyTrains = function(lineObject){
  for (var k in lineObject){
    lineObject[k].trainsIn = [];
    lineObject[k].trainsOut = [];
  }
}

// go through all the trains on each station.  push trains that I suspect to be real, or just push the closest train
// this data will be sent with the line object ot the front-end
var filterTrains = function(linesObj){
  emptyTrains(linesObj);
  for (var line in linesObj){
    var numStations = linesObj[line].stations.length;
    linesObj[line].trainsOut = Array.apply(null, Array(numStations)).map(function(){return [];});
    linesObj[line].trainsIn = Array.apply(null, Array(numStations)).map(function(){return [];});
    for (var i=0; i < numStations; i++){
      for (var j=0; j < linesObj[line].stations[i].trainsIn.length; j++){
        if (linesObj[line].stations[i].trainsIn[j].status == "BRD" || linesObj[line].stations[i].trainsIn[j].status == "ARR"){
          linesObj[line].trainsIn[i].push(linesObj[line].stations[i].trainsIn[j]);
        }else if (parseInt(linesObj[line].stations[i].trainsIn[j].status) <= 2 || parseInt(linesObj[line].stations[i].trainsIn[j].status) <= linesObj[line].stations[i].timePrev){
          linesObj[line].trainsIn[i].push(linesObj[line].stations[i].trainsIn[j]);
        } else if (j==0){
          linesObj[line].trainsIn[i].push(linesObj[line].stations[i].trainsIn[j]);
        }
      }
      for (var k=0; k < linesObj[line].stations[i].trainsOut.length; k++){
        if (linesObj[line].stations[i].trainsOut[k].status == "BRD" || linesObj[line].stations[i].trainsOut[k].status == "ARR"){
          linesObj[line].trainsOut[i].push(linesObj[line].stations[i].trainsOut[k]);
        }else if (parseInt(linesObj[line].stations[i].trainsOut[k].status) <= 2 || parseInt(linesObj[line].stations[i].trainsOut[k].status) <= linesObj[line].stations[i].timeNext){
          linesObj[line].trainsOut[i].push(linesObj[line].stations[i].trainsOut[k]);
      } else if(k==0){
          linesObj[line].trainsOut[i].push(linesObj[line].stations[i].trainsOut[k]);
        }
      }
    }
  }
  return linesObj;
}

// gets incicents from wmata's api
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

// export functions
module.exports = {
  getAllTrains: getAllTrains,
  validTrain: validTrain,
  constructTrainData: constructTrainData,
  makeLineObj: makeLineObj,
  clearTrains: clearTrains,
  getDistances: getDistances,
  getNumber: getNumber,
  findStations: findStations,
  getTrainsWrapper: getTrainsWrapper,
  getIncidents: getIncidents,
  filterTrains: filterTrains
};

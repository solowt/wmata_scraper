var mongoose = require('mongoose');
var Train = require('./models/train.js');
var Line = require('./models/line.js');
var Station = require('./models/station.js');
var functionLib = require('./function_lib/functions.js')
var obj = require('./linesObject.js')

var returnObject = {};

for (var key in obj){
  var newLine = new Line(obj[key]);
  returnObject[key]=newLine
}

module.exports=returnObject;

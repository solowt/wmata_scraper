var express = require('express');
var router = require('./config/routes');
var bodyParser = require('body-parser');
var Station = require('./models/station.js');
var Train = require('./models/train.js');
var Line = require('./models/line.js');
var functionLib = require('./function_lib/functions.js')
var lineObject = require('./structer.js')
// var mongoose = require('mongoose');


var app = express();
app.use(bodyParser.json());
//app.set("views") set templating here is necessary

app.use(express.static(__dirname + '/public'));


app.get('/lines/:code', function(req, res){
  var line = lineObject[req.params.code];
  line.getTrains().then(function(l){
    console.log("Got all Trains for "+req.params.code+" line.")
    res.json(l)
  });
});

app.get('/lines', function(req, res){
  functionLib.getTrainsWrapper(lineObject).then(function(o){
    console.log("Got all Trains per each line.")
    res.json(o);
  })
});

// app.get('/', function(req, res) {
//   res.sendfile('./public/');
// });

app.listen(3000, function(){
  console.log("App listening on port 3000.")
})

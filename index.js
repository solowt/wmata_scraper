var express = require('express');
var router = require('./config/routes');
var bodyParser = require('body-parser');
var Train = require('./models/train.js');
var Line = require('./models/line.js');
var Station = require('./models/station.js');
var functionLib = require('./function_lib/functions.js')
var obj = require('./linesObject.js')

console.log(obj);
var app = express();
app.use(bodyParser.json());
//app.set("views") set templating here is necessary

// app.use(router);
app.get('/', function(req, res){

})
app.listen(3000, function(){
  console.log("App listening on port 3000.")
})

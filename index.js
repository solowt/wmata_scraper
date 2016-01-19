var express = require('express');
var bodyParser = require('body-parser');



var Line = require('./models/line.js');
var functionLib = require('./function_lib/functions.js')
var lineObject = require('./structer.js')
var cors = require('cors');

var app = express();
app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

app.get('/lines/:code', cors(), function(req, res){
  var line = lineObject[req.params.code];
  line.getTrains().then(function(l){
    console.log("Got all Trains for "+req.params.code+" line.")
    res.json(l)
  });
});

app.get('/lines', cors(), function(req, res){
  functionLib.getTrainsWrapper(lineObject).then(function(o){
    console.log("Got all Trains per each line.")
    res.json(o);
  });
});

app.get('/incidents', cors(), gfunction(req, res){
  functionLib.getIncidents().then(function(resp){
    res.json(resp);
  });
});

app.listen(app.get('port'), function(){
  console.log("App listening on port", app.get('port'))
})

var express = require('express');
var bodyParser = require('body-parser');

var Line = require('./models/line.js');
var functionLib = require('./function_lib/functions.js')
var cors = require('cors');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

// var lineObject = require('./structer.js')
var lineObject = require('./linesObject.js');
var incidents = [];
var callCounter = 0;
var trainsLoop = function(){
  if (callCounter == 100){
    callCounter = 0;
    global.gc();
    lineObject = require('./structer.js');
    return;
  }
  var counter = 0;
  return new Promise(function(resolve, reject){
    functionLib.getAllTrains(lineObject).then(function(){
      functionLib.filterTrains(lineObject);
      console.log(++callCounter + ": Got all trains.");
      for (var k in lineObject){
        var ina = 0;
        var out = 0;
        for (var b=0; b<lineObject[k].trainsIn.length; b++){
          ina+=lineObject[k].trainsIn[b].length;
        }
        for (var c=0; c<lineObject[k].trainsOut.length; c++){
          out+=lineObject[k].trainsOut[c].length;
        }
        console.log(k+" in: "+ina+"| out: "+out);
      }
      console.log(lineObject);
      io.emit('line', lineObject);
      if (++counter==2){
        resolve();
      }
    });
    functionLib.getIncidents().then(function(incidents){
      io.emit('incidents', incidents);
      if(++counter==2){
        resolve();
      }
    });
  }).then(function(){ setTimeout(trainsLoop, 10000); });
}

io.on('connection', function(socket){
  socket.on('getTrains', function(){
    if (callCounter == 0){
      trainsLoop();
    }
    console.log("Sending current trains.")
    io.emit("line", lineObject);
    io.emit('incidents', incidents);
  })
});

server.listen(app.get('port'), function(){
  console.log("App listening on port", app.get('port'));
});

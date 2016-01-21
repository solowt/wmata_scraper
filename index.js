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

var lineObject = require('./structer.js')
var incidents = [];
var callCounter = 0;
var trainsLoop = function(){
  if (callCounter == 100){
    global.gc()
  }
  var counter = 0;
  return new Promise(function(resolve, reject){
    functionLib.getAllTrains(lineObject).then(function(){
      console.log(++callCounter + ": Got all trains.");
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

trainsLoop();
//
// intervalID = setInterval(function(){
//   functionLib.getAllTrains(lineObject).then(function(){
//     console.log("Got all trains.")
//     io.emit('line', lineObject);
//   })
//   functionLib.getIncidents().then(function(incidents){
//     io.emit('incidents', incidents);
//   })
// }, 10000);

io.on('connection', function(socket){
  socket.on('getTrains', function(){
    console.log("Sending current trains.")
    io.emit("line", lineObject);
    io.emit('incidents', incidents);
  })
});

server.listen(app.get('port'), function(){
  console.log("App listening on port", app.get('port'));
});

var express = require('express'); // express
var Line = require('./models/line.js'); // the line model
var functionLib = require('./function_lib/functions.js') // functions from library
var cors = require('cors'); // cors module to allow cross origin reqs

var app = express(); // create app via express
var server = require('http').Server(app); // create server, pass in express server
var io = require('socket.io')(server); // instantiate websockets from socket.io module

app.set('port', (process.env.PORT || 3000)); // set port to listen on

app.use(express.static(__dirname + '/public')); // serve static assets inside public folder

var lineObject = require('./linesObject.js'); // require the empty static lines model
var incidents = []; // instantiate incidents as empty

// call counter, is used to reset the setTimeout loop at some point due to memory issues.
// hope to find a better way to do this.
var callCounter = 0;

// update trains in a loop with this function
var trainsLoop = function(){
  // stop this loop and init garbage collection if we've made 100 calls
  if (callCounter == 100){
    callCounter = 0;
    global.gc();
    lineObject = require('./linesObject.js');
    return;
  }
  // else loop through and get trains
  var counter = 0;
  return new Promise(function(resolve, reject){
    functionLib.getAllTrains(lineObject).then(function(){ // get trains here from wmata api
      functionLib.filterTrains(lineObject); // filter the total list of trains into trainsIn/Out arrays on each line
      console.log(++callCounter + ": Got all trains.");
      // counts up the number of trains we're sending in trainsIn/Out on each line and prints it
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
      // once we have all the trains, use websockets to emit the data to all clients listening
      io.emit('line', lineObject);
      if (++counter==2){
        resolve(); // if we have incidents and trains, resolve the promise
      }
    });
    functionLib.getIncidents().then(function(incidents){ // get the incidents from wmata
      io.emit('incidents', incidents); // emit the incidents as soon as we have them
      if(++counter==2){ // if we have trains and incidents, resolve the promise
        resolve();
      }
    });
    // calls itself after a delay, I believe this is preferable compared to using setInterval
  }).then(function(){ setTimeout(trainsLoop, 10000); });
}


io.on('connection', function(socket){
  socket.on('getTrains', function(){
    if (callCounter == 0){ // start the loop here if one is not currently running
      trainsLoop();
    }
    console.log("Sending current trains.") // send the data we have currently
    io.emit("line", lineObject); // emit line data
    io.emit('incidents', incidents); // emit incident data
  })
});

// tell server to listen here
server.listen(app.get('port'), function(){
  console.log("App listening on port", app.get('port'));
});

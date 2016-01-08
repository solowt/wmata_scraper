var request = require('request');

function Line (data) {
  // data should include:
  // stations (array of station objects)
  // totalTime (total time in minutes/length of line)
  // numStations (the total number of stations in a line)
  // trains (an array of train objects, generated through .update())
  this.createdAt = Date();
  this.data = data;
}

// build the line here, get stations, totalTime, numStations
Line.prototype.build = function() {

}

// update trains here, maybe also check for delays
// make use of getPos on each train that is returned.
Line.prototype.update = function() {

}

// function to eliminate "ghost trains," ie train duplicates
Line.prototype.killGhosts = function() {

}

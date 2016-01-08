var request = require('request');

// data structure to represent a train
function Train(data) {
  // data should include:
  // location (next station)
  // status (minutes ETA/ARR/BRD)
  // destination (final dest)
  // num_cars (int)
  // line: (RD/YL/ETC)
  // maybe more
  this.createdAt = Data();
  this.data = data;
  // populated by getDirection below
  this.direction = null;

}

// function to get the position of a train on a line
// may use this to try to eliminate ghost trains
Train.prototype.getPos = function() {
  console.log("getting Pos")
}

// function to get the direction the train is traveling in
// based on its destination
Train.prototype.getDirection = function() {

}

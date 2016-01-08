var request = require('request');

function Station(data) {
  // data should include:
  // name (name of station)
  // distNext (the time in minutes to the next station)
  // distPrev (the time in minutes to the previous station)

  this.createdAt = Date();
  this.data = data;
}

var request = require('request');

request("https://api.wmata.com/StationPrediction.svc/json/GetPrediction/All?api_key=635e0ed2348f420cbe874f1bcd5d1b11", function(err, data){
  var resp = JSON.parse(data.body);
  console.log(resp.Trains.length);
})

(function(){
  angular
  .module("lines")
  .controller("LineShowController", [
    "LineFactory",
    "$stateParams",
    "$state",
    "$scope",
    "$interval",
    ShowFunction
  ]);


  function ShowFunction(LineFactory, $stateParams, $state, $scope, $interval){
    console.log("in controller");
    var self=this;
    this.line = window.staticLines[$stateParams.ln]
    this.trackInfo = {
      totalDistance: this.line.totalDist,
      miles: (this.line.totalDist/5280).toFixed(2),
      numStations: this.line.numStations,
      alerts: []
    }
    this.initArrays = function() {
      self.timesIn = [];
      self.timesOut = [];
      self.stations = [];
    }
    this.initArrays()
    this.getData = function() {
      self.initArrays()
      LineFactory.get({ln: $stateParams.ln}, function(res){
        self.line.stations = res.stations;
        for (var i=0; i<self.line.stations.length; i++){
          self.stations.push(res.stations[i].name);
          if (res.stations[i].trainsIn[0]){
            self.timesIn.push(res.stations[i].trainsIn[0].status)
          } else {
            self.timesIn.push("N/A");
          }
          if (res.stations[i].trainsOut[0]){
            self.timesOut.push(res.stations[i].trainsOut[0].status || null)
          }else{
            self.timesOut.push("N/A");
          }
        }
      });
    }
    this.getData()
    //SET THIS INTERVAL
    // $interval(this.getData, 5000);

    this.show = false;
    var counter = 0;
    this.showTimes = function(stop) {
      if (counter>=1){
        this.station2 = stop;
        this.distance = 0;
        this.mins = 0;
        var index1 = this.station.sequence-1;
        var index2 = this.station2.sequence-1;
        if (index2>index1){
          for (var j=index2; j>index1; j--){
            this.distance+=this.line.stations[j].distPrev;
            this.mins+=this.line.stations[j].timePrev;
          }
        } else if (index1>index2) {
          for (var j=index1; j>index2; j--){
            this.distance+=this.line.stations[j].distPrev;
            this.mins+=this.line.stations[j].timePrev;
          }
        } else {
          console.log("Same station selected.")
        }
        this.distance = (this.distance/5280).toFixed(2);
        counter = 0;
        // this.show= true;
      }else {
        counter++;
        this.station = stop;
        this.station2 = "";
      }
    }
  }
})();

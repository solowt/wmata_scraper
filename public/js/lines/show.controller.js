(function(){
  angular
  .module("lines")
  .controller("LineShowController", [
    "LineFactory",
    "DelayFactory",
    "$stateParams",
    "$state",
    "$scope",
    "$interval",
    ShowFunction
  ]);

  function ShowFunction(LineFactory, DelayFactory, $stateParams, $state, $scope, $interval){
    // console.log("in controller");
    var self=this;
    this.delays = [];
    DelayFactory.query({}, function(res){
      for (var j=0; j<res.length; j++){
        for (var k=0; k<res[j].lines.length; k++){
          if ($stateParams.ln == res[j].lines[k]){
            self.delays.push(res[j]);
          }
        }
      }
    });
    helper.addHash();
    this.line = helper.staticLines[$stateParams.ln];
    this.trackInfo = {
      totalDistance: this.line.totalDist,
      miles: (this.line.totalDist/5280).toFixed(2),
      numStations: this.line.numStations
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
    $interval(this.getData, 10000);

    this.show = false;
    var counter = 0;
    this.showTimes = function(stop) {
      if (counter == 2){
        counter = 0;
        $("#"+this.station2.name.hashCode()).removeClass("highlight");
        $("#"+this.station.name.hashCode()).removeClass("highlight");
      }
      if (counter==1){
        this.station2 = stop;
        $("#"+this.station2.name.hashCode()).addClass("highlight");
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
        counter++;
        // this.show= true;
      }else if (counter==0){
        counter++;
        this.station = stop;
        this.station2 = "";
        $("#"+this.station.name.hashCode()).addClass("highlight")

      }
    }
  }
})();

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
    console.log("in controller");
    helper.addHash();
    var self=this;
    this.delays = [];
    this.initArrays = function() {
      self.timesIn = [];
      self.timesOut = [];
      self.stations = [];
    }
    this.initArrays()
    this.line = helper.staticLines[$stateParams.ln];

    this.trackInfo = {
      totalDistance: this.line.totalDist,
      miles: (this.line.totalDist/5280).toFixed(2),
      numStations: this.line.numStations
    }

    this.getDelays = function() {
      DelayFactory.query({}, function(res){
        for (var j=0; j<res.length; j++){
          for (var k=0; k<res[j].lines.length; k++){
            if ($stateParams.ln == res[j].lines[k]){
              self.delays.push(res[j]);
            }
          }
        }
      });
    }


    self.getDelays();
    this.getData = function() {
      self.initArrays();
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
    $interval(this.getData, 10000);

    this.show = false;
    this.counter = 0;
    this.index1;
    this.index2;
    this.showTimes = function(stop) {
      if (self.counter == 2){
        self.counter = 0;
        $("#"+self.station2.name.hashCode()).removeClass("highlight");
        $("#"+self.station.name.hashCode()).removeClass("highlight");
        self.index1 = null;
        self.index2 = null;
      }
      if (self.counter==1){
        self.station2 = stop;
        $("#"+self.station2.name.hashCode()).addClass("highlight");
        self.index2 = this.line.stations.indexOf(self.station2);
        this.distance = 0;
        this.mins = 0;
        var index1 = self.station.sequence-1;
        var index2 = self.station2.sequence-1;
        if (index2>index1){
          for (var j=index2; j>index1; j--){
            this.distance+=self.line.stations[j].distPrev;
            this.mins+=self.line.stations[j].timePrev;
          }
        } else if (index1>index2) {
          for (var j=index1; j>index2; j--){
            this.distance+=self.line.stations[j].distPrev;
            this.mins+=self.line.stations[j].timePrev;
          }
        } else {
          console.log("Same station selected.")
        }
        this.distance = (this.distance/5280).toFixed(2);
        self.counter++;
        // this.show= true;
      }else if (self.counter==0){
        self.counter++;
        self.station = stop;
        self.station2 = "";
        $("#"+self.station.name.hashCode()).addClass("highlight")
        self.index1 = this.line.stations.indexOf(self.station);

      }
    }
  }
})();

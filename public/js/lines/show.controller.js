(function(){
  angular
  .module("lines")
  .controller("LineShowController", [
    "LineFactory",
    "$stateParams",
    "$state",
    "$scope",
    ShowFunction
  ]);


  function ShowFunction(LineFactory, $stateParams, $state, $scope){
    console.log("in controller");
    var self=this;

    this.staticLines = window.staticLines;
    this.lineParams= $stateParams.ln;
    this.line = this.staticLines[this.lineParams];
    this.timesIn = [];
    this.timesOut = [];
    this.stations = [];

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
    
    // this.line=LineFactory.get({ln: $stateParams.ln}, function(res){
    //   for (var i=0; i<self.line.stations.length; i++){
    //     self.stations.push(self.line.stations[i].name);
    //     if (self.line.stations[i].trainsIn[0]){
    //       self.timesIn.push(self.line.stations[i].trainsIn[0].status)
    //     } else {
    //       self.timesIn.push("N/A");
    //     }
    //     if (self.line.stations[i].trainsOut[0]){
    //       self.timesOut.push(self.line.stations[i].trainsOut[0].status || null)
    //     }else{
    //       self.timesOut.push("N/A");
    //     }
    //   }
    // });


    // maybe set interval here
    // setTimeout(function(){
    //   self.line=LineFactory.get({ln:$stateParams.ln}, function(){console.log("aa")});
    // }, 5000)
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
        console.log(this.distance);
        console.log(this.mins);
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

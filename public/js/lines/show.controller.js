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
    console.log("in controller")
    var self=this;
    this.line = LineFactory.get({ln: $stateParams.ln});
    //maybe set interval here
    // setTimeout(function(){
    //   self.line=LineFactory.get({ln:'RD'})
    //   console.log($scope)
    // }, 3000)
    this.showTimes = function(stop) {
      this.station = stop;
    }
  }
})();

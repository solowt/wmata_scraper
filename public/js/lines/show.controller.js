(function(){
  angular
  .module("lines")
  .controller("LineShowController", [
    "LineFactory",
    "$stateParams",
    ShowFunction
  ]);


  function ShowFunction(LineFactory, $stateParams){
    // add a set interval to refresh data
    this.line = LineFactory.get({ln: $stateParams.ln});
  }
})();

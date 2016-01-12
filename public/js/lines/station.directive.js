(function(){
  angular
  .module("lines")
  .directive("station", [
    "$state",
    stationDirFunction
  ])

  function stationDirFunction($state){
    return {
      templateUrl: "js/lines/station.html",
      replace: true,
      // controller: "LineShowController",
      restrict: "E",
      scope: {
        stop: '=',
        vm: '='
      },
      link: function(scope){
        console.log("In directive.")
      }
    }
  }
})();

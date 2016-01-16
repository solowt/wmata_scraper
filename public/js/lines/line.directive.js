(function(){
  angular
  .module("lines")
  .directive("line", [
    "$state",
    stationDirFunction
  ])

  function stationDirFunction($state){

    return {
      templateUrl: "js/lines/line.html",
      replace: true,
      // controller: "LineShowController",
      bindToController: true,
      restrict: "E",
      scope: {
        line: '=',
        vm: '='
        // $scope: '='
      },
      link: function(scope){
        scope.$watch("line.stations", function(){
          setTimeout(function(){
            if (scope.vm.station2){
              $("#"+scope.vm.station2.name.hashCode()).addClass("highlight");
            }
            if (scope.vm.station){
              $("#"+scope.vm.station.name.hashCode()).addClass("highlight");
            }
          }, 50)
        });
        scope.sendData = function(stop) {
          scope.vm.showTimes(stop);
        }
      }
    }
  }
})();

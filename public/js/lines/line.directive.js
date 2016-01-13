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
        // scope.line = scope.vm.line;
        scope.sendData = function(stop) {
          scope.vm.showTimes(stop);
        }
        console.log("In line directive.");
      }
    }
  }
})();

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
      restrict: "E",
      scope: {
        line: '=',
        vm: '=',
        index1: '=',
        index2: '='
      },
      link: function(scope){
        scope.sendData = function(stop) {
          scope.vm.showTimes(stop);
        }
      }
    }
  }
})();

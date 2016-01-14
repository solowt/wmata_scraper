(function(){
  angular
  .module("lines")
  .directive("rail", [
    "$state",
    railDirFunction
  ])

  function railDirFunction($state){

    return {
      templateUrl: "js/lines/rail.html",
      replace: true,
      // controller: "LineShowController",
      bindToController: true,
      restrict: "E",
      scope: {
        times: '=',
        stations: '=',
        str: '@'
      },
      link: function(scope, elm){
        scope.trainTemplate="<div class='trainwrapper'><div class='trainbody'><div class='car'></div><div class='link'></div><div class='car'></div><div class='link'></div><div class='car'></div></div></div>"
        // $(scope.trainTemplate).appendTo($("body")) works
        if(scope.str == "top"){
          scope.direction = "→"
        } else {
          // console.log("ASASASSA")
          scope.direction = "←"
        }
        // console.log(scope.str)
        scope.convert = function(strCode){
          if (strCode == "BRD" || strCode == "ARR"){
            return 0;
          } else if (strCode == "N/A" && scope.strCode=="top") { // return high number?
            return -1000;
          } else if (strCode == "N/A" && scope.strCode=="bot"){
            return 1000;
          } else{
            return parseInt(strCode);
          }
        }
        scope.drawTrains = function(index, str) {
          if (str=="top" && scope.convert(scope.times[index])-scope.convert(scope.times[index+1]) >= 0){
              $("#"+str+(index+1)).addClass("train");
          } else if (str == "bot" && scope.convert(scope.times[index])-scope.convert(scope.times[index+1]) <= 0){
              $("#"+str+(index)).addClass("train");
          }
        }
        console.log("In rail directive.");
      }
    }
  }
})();

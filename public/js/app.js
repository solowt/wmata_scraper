(function (){
  angular
  .module("dcTrains", [
    "ui.router",
    "lines"
  ])
  .config([
    "$stateProvider",
    RouterFunction
  ])

  function RouterFunction($stateProvider, $locationProvider){
    $stateProvider
    .state("getLines", {
      url: "/index",
      templateUrl: "js/lines/index.html",
      controller: "LinesController",
      controllerAs: "LinesViewModel"
    });
  }
})();

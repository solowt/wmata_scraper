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
    })
    .state("lineShow", {
      url: "/index/:ln",
      templateUrl: "js/lines/show.html",
      controller: "LineShowController",
      controllerAs: "LineShowViewModel"
    });
  }
})();

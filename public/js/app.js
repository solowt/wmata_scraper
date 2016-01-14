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
    .state("lineShow", {
      url: "/index/:ln",
      templateUrl: "js/lines/show.html",
      controller: "LineShowController",
      controllerAs: "LineShowViewModel"
    });
  }
})();

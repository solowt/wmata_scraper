"use strict";

(function(){
  angular
  .module("lines")
  .factory("DelayFactory", [
    "$resource",
    DelayFactoryFunction
  ]);

  function DelayFactoryFunction($resource){
    return $resource("https://dc-trains.herokuapp.com/incidents", {});
  }
}());

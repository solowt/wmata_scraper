"use strict";

(function(){
  angular
  .module("lines")
  .factory("DelayFactory", [
    "$resource",
    DelayFactoryFunction
  ]);

  function DelayFactoryFunction($resource){
    return $resource("https://infinite-spire-8251.herokuapp.com/incidents", {});
  }
}());

"use strict";

(function(){
  angular
  .module("lines")
  .factory("DelayFactory", [
    "$resource",
    DelayFactoryFunction
  ]);

  function DelayFactoryFunction($resource){
    return $resource("http://localhost:3000/incidents", {});
  }
}());

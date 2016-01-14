"use strict";

(function(){
  angular
  .module("lines")
  .factory("LineFactory", [
    "$resource",
    LineFactoryFunction
  ]);

  function LineFactoryFunction($resource){
    return $resource("https://infinite-spire-8251.herokuapp.com/lines:ln", {});
  }
}());

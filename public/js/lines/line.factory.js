"use strict";

(function(){
  angular
  .module("lines")
  .factory("LineFactory", [
    "$resource",
    LineFactoryFunction
  ]);

  function LineFactoryFunction($resource){
    return $resource("https://dc-trains.herokuapp.com/lines/:ln", {});
  }
}());

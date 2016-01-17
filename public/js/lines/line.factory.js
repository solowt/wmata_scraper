"use strict";

(function(){
  angular
  .module("lines")
  .factory("LineFactory", [
    "$resource",
    LineFactoryFunction
  ]);

  function LineFactoryFunction($resource){
    return $resource("localhost:3000/lines/:ln", {});
  }
}());

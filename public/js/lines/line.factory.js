"use strict";

(function(){
  angular
  .module("lines")
  .factory("LineFactory", [
    "$resource",
    LineFactoryFunction
  ]);

  function LineFactoryFunction($resource){
    return $resource("http://localhost:3000/lines/:ln", {})
    // http://localhost:3000/profiles/check?username
  }
}());

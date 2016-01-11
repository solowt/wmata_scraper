"use strict";

(function(){
  angular
  .module("lines")
  .controller("LinesController", [
    "$stateParams",
    LinesControllerFunction
  ]);
  function LinesControllerFunction($stateParams){
    console.log("aa")
  }
})();

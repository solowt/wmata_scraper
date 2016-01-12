"use strict";

(function(){
  angular
  .module("lines")
  .controller("LinesController", [
    "$stateParams",
    LinesControllerFunction
  ]);
  function LinesControllerFunction($stateParams){
    this.lines=["RD", "YL", "GR", "BL", "OR", "SV"];
  }
})();

"use strict";

(function(){
  angular
  .module("lines", [
    "ngResource",
    "btford.socket-io"
  ])
  .factory('mySocket', function(socketFactory){
    var mySocket = socketFactory();
    mySocket.forward('line');
    mySocket.forward('incidents');
    return mySocket;
  })
})();

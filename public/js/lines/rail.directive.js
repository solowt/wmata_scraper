(function(){
  angular
  .module("lines")
  .directive("rail", [
    "$state",
    railDirFunction
  ])

  function railDirFunction($state){

    return {
      templateUrl: "js/lines/rail.html",
      replace: true,
      // controller: "LineShowController",
      restrict: "E",
      scope: {
        vm: '=',
        times: '=',
        stations: '=',
        str: '@'
      },
      link: function(scope, elm){
        // console.log('In rail directive.')
        scope.$watchCollection("times", function() {
          setTimeout(function(){
            if (scope.str == "top"){
              $(".topTrain").remove()
            } else if (scope.str =="bot"){
              $(".botTrain").remove()
            }
            if (scope.times){
              scope.drawTrains();
            }
          },30)
        });

        scope.trains=[]

        var self = scope;
        scope.trainTemplate="<div class='trainwrapper'><div class='trainbody'><div class='car'></div><div class='link'></div><div class='car'></div><div class='link'></div><div class='car'></div><div class='link'></div><div class='car'></div></div></div>"
        scope.Train = function(dest, status){
          this.x = dest.left;
          this.y = dest.top;
          this.status = status;
          if (this.status != "ARR" && this.status != "BRD"){
            this.time = parseInt(this.status);
            this.ms = this.time*60000;
          }
          this.$el = $(scope.trainTemplate);
          if (scope.str=="top"){
            this.$el.addClass("topTrain");
          }else if (scope.str =="bot"){
            this.$el.addClass("botTrain")
          }
          this.offset = 0;
          // self.trains.push(this);
        }
        scope.Train.prototype.getOffset = function(){
          if (this.status == "BRD"){
            this.offset = 0;
          } else if (this.status == "ARR"){
            this.offset = 30;
          } else {
            this.offset = 40;
          }
        }
        scope.Train.prototype.append = function(){
          this.$el.appendTo($("body"));
          if (this.status == "ARR" && scope.str=="top"){
            this.$el.offset({top:this.y+15, left:this.x-this.offset});
          }else if (this.status == "BRD" && scope.str=="top"){
            this.$el.offset({top:this.y+45, left:this.x-this.offset});
          }else if(scope.str=="top") {
            this.$el.offset({top:this.y+30, left:this.x-this.offset});
          }
          if (scope.str == "bot"){
            if (this.status == "ARR"){
              this.$el.offset({top:this.y+30, left:this.x+this.offset});
            }else if (this.status == "BRD"){
              this.$el.offset({top:this.y+30, left:this.x+this.offset});
            }else{
              this.$el.offset({top:this.y+30, left:this.x+this.offset});

            }
          }
        }
        scope.Train.prototype.animate = function(){
          // console.log(s);
          if (this.status == "ARR"  && scope.str=="top") {
            this.$el.animate({left: this.x}, 30000);
          } else if (scope.str=="top") {
            this.$el.animate({left:this.x}, 35000);
          }
          if (this.status == "ARR" && scope.str =="bot"){
            this.$el.animate({left: this.x}, 30000);
          }else if (scope.str=="bot"){
            this.$el.animate({left:this.x}, 35000);
          }
        }
        scope.Train.prototype.delete = function(){
          this.$el.remove();
        }

        scope.convert = function(strCode){
          if (strCode == "BRD" || strCode == "ARR"){
            return 0;
          } else if (strCode == "N/A" && scope.strCode=="top") {
            return -1000;
          } else if (strCode == "N/A" && scope.strCode=="bot"){
            return 1000;
          } else{
            return parseInt(strCode);
          }
        }
        scope.drawTrains = function() {
          if (scope.str=="top"){
            for (var i = 0; i<scope.times.length; i++){

              if (scope.times[i] == "BRD" && $("#"+scope.str+(i)).offset()){
                var aTrain = new scope.Train($("#"+scope.str+(i)).offset(), scope.times[i]);
                aTrain.getOffset();
                aTrain.append();

              }else if (scope.times[i] == "ARR" && $("#"+scope.str+(i)).offset()){
                var bTrain = new scope.Train($("#"+scope.str+(i)).offset(), scope.times[i]);
                bTrain.getOffset();
                bTrain.append();
                bTrain.animate();

              }else if(scope.times[i]=="N/A" && scope.times[i]!="BRD" && scope.times[i]!="ARR"){
                if (scope.times[i+1] != "BRD" && scope.times[i+1] != "ARR" && parseInt(scope.times[i+1]) <=3){
                  var vTrain = new scope.Train($("#"+scope.str+(i+1)).offset(), scope.times[i]);
                  vTrain.getOffset();
                  vTrain.append();
                  vTrain.animate();
                }
              }else if (scope.times[i+1] != "ARR" && scope.times[i+1] != "BRD" && parseInt(scope.times[i])-scope.convert(scope.times[i+1]) > 0) {
                var cTrain = new scope.Train($("#"+scope.str+(i+1)).offset(), scope.times[i]);
                cTrain.getOffset();
                cTrain.append();
                cTrain.animate();
              }
            }
          }else if (scope.str=="bot"){
            for (var i = 0; i<scope.times.length; i++){

              if(scope.times[i] == "BRD" && $("#"+scope.str+(i)).offset()){
                var lTrain = new scope.Train($("#"+scope.str+(i)).offset(), scope.times[i]);
                lTrain.getOffset();
                lTrain.append();
              }
              else if(scope.times[i] == "ARR" && $("#"+scope.str+(i)).offset()){
                var kTrain = new scope.Train($("#"+scope.str+(i)).offset(), scope.times[i]);
                kTrain.getOffset();
                kTrain.append();
                kTrain.animate();
              }
              else if(scope.times[i]=="N/A" && scope.times[i]!="BRD" && scope.times[i]!="ARR"){
                if (scope.times[i-1] != "BRD" && scope.times[i-1] != "ARR" && parseInt(scope.times[i-1]) <=3){
                  var pTrain = new scope.Train($("#"+scope.str+(i-1)).offset(), scope.times[i]);
                  pTrain.getOffset();
                  pTrain.append();
                  pTrain.animate();
                }
              }
              else if (scope.times[i-1] != "ARR" && scope.times[i-1] != "BRD" && parseInt(scope.times[i])-scope.convert(scope.times[i-1]) > 0) {
                var yTrain = new scope.Train($("#"+scope.str+(i-  1)).offset(), scope.times[i]);
                yTrain.getOffset();
                yTrain.append();
                yTrain.animate();
              }
            }
          }
        }
      }
    }
  }
})();

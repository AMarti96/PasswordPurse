/**
 * Created by Lazarus of Bethany on 27/10/2017.
 */
'use strict';

angular.module('gitHubApp')
    .controller('PaintAnImageCtrl', function ($scope, $rootScope, $timeout, $location) {
        $rootScope.navbarActive = "demos";


        var myNetwork=null;
        var perceptron = null;
        var worker = null;
        var index = 0;
        var input_data = null;
        var canvas = null;
        var context = null;
        var size = 125 * 125;
        var iteration = 0;
        var to = null;
        var px = null;
        var myOptions={log:NaN,error:0.001,iterations:100000,rate:0.2};

        var getData = function(imageObj){

            canvas = canvas || document.getElementById('canvas-demo4');
            context = context || canvas.getContext('2d');

            context.drawImage(imageObj, 0, 0);

            var imageData = context.getImageData(0, 0, 125, 125);
            return imageData.data;
        };

        var train = $scope.train = function(){

            $scope.trainingStarted = true;

            iteration = 0;
            to && clearTimeout(to);
            //var myLiquidStateMachine = new Architect.Liquid(input, pool, output, connections, gates);

            //myNetwork= new neataptic.architect.Perceptron(2,5,3);
            perceptron = new synaptic.Architect.Perceptron(2,30,3);
            input_data = getData(document.getElementById('input'));
            $(".train").show();
            preview();
        };

        var iterate = function(){

            for (var x = 0; x < 125; x+=1)
            {
                for(var y = 0; y < 125; y+=1)
                {
                    //var myTrainingSet = [{input:[x/125,y/125], output: pixel(input_data,x,y)}];
                    //myNetwork.train(myTrainingSet,myOptions);
                    var dynamicRate =  .01/(1+.0005*iteration);
                    px = pixel(input,x,y);
                    perceptron.activate([x/125,y/125]);
                    perceptron.propagate(dynamicRate, pixel(input_data,x,y));
                }
            }
            preview();
        };

        var pixel = function(data,x,y){

            var red = data[((125 * y) + x) * 4];
            var green = data[((125 * y) + x) * 4 + 1];
            var blue = data[((125 * y) + x) * 4 + 2];

            return [red / 255, green / 255, blue / 255];
        };

        var preview = function(){
            $('#iterations').text(++iteration);
            var imageData = context.getImageData(0, 0, 125, 125);
            for (var x = 0; x < 125; x++)
            {
                for(var y = 0; y < 125; y++)
                {
                    //var rgb = myNetwork.activate([x/125,y/125]);
                    var rgb= perceptron.activate([x/125,y/125]);
                    imageData.data[((125 * y) + x) * 4] = (rgb[0] )* 255;
                    imageData.data[((125 * y) + x) * 4 + 1] = (rgb[1] ) * 255;
                    imageData.data[((125 * y) + x) * 4 + 2] = (rgb[2] ) * 255;
                }
            }
            context.putImageData(imageData,0,0);

            if ($location.$$path == '/paint-an-image')
                requestAnimationFrame(iterate);
        }
    });
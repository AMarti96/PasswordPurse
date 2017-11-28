/**
 * Created by Lazarus of Bethany on 25/10/2017.
 */
'use strict';

angular.module('gitHubApp')
    .controller('ImageFiltersCtrl', function ($scope, $rootScope, $timeout, $location,$q) {
        $rootScope.navbarActive = "demos";
        $scope.disableTrain = false;

        var evolve=0;
        var myNetwork=null;
        //var perceptron = null;
        var index = 0;
        var color_data = null;
        var filtered_data = null;
        var original_data = null;
        var canvas = null;
        var context = null;
        var size = 125 * 125;
        var trial = 0;
        //var px = null;
        var gamma=0.999;
        var myOptions={log:NaN,error:0.001,iterations:100,rate:0.2,cost:neataptic.methods.cost.MSE,ratePolicy:neataptic.methods.rate.EXP(gamma)};
        var evolveOptions={log:NaN,error:0.01,iterations:1000,mutation:neataptic.methods.mutation.FFW,equal:true,popsize:100,elitism:10,mutationRate:0.5};
        /*var myTrainingSet= [{input:[0,0],output:[0]},{input:[0,1],output:[1]},{input:[1,0],output:[1]},{input:[1,1],output:[0]}]
        var myNetwork= new neataptic.architect.Perceptron(2,3,1);
        myNetwork.train(myTrainingSet,myOptions)
        console.log(myNetwork.activate([1,1]))*/
        canvas = canvas || document.getElementById('canvas-demo3');
        context = context || canvas.getContext('2d');

        var getData = function(imageObj){

            canvas = canvas || document.getElementById('canvas-demo3');
            context = context || canvas.getContext('2d');

            context.drawImage(imageObj, 0, 0);

            var imageData = context.getImageData(0, 0, 125, 125);
            return imageData.data;
        };


        var train = $scope.train = function(){

            $scope.disableTrain = true;

            trial = 0;



            //var myLiquidStateMachine = new Architect.Liquid(input, pool, output, connections, gates);
            //perceptron = new synaptic.Architect.LSTM(3,6,3);
            myNetwork= new neataptic.architect.NARX(3,6,3,3,3);
            //myNetwork= new neataptic.architect.Perceptron(3,6,3);
            color_data = getData(document.getElementById('input'));
            filtered_data = getData(document.getElementById('output'));
            original_data = getData(document.getElementById('original'));
            if(trial=0) {
                var myTrainingSet = [{input: pixel(color_data, 0, 0), output: pixel(filtered_data, 0, 0)}];
                myNetwork.train(myTrainingSet, myOptions);
                var promise = asyncEvolve(myNetwork, myTrainingSet, trial);
                promise.then(function (res) {
                    console.log(res);
                })
            }

            if (!$scope.trainingStarted)
            {
                $scope.trainingStarted = true;
                iteration();
            }
        };

        function asyncEvolve (myTrainingSet) {
            var defered = $q.defer();
            var promise = defered.promise;
            while(evolve<100) {
                myNetwork.evolve(myTrainingSet,evolveOptions);
                evolve++;
                defered.resolve(myNetwork)

            }
            return promise
            }
        var iteration = function(){
            trial++;

            for (index = 0; index < size; index+=2)
            {
                var myTrainingSet=[{input:pixel(color_data, 0, 0),output:pixel(filtered_data,0,0)}];
                myNetwork.train(myTrainingSet,myOptions);

                asyncEvolve(myTrainingSet).then(function (res) {myNetwork=res});

                //myNetwork.evolve(myTrainingSet,evolveOptions)
                /*px = pixel(color_data, 0, 0);
                px = px.concat(pixel(color_data, -1, -1));
                px = px.concat(pixel(color_data, 0, -1));
                px = px.concat(pixel(color_data, 1, -1));
                px = px.concat(pixel(color_data, -1, 0));
                px = px.concat(pixel(color_data, 1, 0));
                px = px.concat(pixel(color_data, -1, 1));
                px = px.concat(pixel(color_data, 0, 1));
                px = px.concat(pixel(color_data, 1, 1));*/

                //perceptron.activate(px);
                //perceptron.propagate(.12, pixel(filtered_data,0,0));
            }
            preview();
        };

        var pixel = function(data, ox, oy){
            var y = index / 125 | 0;
            var x = index % 125;

            if (ox && (x + ox) > 0 && (x + ox) < 125)
                x += ox;
            if (oy && (y + oy) > 0 && (y + oy) < 125)
                y += oy;

            var red = data[((125 * y) + x) * 4];
            var green = data[((125 * y) + x) * 4 + 1];
            var blue = data[((125 * y) + x) * 4 + 2];

            return [red / 255, green / 255, blue / 255];
        };

        var preview = function(){
            $('#iterations').text(trial);

            var imageData = context.getImageData(0, 0, 125, 125);
            for (index = 0; index < size; index++)
            {
                var px = pixel(original_data, 0, 0);
                /*px = px.concat(pixel(original_data, -1, -1));
                px = px.concat(pixel(original_data, 0, -1));
                px = px.concat(pixel(original_data, 1, -1));
                px = px.concat(pixel(original_data, -1, 0));
                px = px.concat(pixel(original_data, 1, 0));
                px = px.concat(pixel(original_data, -1, 1));
                px = px.concat(pixel(original_data, 0, 1));
                px = px.concat(pixel(original_data, 1, 1));*/
                var rgb = myNetwork.activate(px);
                imageData.data[index * 4] = (rgb[0] )* 255;
                imageData.data[index * 4 + 1] = (rgb[1] ) * 255;
                imageData.data[index * 4 + 2] = (rgb[2] ) * 255;
            }
            context.putImageData(imageData,0,0);

            if ($location.$$path == '/image-filters')
                setTimeout(iteration, 100);
        };

    });

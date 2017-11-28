/**
 * Created by Lazarus of Bethany on 15/11/2017.
 */
/**
 * Created by Lazarus of Bethany on 27/10/2017.
 */
'use strict';

angular.module('gitHubApp')
    .controller('ClassifyColors', function ($scope, $rootScope, $timeout, $location,$q) {
        $rootScope.navbarActive = "demos";

        $scope.R=0;
        $scope.G=0;
        $scope.B=0;
        $scope.netR=0;
        $scope.netG=0;
        $scope.netB=0;
        var myNetwork= new neataptic.architect.Perceptron(3,6,3);
        var trainingSet = [
            { input: [0, 0, 0], output: [0, 0, 0] },
            { input: [0, 0, 0.25], output: [0, 0, 0.25] },
            { input: [0, 0, 0.5], output: [0, 0, 0.5] },
            { input: [0, 0, 0.75], output: [0, 0, 0.75] },
            { input: [0, 0, 1], output: [0, 0, 1] },
            ///////////////////////////////////////////////////////////7
            { input: [0, 0.25, 0], output: [0, 0.25, 0] },
            { input: [0, 0.5, 0], output: [0, 0.5, 0] },
            { input: [0, 0.75, 0], output: [0, 0.75, 0] },
            { input: [0, 1, 0], output: [0, 1, 0] },
            /////////////////////////////////////////////////////7
            { input: [0, 1, 0.25], output: [0, 1, 0.25] },
            { input: [0, 1, 0.5], output: [0, 1, 0.5] },
            { input: [0, 1, 0.75], output: [0, 1, 0.75] },
            { input: [0, 0.25, 1], output: [0, 0.25, 1] },
            { input: [0, 0.5, 1], output: [0, 0.5, 1] },
            { input: [0, 0.75, 1], output: [0, 0.75, 1] },
            { input: [0, 1, 1], output: [0, 1, 1] },
            //////////////////////////////////////////////////777
            { input: [0.25, 0, 0], output: [0.25, 0, 0] },
            { input: [0.5, 0, 0], output: [0.5, 0, 0] },
            { input: [0.75, 0, 0], output: [0.75, 0, 0] },
            { input: [1, 0, 0], output: [1, 0, 0] },
            ////////////////////////////////////////////////////
            { input: [1, 0, 0.25], output: [1, 0, 0.25] },
            { input: [1, 0, 0.5], output: [1, 0, 0.5] },
            { input: [1, 0, 0.75], output: [1, 0, 0.75] },
            { input: [0.25, 0, 1], output: [0.25, 0, 1] },
            { input: [0.5, 0, 1], output: [0.5, 0, 1] },
            { input: [0.75, 0, 1], output: [0.75, 0, 1] },
            { input: [1, 0, 1], output: [1, 0, 1] },
            /////////////////////////////////////////////////////////
            { input: [0.25, 1, 0], output: [0.25, 1, 0] },
            { input: [0.5, 1, 0], output: [0.5, 1, 0] },
            { input: [0.75, 1, 0], output: [0.75, 1, 0] },
            { input: [1, 0.25, 0], output: [1, 0.25, 0] },
            { input: [1, 0.5, 0], output: [1, 0.5, 0] },
            { input: [1, 0.75, 0], output: [1, 0.75, 0] },
            { input: [1, 1, 0], output: [1, 1, 0] },
            ////////////////////////////////////////////////////////////////
            { input: [1, 1, 0.25], output: [1, 1, 0.25] },
            { input: [1, 1, 0.5], output: [1, 1, 0.5] },
            { input: [1, 1, 0.75], output: [1, 1, 0.75] },
            { input: [1, 0.25, 1], output: [1, 0.25, 1] },
            { input: [1, 0.5, 1], output: [1, 0.5, 1] },
            { input: [1, 0.75, 1], output: [1, 0.75, 1] },
            { input: [0.25, 1, 1], output: [0.25, 1, 1] },
            { input: [0.5, 1, 1], output: [0.5, 1, 1] },
            { input: [0.75, 1, 1], output: [0.75, 1, 1] },
            { input: [1, 1, 1], output: [1, 1, 1] },
            ///////////////////////////////////////////////////////////////////
            { input: [0.25, 0.25, 1], output: [0.25, 0.25, 1] },
            { input: [0.5, 0.5, 1], output: [0.5, 0.5, 1] },
            { input: [0.75, 0.75, 1], output: [0.75, 0.75, 1] },
            { input: [0.25, 0.5, 1], output: [0.25, 0.5, 1] },
            { input: [0.25, 0.75, 1], output: [0.25, 0.75, 1] },
            { input: [0.5, 0.25, 1], output: [0.5, 0.25, 1] },
            { input: [0.75, 0.25, 1], output: [0.75, 0.25, 1] },
            { input: [0.5, 0.25, 1], output: [0.5, 0.25, 1] },
            { input: [0.75, 0.5, 1], output: [0.75, 0.5, 1] },
            { input: [0.75, 0.75, 1], output: [0.75, 0.75, 1] },
            ////////////////////////////////////////////////////////777
            { input: [0.25, 1, 0.25], output: [0.25, 1, 0.25] },
            { input: [0.5, 1,0.5 ], output: [0.5, 1,0.5 ] },
            { input: [0.75, 1,0.75 ], output: [0.75, 1,0.75 ] },
            { input: [0.25, 1,0.5 ], output: [0.25, 1,0.5 ] },
            { input: [0.25, 1,0.75 ], output: [0.25, 1,0.75 ] },
            { input: [0.5, 1,0.25 ], output: [0.5, 1,0.25 ] },
            { input: [0.75, 1,0.25 ], output: [0.75, 1,0.25 ] },
            { input: [0.5, 1,0.25 ], output: [0.5, 1,0.25 ] },
            { input: [0.75, 1,0.5 ], output: [0.75, 1,0.5 ] },
            { input: [0.75, 1,0.75 ], output: [0.75, 1,0.75 ] },
            ////////////////////////////////////////////////////////////////7
            { input: [1,0.25 , 0.25], output: [1,0.25 , 0.25] },
            { input: [1,0.5 ,0.5 ], output: [1,0.5 ,0.5 ] },
            { input: [1,0.75 ,0.75 ], output: [1,0.75 ,0.75 ] },
            { input: [1,0.25 ,0.5 ], output: [1,0.25 ,0.5 ] },
            { input: [1,0.25 ,0.75 ], output: [1,0.25 ,0.75 ] },
            { input: [1,0.5 ,0.25 ], output: [1,0.5 ,0.25 ] },
            { input: [1,0.75 ,0.25 ], output: [1,0.75 ,0.25 ] },
            { input: [ 1,0.5,0.25 ], output: [1,0.5 ,0.25 ] },
            { input: [1, 0.75,0.5 ], output: [1,0.75 ,0.5 ] },
            { input: [1,0.75 ,0.75 ], output: [1,0.75 ,0.75 ] },
            ////////////////////////////////////////////////////////////////
            { input: [0.25, 0.5, 1], output: [0.25, 0.5, 1] },
            { input: [0.25, 0.75, 1], output: [0.25, 0.75, 1] },
            { input: [0.25, 0.25, 0.25], output: [0.25, 0.25, 0.25] },
            { input: [0.5, 0.5, 0.5], output: [0.5, 0.5, 0.5] },
            { input: [0.75, 0.75, 0.75], output: [0.75, 0.75, 0.75] },
            { input: [1, 1, 1], output: [1, 1, 1] },

        ];

        var gamma=0.999;
        var myOptions={log:1000,error:0.0001,iterations:10000,rate:0.4,cost:neataptic.methods.cost.MSE,ratePolicy:neataptic.methods.rate.EXP(gamma)};
        myNetwork.train(trainingSet,myOptions);

       $scope.train = function(){

          var i=0;
          var r= $scope.R/255;
          var g= $scope.G/255;
          var b= $scope.B/255;
          while(i<1000) {
              var rgb = myNetwork.activate([r, g, b]);
              i++;
              $scope.netR=parseInt(rgb[0]*255);
              $scope.netG=parseInt(rgb[1]*255);
              $scope.netB=parseInt(rgb[2]*255);
          }
          //console.log(rgb)


            //var myLiquidStateMachine = new Architect.Liquid(input, pool, output, connections, gates);
            //perceptron = new synaptic.Architect.Perceptron(2,30,3);
        };

    });
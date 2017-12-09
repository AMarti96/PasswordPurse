(function() {
    'use strict';

    var app = angular.module('gitHubApp');
    app.controller('AdminCtrl',['adminSRV','nonRepMOD','$rootScope','$window','$scope','$location','$sessionStorage', function (adminSRV,nonRepMOD, $rootScope, $window, $scope, $location, $sessionStorage) {

        $rootScope.navbarActive = "home";

        $scope.Adminname = $sessionStorage.get("AdminName");
        var p=bigInt.zero;
        var q=bigInt.zero;
        var n=bigInt.zero;
        var d=bigInt.zero;
        var b=bigInt.zero;
        var serverN=bigInt.zero;
        var serverE=bigInt.zero;
        var e= bigInt(65537);

        $scope.users = [];

        angular.element(document).ready(function () {
            $scope.logged=false;
            $scope.genNRSA(function () {});
            $scope.serverData(function () {});
            $scope.generateTTP(function () {});
            $scope.getusers();


        });
        $scope.getusers=function(){
            adminSRV.getUsers(function (callback) {
                $scope.users = callback;

            },function (err) {
                alert(err)
            });
        };
        $scope.genNRSA=function () {

            var base=bigInt(2);
            var prime=false;

            while (!prime) {
                p = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
                prime = bigInt(p).isPrime()

            }
            prime = false;
            while (!prime) {
                q = bigInt.randBetween(base.pow(255), base.pow(256).subtract(1));
                prime = bigInt(q).isPrime()
            }
            var phi = p.subtract(1).multiply(q.subtract(1));
            n = p.multiply(q);
            d = e.modInv(phi);
        };
        $scope.serverData = function() {

            adminSRV.getAdminServer(function (data) {
                serverN= data.modulus;
                serverE= data.serverE
            });

        };
        $scope.generateTTP = function() {

            adminSRV.generateTTP(function (callback) {
                if(callback === "1"){
                }

            });

        };

        var elements = $('.reveal');
        var win = $(window);
        elements.css('opacity', 0);
        var isVisible = function(elem)
        {
            var docViewTop = win.scrollTop();
            var docViewBottom = docViewTop + win.height();

            var elemTop = elem.offset().top;
            var elemBottom = elemTop + elem.height();

            return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        };
        win.scroll(function(event) {
            elements.each(function(i, el) {
                var el = $(el);
                if (isVisible(el)) {
                    el.addClass("animated fadeInUp");
                }
            });
        });

        $scope.getadmins=function (user) {
            if(typeof user!=='undefined'){
                adminSRV.getadmins(user,function (data) {
                    $scope.admins=data;
                },function (error) {
                    console.log(error);
                })
            }
        };

        $scope.loginAdmins=function () {

            if($scope.user !== undefined) {
                if (($scope.admins) || ($scope.admin1) || ($scope.admin2) || ($scope.admin3) === undefined) {
                    alert("Please fill all the inputs")
                }
                else {
                    var data = {
                        admin1: $scope.admins[0],
                        passadmin1: $scope.admin1,
                        admin2: $scope.admins[1],
                        passadmin2: $scope.admin2,
                        admin3: $scope.admins[2],
                        passadmin3: $scope.admin3
                    };

                    adminSRV.loginadmins(data, function (data) {
                        $scope.parts = data;
                        console.log(data);
                        $scope.logged = true;

                    }, function (error) {
                        $scope.parts = error;
                    })
                }
            }
            else{
                alert("Please select user first")
            }


        };
        $scope.getUserSecrets=function () {

            if (($scope.user) && ($scope.category) != null) {

                var origin = name;
                var destination = "AdminServer";
                var thirdpart = "TTP";
                var server = 'http://localhost:3500/adminServer/repudiationSigned';
                var sharedKey = "Masmiwapo";
                var message = $scope.user+"."+$scope.category;

                console.log(message);
                nonRepMOD.sendMessageToAdminSever(origin, destination,thirdpart,server,sharedKey,d,n,e,message,function (buff) {

                    if (buff.origin === undefined) {
                        console.log("Error when sending message to admin")
                    }
                    else {
                        nonRepMOD.checkPayload(buff.origin, buff.destination, buff.message, serverE, serverN, buff.signature, function (res) {

                            if (res === 1) {

                                var ttp = 'http://localhost:3500/ttp/repudiationThirdPart';
                                console.log("Sharing key with ttp");
                                nonRepMOD.sendMessageToThirdPart(origin, destination, sharedKey, thirdpart, d, n, e, ttp, function (buff2) {

                                    nonRepMOD.checkPayloadTTP(buff2.origin, buff2.destination, buff2.key, buff2.TTPE, buff2.modulusTTP, buff2.thirdpart, buff2.signature, function (res2) {

                                        if (res2 === 1) {
                                            console.log("The shared key is: " + sharedKey);
                                            console.log("The message is: " + message);
                                        }

                                        else {
                                            $scope.results = "Error when checking payload"
                                        }

                                    });

                                });
                            }
                            else {
                                $scope.results = "Something went wrong..."
                            }
                        });
                    }
                });
            }
        }

    }]);
})();
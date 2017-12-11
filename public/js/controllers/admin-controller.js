(function() {
    'use strict';

    var app = angular.module('gitHubApp');
    app.controller('AdminCtrl',['adminSRV','nonRepMOD','$rootScope','$window','$scope','$location','$sessionStorage', function (adminSRV,nonRepMOD, $rootScope, $window, $scope, $location, $sessionStorage) {

        $rootScope.navbarActive = "home";

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
            $scope.adminServerData(function () {});
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
        $scope.adminServerData = function() {

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
                adminSRV.getadmins(user.name,function (data) {

                    $scope.admins=data;
                },function (error) {
                    console.log(error);
                })
            }
        };

        $scope.loginAdmins=function () {
            $scope.selecteduser=$scope.user;
            if(typeof $scope.user !== 'undefined') {

                if (($scope.admin1 === 'undefined') || ($scope.admin2 === 'undefined') || ($scope.admin3 === 'undefined')) {
                    alert("Please fill all the fields")
                }
                else {
                    var data = {
                        user:$scope.user._id,
                        admin1: $scope.admins[0],
                        passadmin1: CryptoJS.RIPEMD160($scope.admin1).toString(),
                        admin2: $scope.admins[1],
                        passadmin2: CryptoJS.RIPEMD160($scope.admin2).toString(),
                        admin3: $scope.admins[2],
                        passadmin3: CryptoJS.RIPEMD160($scope.admin3).toString()
                    };

                    adminSRV.loginadmins(data, function (data) {
                        $scope.parts1 = data[0];
                        $scope.parts2 = data[1];
                        $scope.parts3 = data[2];
                        $scope.logged = true;
                        adminSRV.getcategories($scope.user.name,function (callback) {
                            if (callback==='undefined'){
                                alert('Error')
                            }
                            else{
                                console.log(callback);
                                $scope.categories=callback
                            }
                        })

                    }, function (error) {
                        $scope.parts1 = error;
                        $scope.parts2 = error;
                        $scope.parts3 = error;
                    })
                }
            }
            else{
                alert("Please select user first")
            }


        };
        $scope.getUserSecrets=function () {

            if (($scope.user === 'undefined') || ($scope.category === undefined) || ($scope.part1 === undefined) || ($scope.part2 === undefined) || ($scope.part3 === undefined)) {
                alert("Please fill all the fields")
            }
            else {


                var origin = $scope.admins[0]+"."+$scope.admins[1]+"."+$scope.admins[2];
                var destination = "AdminServer";
                var thirdpart = "TTP";
                var server = 'http://localhost:3501/adminServer/repudiationSigned';
                var sharedKey = "Tardis";
                var admin1 = $scope.admins[0] + "-" + $scope.part1;
                var admin2 = $scope.admins[1] + "-" + $scope.part2;
                var admin3 = $scope.admins[2] + "-" + $scope.part3;
                var message = $scope.user + "." + $scope.category + "." + admin1 + "." + admin2 + "." + admin3;

                nonRepMOD.sendMessageToAdminSever(origin, destination, server, sharedKey, d, n, e, message, function (buff) {

                    if (buff.origin === undefined) {
                        console.log("Error when sending message to admin server")
                    }
                    else {
                        nonRepMOD.checkPayload(buff.origin, buff.destination, buff.message, serverE, serverN, buff.signature, function (res) {

                            if (res === 1) {

                                var ttp = 'http://localhost:3501/ttp/repudiationThirdPart';
                                console.log("Sharing key with ttp");

                                nonRepMOD.sendMessageToThirdPart(origin, destination, sharedKey, thirdpart, d, n, e, ttp, function (buff2) {

                                    nonRepMOD.checkPayloadFromTTP(buff2.origin, buff2.destination, buff2.key, buff2.TTPE, buff2.modulusTTP, buff2.thirdpart, buff2.signature, function (res2) {

                                        if (res2 === 1) {

                                            var notif = 'http://localhost:3501/adminServer/keyReady';

                                            var data = {
                                                AdminName:origin,
                                                url2:'http://localhost:3501/ttp/getAdminKey'
                                            };
                                            var dat = {
                                                url:notif,
                                                data:data
                                            };

                                            adminSRV.notifyAdminServer(dat,function (callback) {

                                                console.log(callback);


                                            },function (error) {
                                                alert(error);
                                            });
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
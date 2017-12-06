(function() {
'use strict';

var app = angular.module('gitHubApp');
app.controller('AdminMainCtrl',['adminSRV','nonRepMOD','$rootScope','$window','$scope','$location','$sessionStorage', function (adminSRV,nonRepMOD, $rootScope, $window, $scope, $location, $sessionStorage) {

    $rootScope.navbarActive = "home";
    $scope.loginAdmin=function () {

        $sessionStorage.put("AdminName",$scope.name);

        var data={
            name: $scope.name,
            password:$scope.password
        };
        adminSRV.loginAdmin(data,function (callback) {

            $sessionStorage.put("token",callback);

            $location.path('/adminPage')

        },function (err) {
            alert(err)
        })
    };

    }]);
})();
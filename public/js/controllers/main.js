(function() {
'use strict';

var app = angular.module('gitHubApp');
app.controller('MainCtrl',['clientSRV','$rootScope','$window','$scope','$location','$sessionStorage', function (clientSRV, $rootScope, $window, $scope, $location, $sessionStorage) {

    $scope.Saction=true;
    $scope.Slog=false;
    $scope.Ssign=false;

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

        $scope.Ssignup=function () {
            $scope.Saction = false;
            $scope.Ssign = true;

        };
        $scope.Slogin=function () {

            $scope.Saction = false;
            $scope.Slog = true;

        };
        $scope.signup=function () {

            var password=CryptoJS.RIPEMD160($scope.key).toString();
            var passHex=secrets.str2hex(password);
            var shares=secrets.share(passHex,3,3,512);

            var data={
            name: $scope.name,
            password: CryptoJS.RIPEMD160($scope.password).toString(),
            parts:shares

             };

        clientSRV.signup(data,function (callback) {

            $sessionStorage.put("token",callback);
            $location.path('/clientPage')

        },function (err) {
            alert(err)
        })

    };

    $scope.login=function () {

        var data={
            name: $scope.name,
            password:CryptoJS.RIPEMD160($scope.password).toString()
        };
        clientSRV.login(data,function (callback) {
            $sessionStorage.put("token",callback);
            $location.path('/clientPage')

        },function (err) {
            alert(err)
        })
    }

    }]);
})();
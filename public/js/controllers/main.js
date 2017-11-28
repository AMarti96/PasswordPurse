/**
 * Created by Lazarus of Bethany on 25/10/2017.
 */
(function() {
'use strict';

var app = angular.module('gitHubApp');
app.controller('MainCtrl',['clientSRV','$rootScope','$window','$scope','$location','$sessionStorage', function (clientSRV,$rootScope, $window,$scope,$location,$sessionStorage) {

    $rootScope.navbarActive = "home";

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
        
        $scope.signup=function () {

            var data={
            name: $scope.name,
            password: objectHash.sha1($scope.password)

        };

        clientSRV.signup(data,function (callback) {

            $location.path('/clientPage')

        },function (err) {
            alert(err)
        })

    };

    $scope.login=function () {


        var data={
            name: $scope.name,
            password:objectHash.sha1($scope.password)
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
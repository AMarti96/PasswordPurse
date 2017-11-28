/**
 * Created by Lazarus of Bethany on 28/11/2017.
 */

(function() {
    'use strict';

    var app = angular.module('gitHubApp');
    app.controller('ClientPageCtrl',['clientSRV','$rootScope','$window','$scope','$location','$sessionStorage', function (clientSRV,$rootScope, $window,$scope,$location,$sessionStorage) {

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

        $scope.newSecret=function () {

            var data={
                category: $scope.category,
                secret: objectHash.sha1($scope.secret),
                token:$sessionStorage.get("token")
            };

            clientSRV.newSecret(data,function (callback) {

            alert(callback)

            },function (err) {
                alert(err)
            })

        };

        $scope.getSecrets=function () {


            var data={
                category: $scope.category,
                token:$sessionStorage.get("token")
            };

            clientSRV.getSecrets(data,function (callback) {

                alert(callback)

            },function (err) {
                alert(err)
            })

        }

    }]);
})();
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

        function convertFromHex(hex) {
            var hex = hex.toString();
            var str = '';
            for (var i = 0; i < hex.length; i += 2){
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
            }
            return str; }

        $scope.newSecret=function () {

            var data={
                category: $scope.category,
                secret: CryptoJS.AES.encrypt($scope.secret,$scope.key).toString(),
                token:$sessionStorage.get("token")
            };

            clientSRV.newSecret(data,function (callback) {

            alert(callback)

            },function (err) {
                alert(err)
            })

        };

        $scope.getSecrets=function () {

            var password=CryptoJS.RIPEMD160($scope.key).toString();
            var passHex=secrets.str2hex(password);
            var shares=secrets.share(passHex,3,3,512);

            var data={
                category: $scope.category,
                parts:shares,
                token:$sessionStorage.get("token")
            };

            clientSRV.getSecrets(data,function (callback) {

                var response=CryptoJS.AES.decrypt(callback["0"].secrets["0"],$scope.key).toString()
                alert(convertFromHex(response))

            },function (err) {
                alert(err)
            })

        }

    }]);
})();
/**
 * Created by Lazarus of Bethany on 28/11/2017.
 */
(function() {
    'use strict';
    var app = angular.module('gitHubApp');
    app.service('clientSRV', ['$http',function ($http) {


        this.signup=function (newClient,callback,error) {

            var req = {
                method: 'POST',
                url: '/adminServer/signup',
                headers: {'Content-Type': 'application/json'},
                data: newClient

            };

            $http(req).then(function (response) {

                    callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        };

        this.login=function (logClient,callback,error) {

            var req = {
                method: 'POST',
                url: '/server/login',
                headers: {'Content-Type': 'application/json'},
                data: logClient

            };

            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        }

        this.newSecret=function (newSecret,callback,error) {

            var req = {
                method: 'POST',
                url: '/server/newsecret',
                headers: {'Content-Type': 'application/json'},
                data: newSecret

            };

            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        };
        this.getSecrets=function (Token,callback,error) {

            var req = {
                method: 'POST',
                url: '/server/getsecrets',
                headers: {'Content-Type': 'application/json'},
                data: Token

            };

            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        };



    }]);
})();

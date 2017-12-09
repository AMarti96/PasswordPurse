(function() {
    'use strict';
    var app = angular.module('gitHubApp');
    app.service('adminSRV', ['$http',function ($http) {

        this.loginAdmin=function (logClient,callback,error) {

            var req = {
                method: 'POST',
                url: '/adminServer/login',
                headers: {'Content-Type': 'application/json'},
                data: logClient

            };

            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        };
        this.getUsers=function (callback,error) {

            var req = {
                method: 'GET',
                url: '/adminServer/getusers',
                headers: {'Content-Type': 'application/json'}

            };
            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        };

        this.getAdminServer = function (callback) {

            $http.get('/adminServer/getServer').then(function (response) {
                callback (response.data);
            });

        };
        this.generateTTP = function (callback) {

            $http.get('/ttp/generateTTP').then(function (response) {
                callback (response.data);
            });

        };

        this.getUserSecrets=function (Token,callback,error) {

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

        this.getadmins=function (data,callback,error) {
            var req = {
                method: 'GET',
                url: '/adminServer/getadmins/'+data,
                headers: {'Content-Type': 'application/json'}

            };

            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        };

        this.loginadmins=function (data, callback,error) {
            var req = {
                method: 'POST',
                url: '/adminServer/loginadmins',
                headers: {'Content-Type': 'application/json'},
                data:data

            };

            $http(req).then(function (response) {

                callback (response.data);

            }).catch(function (err) {
                error(err.data)
            });
        }

    }]);
})();

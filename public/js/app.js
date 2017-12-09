'use strict';

angular
    .module('gitHubApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.bootstrap',
        'ngSessionStorage',
        'ngFileUpload'
    ])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'tpls/main.html',
                controller: 'MainCtrl'
            })
            .when('/clientPage', {
            templateUrl: 'tpls/clientPage.html',
            controller: 'ClientPageCtrl'
            })
            .when('/admin-Login', {
                templateUrl: 'tpls/adminLogin.html',
                controller: 'AdminMainCtrl'
            })
            .when('/admin', {
                templateUrl: 'tpls/adminPage.html',
                controller: 'AdminCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    });

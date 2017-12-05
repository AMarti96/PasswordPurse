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
            .otherwise({
                redirectTo: '/'
            });
    });

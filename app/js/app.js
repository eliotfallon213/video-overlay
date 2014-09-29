'use strict';


// Declare app level module which depends on filters, and services
angular.module('LimeApp', ['LimeApp.filters', 'LimeApp.services', 'LimeApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
    $routeProvider.when('/videoSelection', {templateUrl: 'partials/videoSelection.html', controller: 'VideoSelectionCtrl'});
    $routeProvider.when('/headTool/:headID', {templateUrl: 'partials/headTool.html', controller: 'HeadToolCtrl'});
    $routeProvider.when('/userDetails', {templateUrl: 'partials/userDetails.html', controller: 'UserDetailsCtrl'});
    $routeProvider.when('/viewVideo', {templateUrl: 'partials/viewVideo.html', controller: 'ViewVideoCtrl'});
    $routeProvider.otherwise({redirectTo: '/home'});
  }]);

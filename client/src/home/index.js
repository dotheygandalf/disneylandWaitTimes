(function() {
  'use strict';

  angular.module('disneylandCharts')
    .config(function($stateProvider) {
      $stateProvider.state( 'home', {
        url: '/',
        views: {
          main: {
            controller: 'homeCtrl',
            templateUrl: 'home/home.html'
          }
        }
      });
    });
})();
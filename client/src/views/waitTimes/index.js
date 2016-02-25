(function() {
  'use strict';

  angular.module('disneylandCharts')
    .config(function($stateProvider) {
      $stateProvider.state( 'waitTimes', {
        url: '/waitTimes',
        views: {
          main: {
            controller: 'waitTimesCtrl',
            templateUrl: 'views/waitTimes/waitTimes.html'
          }
        }
      });
    });
})();
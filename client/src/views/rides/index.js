(function() {
  'use strict';

  angular.module('disneylandCharts')
    .config(function($stateProvider) {
      $stateProvider.state( 'rides', {
        url: '/rides',
        views: {
          main: {
            controller: 'ridesCtrl',
            templateUrl: 'views/rides/rides.html'
          }
        },
        data: {
          title: 'Rides'
        }
      });
    });
})();
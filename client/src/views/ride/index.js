(function() {
  'use strict';

  angular.module('disneylandCharts')
    .config(function($stateProvider) {
      $stateProvider.state( 'ride', {
        url: '/ride/:id',
        views: {
          main: {
            controller: 'rideCtrl',
            templateUrl: 'views/ride/ride.html'
          }
        },
        data: {
          title: 'Ride'
        }
      });
    });
})();
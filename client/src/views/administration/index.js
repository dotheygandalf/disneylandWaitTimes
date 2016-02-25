(function() {
  'use strict';

  angular.module('disneylandCharts')
    .config(function($stateProvider) {
      $stateProvider.state( 'administration', {
        url: '/administration',
        views: {
          main: {
            controller: 'administrationCtrl',
            templateUrl: 'views/administration/administration.html'
          }
        }
      });
    });
})();
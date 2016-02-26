(function() {
  'use strict';

  angular.module('disneylandCharts')
    .config(function($stateProvider) {
      $stateProvider.state( 'deals', {
        url: '/deals',
        views: {
          main: {
            controller: 'dealsCtrl',
            templateUrl: 'views/deals/deals.html'
          }
        },
        data: {
          title: 'Deals'
        }
      });
    });
})();
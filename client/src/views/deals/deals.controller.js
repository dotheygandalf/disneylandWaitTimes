(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('dealsCtrl', function($scope, $http, $interval) {

      $scope.currentTime = moment().format('h:mm a');
      $interval(function() {
        $scope.currentTime = moment().format('h:mm a');
      }, 15000);

      $http.get('/api/v1/waitTimes/rides/optimal').then(function(response) {
        $scope.optimalFastPasses = response.data;
      });
    });
})();
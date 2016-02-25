(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('dealsCtrl', function($scope, $http) {
      $http.get('/api/v1/waitTimes/rides/optimal').then(function(response) {
        $scope.optimalFastPasses = response.data;
      });
    });
})();
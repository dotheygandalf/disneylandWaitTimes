(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('ridesCtrl', function($scope, $http, $state, $stateParams) {
      $scope.rideInfo = function(rideId) {
        $state.go('ride', {
          id: rideId
        });
      };

      $http.get('/api/v1/rides').then(function(response) {
        $scope.rides = response.data;
      });
    });
})();
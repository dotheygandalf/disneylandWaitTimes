(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('administrationCtrl', function($scope, $http) {
      $http.get('api/v1/rides').then(function(response) {
        $scope.rides = response.data;
      });

      $scope.updateRide = function(rideId, enabled) {
        $http.put('api/v1/rides/' + rideId, {
          enabled: enabled
        }).then(function() {

        });
      };
    });
})();
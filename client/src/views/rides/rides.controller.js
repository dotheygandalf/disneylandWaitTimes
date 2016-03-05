(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('ridesCtrl', function($scope, $http, $state, $stateParams) {
      $scope.rideInfo = function(rideId) {
        $state.go('ride', {
          id: rideId
        });
      };

      $http.get('/api/v1/waitTimes/rides/summary').then(function(response) {
        var rides = _.sortBy(response.data, 'name');
        _.each(rides, function(ride) {
          var data = {};
          _.each(ride.waitTimes, function(waitTime) {
            var id = waitTime._id;
            var seconds = moment().year(id.year).dayOfYear(id.dayOfYear).hour(id.hour).unix();
            data[seconds] = Math.round(waitTime.average); 
          });
          ride.heatmapConfig = {
            start: moment().subtract(6, 'days').toDate(),
            data: data,
            domain: "day",
            subDomain: 'hour',
            subDomainTextFormat: '%H',
            range: 7,
            legend: [30 , 60, 90, 120],
            displayLegend: false,
            tooltip: false,
            itemName: ['minute', 'minutes']
          };
        });
        $scope.rides = rides;
      });
    });
})();
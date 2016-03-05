(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('homeCtrl', function($scope, $http) {

      $http.get('/api/v1/waitTimes/parks').then(function(response) {
        $scope.parkAverage = response.data;
        var data = {};
        _.each(response.data, function(day) {
          var seconds = moment().dayOfYear(day._id).unix();
          data[seconds] = Math.round(day.average);
        });
        $scope.heatmapConfig = {
          data: data,
          domain: "month",
          subDomain: 'x_day',
          range: 1,
          legend: [30 , 60, 90, 120],
          displayLegend: false,
          tooltip: false,
          itemName: ['minute', 'minutes']
        };
      });

      $http.get('api/v1/operationalHours').then(function(response) {
        $scope.californiaAdventureHours = response.data[0];
        $scope.disneylandHours = response.data[1];
      });
    });
})();
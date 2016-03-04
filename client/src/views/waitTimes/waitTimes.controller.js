(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('waitTimesCtrl', function($scope, $http) {
      $scope.activeState = function(active) {
        if(active) {
          return {
            'background-color': '#7dbf97'
          };
        } else {
          return {
            'background-color': '#f07b7b'
          };
        }
      };

      $scope.sparklineOptions = {
        chart: {
          type: 'sparklinePlus',
          height: 120,
          margin: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 60
          },
          x: function(d, i){
            return moment(d.x).valueOf();
          },
          y: function(d) {
            return d.y;
          },
          xTickFormat: function(d) {
              return d3.time.format('%_I: %M %p')(moment(d).toDate());
          },
          yTickFormat: function(d) {
              return d3.format()(d);
          },
          color: function() {
            return '#afafaf';
          },
          noData: 'No Data'
        }
      };

      $http.get('api/v1/operationalHours').then(function(response) {
        $scope.californiaAdventureHours = response.data[0];
        $scope.disneylandHours = response.data[1];

        $http.get('/api/v1/waitTimes/rides').then(function(response) {
          $scope.rides = _.chain(response.data).reject(function(ride) {
            if(ride.park === 'california_adventure') {
              if(moment.range($scope.californiaAdventureHours.openingTime, $scope.californiaAdventureHours.closingTime).contains(moment())) {
                return false;
              }
            }
            if(ride.park === 'disneyland') {
              if(moment.range($scope.disneylandHours.openingTime, $scope.disneylandHours.closingTime).contains(moment())) {
                return false;
              }
            }
            return true;
          }).map(function(ride) {
            ride.data = _.map(ride.waitTimes, function(waitTime) {
              return {
                x: moment(waitTime.date).toDate(),
                y: waitTime.minutes
              };
            });
            return ride;
          }).value();
        });
      });
    });
})();
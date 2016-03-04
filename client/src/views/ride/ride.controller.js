(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('rideCtrl', function($scope, $http, $stateParams) {

      $scope.chartOptions = {
        chart: {
          type: 'lineChart',
          height: 450,
          margin : {
              top: 20,
              right: 80,
              bottom: 50,
              left: 80
          },
          tooltip: {
            hidden: true
          },
          x: function(d){
            return d.x;
          },
          y: function(d){
            return d.y;
          },
          xAxis: {
              axisLabel: 'Time (ms)',
              tickFormat: function(d) {
                return d3.time.format('%I:%M %p')(new Date(d));
              }
          },
          yAxis: {
              axisLabel: 'Minutes',
              tickFormat: function(d){
                  return d3.format('d')(d);
              },
              axisLabelDistance: -10
          }
        }
      };

      $scope.chartData = function(waitTimes) {
        
      };


      $http.get('/api/v1/waitTimes/rides/dailyAverage/' + $stateParams.id).then(function(response) {
        $scope.days = response.data;
        $scope.days = _.map(response.data, function(day) {
          var values = _.map(day.waitTimes, function(waitTime) {
            return {
              x: moment(waitTime.date).toDate(),
              y: waitTime.minutes
            };
          });
          day.graph = [{
            key: 'Wait Time',
            values: values
          }];
          return day;
        });
      });
    })

    .filter('toDate', function() {
      return function(dayOfYear) {
        return moment().dayOfYear(dayOfYear).toDate();
      };
    });
})();
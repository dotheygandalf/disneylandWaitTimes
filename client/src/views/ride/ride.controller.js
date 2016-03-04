(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('rideCtrl', function($scope, $http, $q, $stateParams) {
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

      $http.get('/api/v1/rides/' + $stateParams.id).then(function(response) {
        $scope.ride = response.data;
      });

      $http.get('/api/v1/waitTimes/rides/' + $stateParams.id + '/days').then(function(response) {
        $scope.dailyAverages = response.data;
      });

      var statsPromise = $http.get('/api/v1/waitTimes/rides/' + $stateParams.id);

      statsPromise.then(function(response) {
        var data = {};
        _.each(response.data, function(day) {
          var seconds = moment().dayOfYear(day._id).unix();
          data[seconds] = Math.round(day.average);
        });
        $scope.heatmapConfig = {
          start: moment().subtract(2, 'months').toDate(),
          data: data,
          domain: "month",
          subDomain: 'x_day',
          range: 3,
          legend: [10, 30 , 60, 90, 120],
          displayLegend: false,
          tooltip: false,
          itemName: ['minute', 'minutes']
        };
      });

      statsPromise.then(function(response) {
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
    })

    .filter('dayOfWeek', function() {
      return function(dayOfWeek) {
        return moment().day(dayOfWeek).format('dddd');
      };
    });
})();
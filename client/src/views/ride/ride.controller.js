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
      
      $http.get('/api/v1/waitTimes/rides/' + $stateParams.id, {
        params: {
          groupBy: 'hour'
        }
      }).then(function(response) {
        var data = {};
        _.each(response.data, function(day) {
          var id = day._id;
          var seconds = moment().year(id.year).dayOfYear(id.dayOfYear).hour(id.hour).unix();
          data[seconds] = Math.round(day.average); 
        });
        $scope.heatMapData = true;
        $scope.heatmapConfig = {
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
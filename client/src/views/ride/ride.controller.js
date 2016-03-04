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

      var statsPromise = $http.get('/api/v1/waitTimes/rides/dailyAverage/' + $stateParams.id);

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

      $scope.setDayContent = function(date) {
        if(moment(date) > moment() || moment(date) <= moment('2-23-2016')) {
          return '';
        } else {
          var deferred = $q.defer();
          statsPromise.then(function(response) {
            $scope.days = response.data;
            if(_.find($scope.days, function(day) {
                return day._id === moment(date).dayOfYear();
              })) {
              deferred.resolve('active');
            } else {
              deferred.resolve('Down');
            }
          });
          return deferred.promise;
        }
      };
    })

    .filter('toDate', function() {
      return function(dayOfYear) {
        return moment().dayOfYear(dayOfYear).toDate();
      };
    });
})();
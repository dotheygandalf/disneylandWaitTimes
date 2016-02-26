(function() {
  'use strict';

  angular.module('disneylandCharts')
    .controller('dealsCtrl', function($scope, $http, $interval) {

      $scope.currentTime = moment().format('h:mm a');
      $interval(function() {
        $scope.currentTime = moment().format('h:mm a');
      }, 15000);

      $http.get('/api/v1/waitTimes/rides/optimal').then(function(response) {
        $scope.optimalFastPasses = _.map(response.data, function(ride) {
          var diff = moment(ride.fastPassWindow.startDate).diff(moment());
          ride.timeFromNow = Math.floor(diff / 60 / 1000);
          return ride;
        });
      });
    })

    .filter('humanize', function() {
      return function(duration) {
        return moment.duration(parseInt(duration, 10), 'minutes').humanize();
      };
    });
})();
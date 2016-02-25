(function() {
  'use strict';

  angular.module('disneylandCharts')
    .directive('navigation', function() {
      return {
        restrict: 'E',
        scope: true,
        templateUrl: 'navigation/navigation.html'
      };
    });
})();
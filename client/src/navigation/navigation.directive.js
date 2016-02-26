(function() {
  'use strict';

  angular.module('disneylandCharts')
    .directive('navigation', function() {
      return {
        restrict: 'E',
        scope: true,
        templateUrl: 'navigation/navigation.html',
        controller: function($scope, $mdSidenav, $log, $timeout) {
          $scope.toggleLeft = buildDelayedToggler('left');

          function buildDelayedToggler(navID) {
            return debounce(function() {
              $mdSidenav(navID)
                .toggle()
                .then(function () {
                  $log.debug("toggle " + navID + " is done");
                });
            }, 200);
          }

          function debounce(func, wait, context) {
            var timer;
            return function debounced() {
              var context = $scope,
                  args = Array.prototype.slice.call(arguments);
              $timeout.cancel(timer);
              timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
              }, wait || 10);
            };
          }

        }
      };
    });
})();
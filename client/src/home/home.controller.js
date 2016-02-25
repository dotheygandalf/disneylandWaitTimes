'use strict';

angular.module('disneylandCharts')
  .controller('homeCtrl', function($scope, $http) {
    $http.get('api/v1/operationalHours').then(function(response) {
      $scope.californiaAdventureHours = response.data[0];
      $scope.disneylandHours = response.data[1];
    });
  });
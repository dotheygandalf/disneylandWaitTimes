angular.module('disneylandCharts', [
  'templates-app',
  'ui.router',
  'ui.bootstrap',
  'angular.filter',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'nvd3'
])

.config(function($urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
  $urlMatcherFactoryProvider.strictMode(true);
})

.controller('mainCtrl', function($rootScope, $scope, $http, $state) {
  $scope.go = function(state) {
    $state.go(state);
  };

  $rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams, options) {
      if(toState.data) {
        $scope.title = toState.data.title;
      }
    });
});

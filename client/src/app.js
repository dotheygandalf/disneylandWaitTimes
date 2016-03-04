angular.module('disneylandCharts', [
  'templates-app',
  'ui.router',
  'ui.bootstrap',
  'angular.filter',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'nvd3',
  'materialCalendar'
])

.config(function($urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
  $urlMatcherFactoryProvider.strictMode(true);
})

.controller('mainCtrl', function($rootScope, $scope, $http, $state, $mdSidenav) {
  $scope.go = function(state) {
    $state.go(state);
    if($mdSidenav('nav').isOpen()) {
      $mdSidenav('nav').toggle();
    }
  };

  $scope.toggleNav = function() {
    $mdSidenav('nav').toggle();
  };

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
    if(toState.data) {
      $scope.title = toState.data.title;
    }
  });
});

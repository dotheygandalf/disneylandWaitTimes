angular.module('disneylandCharts', [
  'templates-app',
  'ui.router',
  'ui.bootstrap',
  'nvd3'
])

.config(function($urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
  $urlMatcherFactoryProvider.strictMode(true);
})

.controller('dummy', function($scope, $http) {

  $scope.xFunction = function(){
    return function(d){
      return d[0];
    };
  };

  $scope.yFunction = function(){
    return function(d){
      return d[1];
    };
  };

  $scope.sparklineOptions = {
    chart: {
        type: 'sparklinePlus',
        height: 120,
        width: 500,
        x: function(d, i){
          return moment(d.x).valueOf();
        },
        y: function(d) {
          return d.y;
        },
        xTickFormat: function(d) {
            return d3.time.format('%I: %M %p')(moment(d).toDate());
        },
        yTickFormat: function(d) {
            return d3.format()(d);
        },
        color: function() {
          return '#afafaf';
        },
        noData: 'No Data'
    }
  };


  $scope.chartOptions = {
    chart: {
      type: 'lineChart',
      height: 450,
      margin : {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
      },
      x: function(d){
        return d.x;
      },
      y: function(d){
        return d.y;
      },
      useInteractiveGuideline: true,
      dispatch: {
          stateChange: function(e){ console.log("stateChange"); },
          changeState: function(e){ console.log("changeState"); },
          tooltipShow: function(e){ console.log("tooltipShow"); },
          tooltipHide: function(e){ console.log("tooltipHide"); }
      },
      xAxis: {
          axisLabel: 'Time of Day',
          tickFormat: function(d) { return d3.time.format('%I:%M %p')(new Date(d)); }
      },
      yAxis: {
          axisLabel: 'Wait Times (Minutes)',
          tickFormat: function(d){
              return d3.format()(d);
          },
          axisLabelDistance: -10
      },
      stroke: true
    }
  };

  $http.get('/api/v1/waitTimes/rides/optimal').then(function(response) {
    $scope.optimalFastPasses = response.data;
  });

  $http.get('api/v1/operationalHours').then(function(response) {
    $scope.californiaAdventureHours = response.data[0];
    $scope.disneylandHours = response.data[1];

    $http.get('/api/v1/waitTimes/rides').then(function(response) {
      $scope.rides = _.chain(response.data).reject(function(ride) {
        if(ride.park === 'california_adventure') {
          if(moment.range($scope.californiaAdventureHours.openingTime, $scope.californiaAdventureHours.closingTime).contains(moment())) {
            return false;
          }
        }
        if(ride.park === 'disneyland') {
          if(moment.range($scope.disneylandHours.openingTime, $scope.disneylandHours.closingTime).contains(moment())) {
            return false;
          }
        }
        return true;
      }).map(function(ride) {
        ride.data = _.map(ride.waitTimes, function(waitTime) {
          return {
            x: moment(waitTime.date).toDate(),
            y: waitTime.minutes
          };
        });
        return ride;
      }).value();
    });
  });

  

  /*$http.get('/api/v1/waitTimes/rides/353355').then(function(response) {
    //filter function should be done on the api side
    $scope.chartData = _.chain(response.data).reject(function(day) {
        if(moment().day() === moment().dayOfYear(day._id).day()) {
          return false;
        }
        return true;
    }).map(function(day) {
      return {
        key: moment().dayOfYear(day._id).format('ddd, MMM D'),
        values: _.map(day.waitTimes, function(waitTime) {
          return {
            x: moment(waitTime.date).dayOfYear(1).toDate(),
            y: waitTime.minutes ? waitTime.minutes : null
          }
        })
      };
    }).value();
  });*/
});

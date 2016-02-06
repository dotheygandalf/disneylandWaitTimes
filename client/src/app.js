angular.module('disneylandCharts', [
  'ui.router',
  'nvd3'
])

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
          return d.x;
        },
        y: function(d) {
          return d.y;
        },
        xTickFormat: function(d) {
            return d3.time.format('%I: %M %p')(d);
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

  $http.get('/api/v1/rides').then(function(response) {
    $scope.rides = _.map(response.data, function(ride) {
      ride.data = _.map(ride.waitTime, function(waitTime) {
        return {
          x: new Date(waitTime.date),
          y: waitTime.minutes
        };
      });
      return ride;
    });
  });

  $http.get('/api/v1/rides/353355').then(function(response) {
    $scope.chartData = _.map(response.data, function(day) {
      return {
        key: moment().dayOfYear(day._id).format('ddd'),
        values: _.map(day.waitTimes, function(waitTime) {
          return {
            x: moment(waitTime.date).dayOfYear(1).toDate(),
            y: waitTime.minutes ? waitTime.minutes : null
          }
        })
      };
    });
  });
});

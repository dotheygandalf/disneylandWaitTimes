angular.module('disneylandCharts', [
  'ui.router',
  'nvd3'
])

.controller('dummy', function($scope, $http) {
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
          axisLabel: 'Time (ms)',
          tickFormat: function(d) { return d3.time.format('%H:%M')(new Date(d)); }
      },
      yAxis: {
          axisLabel: 'Minutes',
          tickFormat: function(d){
              return d3.format('.02f')(d);
          },
          axisLabelDistance: -10
      }
    }
  };

  $http.get('/api/v1/rides?metrics=true').then(function(response) {
    $scope.rides = response.data;
  });

  $http.get('/api/v1/rides/353355').then(function(response) {
    $scope.chartData = _.map(response.data, function(day) {
      return {
        key: moment().dayOfYear(day._id).format('ddd'),
        values: _.map(day.waitTimes, function(waitTime) {
          return {
            x: moment(waitTime.date).dayOfYear(1).toDate(),
            y: waitTime.minutes
          }
        })
      };
    });
  });
});

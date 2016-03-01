module.exports = {
  app: {
    js: [ 'client/src/**/*.js' ],
    html: [ 'client/src/**/*.html', '!client/src/index.html' ]
  },
  vendor: {
    js: [
      '/bower_components/moment/moment.js',
      '/bower_components/moment-range/dist/moment-range.js',
      '/bower_components/lodash/dist/lodash.js',
      '/bower_components/angular/angular.js',
      '/bower_components/angular-ui-router/release/angular-ui-router.js',
      '/bower_components/d3/d3.js',
      '/bower_components/nvd3/build/nv.d3.js',
      '/bower_components/angular-nvd3/dist/angular-nvd3.js'
    ]
  },
  css: [
    'bower_components/font-awesome/css/font-awesome.css',
    'bower_components/nvd3/build/nv.d3.css',
    'bower_components/bootstrap/dist/css/bootstrap.css'
  ]
};
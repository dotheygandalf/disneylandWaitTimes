'use strict';

var errors = require('./components/errors')
  , express = require('express');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/v1/rides', require('./api/ride'));
  app.use('/api/v1/operationalHours', require('./api/operationalHours'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};

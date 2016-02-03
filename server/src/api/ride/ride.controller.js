'use strict';

var _ = require('lodash');
var Ride = require('./ride.model');

exports.index = function(req, res) {
  Ride.find(function (err, rides) {
    if(err) { return handleError(res, err); }
    return res.json(200, rides);
  });
};
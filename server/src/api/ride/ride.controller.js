'use strict';

var _ = require('lodash')
  , Ride = require('./ride.model')
  , moment = require('moment');

exports.index = function(req, res) {
  Ride.find().exec(function(error, rides) {
    res.status(200).json(rides);
  });
};

function handleError(res, err, status) {
  return res.status(status || 500).json(err);
}

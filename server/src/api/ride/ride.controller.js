'use strict';

var _ = require('lodash')
  , Ride = require('./ride.model')
  , moment = require('moment');

exports.index = function(req, res) {
  Ride.find().select('-_id -__v').exec(function(error, rides) {
    res.status(200).json(rides);
  });
};

exports.update = function(req, res) {
  if(req.body) {
    Ride.update({
      id: req.params.id
    }, {
      enabled: req.body.enabled
    }).exec(function(error) {
      if(error) {
          return handleError(res, {
            message: 'whoops'
          }, 500);
        }
        return res.sendStatus(200);
      });
  }
};

function handleError(res, err, status) {
  return res.status(status || 500).json(err);
}

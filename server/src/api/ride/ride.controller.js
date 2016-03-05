'use strict';

var _ = require('lodash')
  , Ride = require('./ride.model')
  , moment = require('moment');

exports.index = function(req, res) {
  Ride.find({}).sort({name: 1}).select('-_id -__v').exec(function(error, rides) {
    res.status(200).json(rides);
  });
};

exports.show = function(req, res) {
  Ride.findOne({
    id: req.params.id
  }).select('-_id -__v').exec(function(error, ride) {
    if(error) {
      return handleError(res, {
        message: 'whoops'
      }, 500);
    }
    return res.status(200).json(ride);
  })
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

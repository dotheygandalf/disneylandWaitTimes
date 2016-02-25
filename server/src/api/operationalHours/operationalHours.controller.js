'use strict';

var OperationalHours = require('./operationalHours.model')
  , moment = require('moment');

exports.index = function(req, res) {
  if(req.query.startDate || req.query.endDate) {
    if(req.query.startDate && req.query.endDate) {
      OperationalHours.find({
        date: {
          $gte: moment(req.query.startDate).hour(0),
          $lt: moment(req.query.endDate).hour(24)
        }
      }).select('-_id -__v').sort('date').exec(function(err, operationalHours) {
        if(err) {
          return handleError(res, err);
        }
        return res.status(200).json(operationalHours);
      });
    } else {
      return handleError(res, {
        error: 'Both startDate and endDate are required query parameters.'
      }, 400);
    }
  } else {
    OperationalHours.find({}).select('-_id -__v').sort('date').exec(function(err, operationalHours) {
      if(err) {
        return handleError(res, err);
      }
      return res.status(200).json(operationalHours);
    });
  }
}

exports.todaysHours = function(req, res) {
  OperationalHours.find({
    date: moment().tz('America/Los_Angeles').startOf('day')
  }).exec(function(error, operationalHours) {
    if(error) {
        return handleError(res, error);
      }
      return res.status(200).json(operationalHours);
  });
};

exports.show = function(req, res) {
  var date = req.params.date;
  if(!date) {
    return handleError(res, {
      error: 'Date is required'
    });
  }
  OperationalHours.findOne({
    date: {
      $gte: moment(date).hour(0),
      $lt: moment(date).hour(24)
    }
  }).select('-_id -__v').exec(function(err, operationalHour) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(operationalHour);
  });
}

function handleError(res, err, status) {
  return res.status(status || 500).json(err);
}

'use strict';

var OperationalHours = require('./operationalHours.model')
  , moment = require('moment');

exports.index = function(req, res) {
	OperationalHours.find({}).select('-_id -__v').sort('date').exec(function(err, operationalHours) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(operationalHours);
	});
}

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
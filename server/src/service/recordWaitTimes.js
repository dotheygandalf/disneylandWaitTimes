'use strict';
var mongoose = require('mongoose')
	, _ = require('lodash')
	, moment = require('moment')
	, CronJob = require('cron').CronJob
	, Q = require('q')
	, OperationalHours = require('../api/operationalHours/operationalHours.model')
	, Ride = require('../api/ride/ride.model')
	, WaitTime = require('../api/waitTime/waitTime.model');

require('moment-range');
require('moment-timezone');

exports.start = function(parkAPI, parkId) {
	console.log('Start logging Disneyland wait times...');
	var job = new CronJob('00 */10 * * * *', function() {
		getData(parkAPI, parkId);
	}, function() {
		console.log('done');
	}, true, 'America/Los_Angeles');
	job.start();
};

function getData(parkAPI, parkId) {
	console.log('Start checking');
	console.log('Check time at:' + moment().tz('America/Los_Angeles').format('ddd, h:mmA'));
	checkDate(parkAPI, parkId).then(function(operationalHours) {
		console.log('hours received');
		var range = moment.range(moment(operationalHours.openingTime).tz('America/Los_Angeles'), moment(operationalHours.closingTime).tz('America/Los_Angeles'));
		if(range.contains(moment().tz('America/Los_Angeles'))) {
			console.log('Within park operating hours');
			console.log('Checking wait times...');
			checkAndRecordWaitTimes(parkAPI, parkId);
		} else {
			var openingHour = moment(operationalHours.openingTime).tz('America/Los_Angeles').format('ddd, h:mmA');
			var closingHour = moment(operationalHours.closingTime).tz('America/Los_Angeles').format('ddd, h:mmA');
			var currentHour = moment().tz('America/Los_Angeles').format('ddd, h:mmA');
			console.log('Park is closed: ' + openingHour + ' - ' + closingHour + '. It is currently ' + currentHour);
		}
	}, function() {
		console.log('oops');
	});
}

function checkDate(parkAPI, parkId) {
	console.log('checking date');
	var deferred = Q.defer();
	OperationalHours.findOne({
		park: parkId,
		date: {
      $gte: moment().tz('America/Los_Angeles').startOf('day'),
      $lt: moment().tz('America/Los_Angeles').endOf('day')
		}
	}, function(err, operationalHours) {
		if(err) {
			console.log('checkDate error');
			deferred.reject(err);
		}
		if(operationalHours) {
			deferred.resolve(operationalHours);
		} else {
			parkAPI.GetOpeningTimes(function(err, data) {
				if (err) {
					deferred.reject();
					return console.error("Error fetching Magic Kingdom schedule: " + err);
				}
				_.each(data, function(day) {
					OperationalHours.create({
						park: parkId,
						date: moment(day.date).toDate(),
						openingTime: moment(day.openingTime).toDate(),
						closingTime: moment(day.closingTime).toDate()
					}, function(err, operationalHours) {
						if(err) {
							deferred.reject(err);
							return;
						}
						if(moment().tz('America/Los_Angeles').dayOfYear() === moment(operationalHours.date).tz('America/Los_Angeles').dayOfYear()) {
							deferred.resolve(operationalHours);
						}
					});
				});
			});
		}
	});
	return deferred.promise;
}

function checkAndRecordWaitTimes(parkAPI, parkId) {
	parkAPI.GetWaitTimes(function(err, data) {
		if (err) {
			return console.error("Error fetching Magic Kingdom wait times: " + err);
		}
		var promises = [];
		_.each(data, function(rideData) {
			if(_.indexOf([
				'353305',
				'353313',
				'353315',
				'353309',
				'353321',
				'353329',
				'353335',
				'353351',
				'353353',
				'353395',
				'353461',
				'393385',
				'18237344',
				'17328049',
				'16581435',
				'17945184',
				'353339'], rideData.id) >= 0) {
				return;
			}

			var deferred = Q.defer();
			promises.push(deferred.promise);
			var startTime, endTime;
			if(rideData.fastPassWindow && rideData.fastPassWindow.startDate && rideData.fastPassWindow.endDate) {
				startTime = rideData.fastPassWindow.startDate.split(':');
				endTime = rideData.fastPassWindow.endDate.split(':');
			}

			Ride.findOrCreate({
				id: rideData.id,
				name: rideData.name,
				park: parkId
			}, _.noop);

			var waitTime = new WaitTime({
				park: parkId,
				id: rideData.id,
				name: rideData.name,
				fastPass: rideData.fastPass,
				active: rideData.active,
				minutes: rideData.waitTime,
				date: new Date(),
				fastPassWindow: {
					startDate: startTime ? moment().tz('America/Los_Angeles').hours(startTime[0]).minutes(startTime[1]).seconds(0) : undefined,
					endDate: endTime ? moment().tz('America/Los_Angeles').hours(endTime[0]).minutes(endTime[1]).seconds(0) : undefined
				}
			});
			waitTime.save(function(error) {
				if(error) {
					return deferred.reject();
				}
				return deferred.resolve();
			});
		});
		Q.all(promises).then(function() {
			console.log('Wait times recorded');
		}, function() {
			console.log('There was a problem recording wait times');
		});
	});
}

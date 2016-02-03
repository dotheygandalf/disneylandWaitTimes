var DisneyAPI = require("wdwjs")
	, mongoose = require('mongoose')
	, config = require('./config.js')
	, MagicKingdom = new DisneyAPI.DisneylandMagicKingdom()
	, _ = require('lodash')
	, moment = require('moment')
	, findOrCreate = require('mongoose-findorcreate')
	, CronJob = require('cron').CronJob
	, Q = require('q');

require('moment-range');
require('moment-timezone');

mongoose.connect(config.mongodb.url);
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	console.log('Start loggin Disneyland wait times...');
	getData();
	var job = new CronJob('00 */10 * * * *', getData, function() {
		console.log('done');
	}, true, 'America/Los_Angeles');
	job.start();
});

function getData() {
	console.log('Start checking');
	console.log('Check time at:' + moment().tz('America/Los_Angeles').format('ddd, h:mmA'));
	checkDate().then(function(operationalHours) {
		console.log('hours received');
		var range = moment.range(moment(operationalHours.openingTime).tz('America/Los_Angeles'), moment(operationalHours.closingTime).tz('America/Los_Angeles'));
		if(range.contains(moment().tz('America/Los_Angeles'))) {
			console.log('Within park operating hours');
			console.log('Checking wait times...');
			checkAndRecordWaitTimes();
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

var WaitTimeSchema = new mongoose.Schema({
	fastPass: Boolean,
	active: Boolean,
	minutes: Number,
	temperature: Number,
	humidity: Number,
	date: Date
});
var WaitTime = mongoose.model('WaitTime', WaitTimeSchema);

var RideSchema = new mongoose.Schema({
	id: String,
	name: String,
	waitTimes: [ WaitTime.schema ]
});
RideSchema.plugin(findOrCreate);
var Ride = mongoose.model('Ride', RideSchema);

var OperationalHoursSchema = new mongoose.Schema({
	date: Date,
	openingTime: Date,
	closingTime: Date
});
OperationalHoursSchema.plugin(findOrCreate);
var OperationalHours = mongoose.model('OperationalHours', OperationalHoursSchema);

function checkDate() {
	console.log('checking date');
	var deferred = Q.defer();
	OperationalHours.findOne({
		'date': {
			'$gte': moment().tz('America/Los_Angeles').startOf('day').toDate(),
			'$lte': moment().tz('America/Los_Angeles').endOf('day').toDate()
		}
	}, function(err, operationalHours) {
		if(err) { 
			console.log('checkDate error');
			deferred.reject(err);
		}
		if(operationalHours) {
			deferred.resolve(operationalHours);
		} else {
			MagicKingdom.GetOpeningTimes(function(err, data) {
					if (err) {
						deferred.reject();
						return console.error("Error fetching Magic Kingdom schedule: " + err);
					}
					_.each(data, function(day) {
						OperationalHours.create({
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

function checkAndRecordWaitTimes() {
	MagicKingdom.GetWaitTimes(function(err, data) {
		if (err) {
			return console.error("Error fetching Magic Kingdom wait times: " + err);
		}
		var promises = [];
		_.each(data, function(rideData) {
			var deferred = Q.defer();
			promises.push(deferred.promise);
			Ride.findOrCreate({
				id: rideData.id,
				name: rideData.name
			}, function(err, ride) {
				if(err) {
					console.log(err);
					deferred.reject();
				}
				ride.waitTimes.push({
					fastPass: rideData.fastPass,
					active: rideData.active,
					minutes: rideData.waitTime,
					date: new Date()
				});
				ride.save(function(err) {
					if(err) {
						return deferred.reject();
					}
					deferred.resolve();
				});
			});
		});
		Q.all(promises).then(function() {
			console.log('Wait times recorded');
		}, function() {
			console.log('There was a problem recording wait times');
		});
	});
}
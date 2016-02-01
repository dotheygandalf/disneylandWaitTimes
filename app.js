var DisneyAPI = require("wdwjs")
	, mongoose = require('mongoose')
	, MagicKingdom = new DisneyAPI.DisneylandMagicKingdom()
	, _ = require('lodash')
	, moment = require('moment')
	, findOrCreate = require('mongoose-findorcreate')
	, CronJob = require('cron').CronJob
	, Q = require('q');

mongoose.connect('mongodb://localhost/disneyland');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
	console.log('Start loggin Disneyland wait times...');
	var todaysJob;
	var job = new CronJob('00 */10 * * * *', function() {
		console.log('Start checking');
		console.log('Check time at:' + new moment().format('ddd, hA'));
		checkDate().then(function(operationalHours) {
			var openingHour = moment(operationalHours.openingTime).hours();
			var closingHour = moment(operationalHours.closingTime).hours();
			var currentHour = moment().hours();
			if((currentHour >= openingHour) && (currentHour <= closingHour)) {
				console.log('Within park operating hours');
				console.log('Checking wait times...');
				checkAndRecordWaitTimes();
			}
		}, function() {
			console.log('oops');
		});
	}, function() {
		console.log('done');
	}, true, 'America/Los_Angeles');
	job.start();
});

var WaitTimeSchema = new mongoose.Schema({
	rideId: String,
	rideName: String,
	fastPass: Boolean,
	active: Boolean,
	minutes: Number,
	temperature: Number,
	humidity: Number,
	date: Date
});
var WaitTime = mongoose.model('WaitTime', WaitTimeSchema);

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
			'$gte': moment().startOf('day').toDate(),
			'$lte': moment().endOf('day').toDate()
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
							if(moment().isSame(moment(operationalHours.date), 'day')) {
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
		_.each(data, function(ride) {
			var deferred = Q.defer();
			promises.push(deferred.promise);
			WaitTime.create({
				rideId: ride.id,
				rideName: ride.name,
				fastPass: ride.fastPass,
				active: ride.active,
				minutes: ride.waitTime,
				date: new Date()
			}, function(err) {
				if(err) {
					return deferred.reject();
				}
				deferred.resolve();
			});
		});
		Q.all(promises).then(function() {
			console.log('Wait times recorded');
		}, function() {
			console.log('There was a problem recording wait times');
		});
	});
}
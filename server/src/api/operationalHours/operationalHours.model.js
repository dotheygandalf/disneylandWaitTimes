'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , findOrCreate = require('mongoose-findorcreate');

var OperationalHoursSchema = new mongoose.Schema({
	date: Date,
	openingTime: Date,
	closingTime: Date
});

OperationalHoursSchema.plugin(findOrCreate);

module.exports = mongoose.model('OperationalHours', OperationalHoursSchema);
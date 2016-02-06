'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , findOrCreate = require('mongoose-findorcreate')
  , WaitTime = require('../waitTime/waitTime.model');

var RideSchema = new mongoose.Schema({
  park: String,
  id: String,
  name: String,
  waitTimes: [ WaitTime.schema ]
});

RideSchema.plugin(findOrCreate);

module.exports = mongoose.model('Ride', RideSchema);

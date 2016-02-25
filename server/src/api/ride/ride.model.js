'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , findOrCreate = require('mongoose-findorcreate');

var RideSchema = new mongoose.Schema({
  park: String,
  id: String,
  name: String,
  enabled: Boolean
});

RideSchema.plugin(findOrCreate);

module.exports = mongoose.model('Ride', RideSchema);
